"""
Módulo de scraping para a Shopee Brasil.
Shopee usa SPA React, então precisamos aguardar carregamento de componentes.
"""
import re
import asyncio
from loguru import logger
from playwright.async_api import Page, BrowserContext
from tenacity import retry, stop_after_attempt, wait_exponential
from src.models import Product
from typing import List, Optional
from datetime import datetime


# ─── Seletores CSS da Shopee Brasil (atualizado 2025) ────────
SHOPEE_SELECTORS = {
    "card":           "div[data-sqe='item']",
    "titulo":         "div[data-sqe='name']",
    "preco":          "div[data-sqe='price']",
    "preco_original": "div[data-sqe='price'] + div, ._2S8Z_D",
    "nota":           "div.shopee-rating-stars__gold-stars .shopee-rating-stars__primary-star, .qli5bK",
    "imagem":         "div[data-sqe='image'] img",
    "link":           "a[data-sqe='link'], a",
    "vendas":         "div[data-sqe='rating'] + div, ._1kN0tg",
    "btn_comprar":    "button.btn-solid-primary, button[class*='btn-solid-primary']",
    "estoque":        "div[class*='stock-value']",
    "poucas_unidades":"div.flash-sale-item-card__stock-status-bar, ._3FLMXG",
    "nota_vendedor":   "div.seller-name__name, ._3m9tST",
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}

FLASH_SALE_URL   = "https://shopee.com.br/flash_sale"
MAIS_VENDIDOS_URL = "https://shopee.com.br/search?keyword=mais+vendidos&sortBy=sales"


async def _scrape_lista(page: Page, url: str, min_rating: float, max_products: int) -> List[dict]:
    """Raspa lista de produtos da Shopee (SPA React — requer wait especial)."""
    produtos_raw = []

    try:
        await page.set_extra_http_headers(HEADERS)
        await page.goto(url, wait_until="networkidle", timeout=60000)
        await asyncio.sleep(5)
    except Exception as e:
        logger.warning(f"⚠️ Shopee: Não foi possível carregar {url}: {e}")
        return []

    # Scroll progressivo e espera por cards
    try:
        await page.set_extra_http_headers({**HEADERS, "Referer": "https://shopee.com.br/"})
        await page.wait_for_selector(SHOPEE_SELECTORS["card"], timeout=25000)
    except:
        logger.warning("🕒 Shopee: Timeout aguardando cards. Tentando scroll e captura de tela de depuração...")
        await page.screenshot(path=f"logs/error_shopee_{int(asyncio.get_event_loop().time())}.png")

    for i in range(12):
        await page.evaluate(f"window.scrollTo(0, {(i + 1) * 800})")
        await asyncio.sleep(2)
        current_cards = await page.query_selector_all(SHOPEE_SELECTORS["card"])
        if len(current_cards) >= max_products:
            break

    cards = await page.query_selector_all(SHOPEE_SELECTORS["card"])
    if not cards:
        logger.error(f"❌ Shopee: Nenhum card encontrado. O site pode estar bloqueando o acesso automatizado.")
        # Abre screenshot para análise se necessário
        return []
        
    logger.info(f"🛒 Shopee: {len(cards)} cards encontrados em {url}")

    for card in cards[:max_products * 2]:
        try:
            # Nota
            nota = None
            nota_el = await card.query_selector(SHOPEE_SELECTORS["nota"])
            if nota_el:
                nota_txt = (await nota_el.inner_text()).strip().replace(",", ".")
                match = re.search(r"(\d[\.\,]\d)", nota_txt)
                if match:
                    nota = float(match.group(1).replace(",", "."))
                else:
                    nota = None

            if nota is not None and nota < min_rating:
                continue

            # Título
            titulo_el = await card.query_selector(SHOPEE_SELECTORS["titulo"])
            if not titulo_el: continue
            nome = (await titulo_el.inner_text()).strip()

            # Preço Atual
            preco_el = await card.query_selector(SHOPEE_SELECTORS["preco"])
            if not preco_el: continue
            preco_raw = await preco_el.inner_text()
            preco_txt = re.sub(r"[^0-9,]", "", preco_raw).replace(",", ".")
            preco = float(preco_txt)

            # Preço Original
            preco_original = preco
            orig_el = await card.query_selector(SHOPEE_SELECTORS["preco_original"])
            if orig_el:
                orig_raw = await orig_el.inner_text()
                orig_txt = re.sub(r"[^0-9,]", "", orig_raw).replace(",", ".")
                try: preco_original = float(orig_txt)
                except: pass

            # Link
            link_el = await card.query_selector(SHOPEE_SELECTORS["link"])
            if not link_el: continue
            href = await link_el.get_attribute("href")
            if not href: continue
            link = f"https://shopee.com.br{href}" if href.startswith("/") else href

            # Imagem
            img_el = await card.query_selector(SHOPEE_SELECTORS["imagem"])
            imagem = None
            if img_el:
                img_src = await img_el.get_attribute("src") or await img_el.get_attribute("data-src")
                if img_src:
                    # Shopee usa sufixo _tn para miniaturas. Removendo para pegar original.
                    imagem = re.sub(r"_tn$", "", img_src)
                    logger.debug(f"📸 Shopee: Forçando HQ para {imagem}")

            produtos_raw.append({
                "nome": nome,
                "preco": preco,
                "preco_original": preco_original,
                "link_original": link,
                "imagem_url": imagem,
                "nota": nota,
            })

            if len(produtos_raw) >= max_products:
                break

        except Exception as e:
            logger.debug(f"Shopee: Erro ao processar card: {e}")
            continue

    return produtos_raw


async def _check_estoque(context: BrowserContext, link: str) -> dict:
    """Verifica estoque e detalhes na página do produto da Shopee."""
    page = await context.new_page()
    resultado = {
        "estoque_disponivel": True,
        "poucas_unidades": False,
        "reputacao_vendedor": None,
    }

    try:
        await page.set_extra_http_headers(HEADERS)
        await page.goto(link, wait_until="networkidle", timeout=35000)
        await asyncio.sleep(2)

        # Botão de compra
        btn = await page.query_selector(SHOPEE_SELECTORS["btn_comprar"])
        if btn:
            is_disabled = await btn.get_attribute("disabled")
            resultado["estoque_disponivel"] = is_disabled is None
        else:
            resultado["estoque_disponivel"] = False

        # Verifica texto de poucas unidades / esgotado
        try:
            page_text = await page.inner_text("body")
            if any(kw in page_text.lower() for kw in ["esgotado", "indisponível", "sold out"]):
                resultado["estoque_disponivel"] = False
            if any(kw in page_text.lower() for kw in ["poucas unidades", "apenas", "restam"]):
                resultado["poucas_unidades"] = True
        except Exception:
            pass

        # Vendedor
        vendedor_el = await page.query_selector(SHOPEE_SELECTORS["nota_vendedor"])
        if vendedor_el:
            resultado["reputacao_vendedor"] = (await vendedor_el.inner_text()).strip()

    except Exception as e:
        logger.debug(f"Shopee: Erro ao checar estoque de {link}: {e}")
    finally:
        await page.close()

    return resultado


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=3, max=10))
async def scrape_shopee(context: BrowserContext, min_rating: float = 4.5, max_products: int = 30) -> List[Product]:
    """
    Função principal: raspa Flash Sale e Mais Vendidos da Shopee.
    """
    page = await context.new_page()
    produtos: List[Product] = []
    erros = 0

    try:
        raw_flash  = await _scrape_lista(page, FLASH_SALE_URL, min_rating, max_products // 2)
        raw_vendidos = await _scrape_lista(page, MAIS_VENDIDOS_URL, min_rating, max_products // 2)
        todos_raw = raw_flash + raw_vendidos

        logger.info(f"🔍 Shopee: Verificando estoque de {len(todos_raw)} produtos...")

        for item in todos_raw:
            try:
                estoque_info = await _check_estoque(context, item["link_original"])

                if not estoque_info["estoque_disponivel"]:
                    continue

                produto = Product(
                    nome=item["nome"],
                    preco=item["preco"],
                    preco_original=item.get("preco_original"),
                    link_original=item["link_original"],
                    imagem_url=item.get("imagem_url"),
                    loja="shopee",
                    nota=item.get("nota"),
                    estoque_disponivel=estoque_info["estoque_disponivel"],
                    poucas_unidades=estoque_info["poucas_unidades"],
                    reputacao_vendedor=estoque_info.get("reputacao_vendedor"),
                    encontrado_em=datetime.now(),
                )
                produtos.append(produto)
                logger.debug(f"✓ Shopee: {produto.nome[:50]} — R${produto.preco:.2f}")

            except Exception as e:
                erros += 1
                logger.warning(f"Shopee: Erro ao processar produto: {e}")

    finally:
        await page.close()

    logger.success(f"✅ Shopee: {len(produtos)} produtos válidos coletados. ({erros} erros)")
    return produtos
