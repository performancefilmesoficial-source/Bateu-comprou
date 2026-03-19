"""
Módulo de scraping para a Amazon Brasil.
Busca 'Mais Vendidos' e 'Ofertas do Dia' com filtros de qualidade.
"""
import re
import asyncio
from loguru import logger
from playwright.async_api import Page, BrowserContext
from tenacity import retry, stop_after_attempt, wait_exponential
from src.models import Product
from typing import List, Optional
from datetime import datetime


# ─── Seletores CSS da Amazon Brasil (atualizado 2025) ───────
AMZ_SELECTORS = {
    "card":           ".zg-grid-general-faceout, li.a-carousel-card, div[class*='ProductCard-module__card'], .s-result-item",
    "titulo":         ".p13n-sc-truncate-desktop-type2, span[class*='ProductCard-module__title'], ._cDEzb_p13n-sc-css-line-clamp-3_g3dy1, .a-size-base-plus, .a-size-medium, #productTitle",
    "preco":          ".p13n-sc-price, div[class*='ProductCard-module__price'], .a-price-whole, .a-offscreen",
    "preco_original": ".a-price.a-text-price span.a-offscreen, .basisPrice .a-offscreen",
    "nota":           ".a-icon-star-small .a-icon-alt, i.a-icon-star-small",
    "imagem":         "#landingImage, #main-image, .s-image, img.p13n-product-image",
    "link":           "a.a-link-normal, a.a-link-section",
    "btn_comprar":    "#add-to-cart-button, #buy-now-button, #submit.add-to-cart",
    "poucas_unidades":"#availability span, .a-color-price",
    "vendedor":       "#merchant-info, #tabular-buybox-seller",
    "nota_produto":   "#acrPopover .a-icon-alt, .a-icon-star",
}

MAIS_VENDIDOS_URL = "https://www.amazon.com.br/bestsellers"
OFERTAS_URL       = "https://www.amazon.com.br/deals"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}


async def _scrape_lista(page: Page, url: str, min_rating: float, max_products: int) -> List[dict]:
    """Raspa lista de mais vendidos ou ofertas da Amazon."""
    produtos_raw = []

    try:
        await page.set_extra_http_headers(HEADERS)
        await page.goto(url, wait_until="domcontentloaded", timeout=35000)
        await asyncio.sleep(2)
    except Exception as e:
        logger.warning(f"⚠️ Amazon: Não foi possível carregar {url}: {e}")
        return []

    # Scroll gradual para carregar todos os produtos
    for _ in range(5):
        await page.evaluate("window.scrollBy(0, 800)")
        await asyncio.sleep(0.8)

    cards = await page.query_selector_all(AMZ_SELECTORS["card"])
    if not cards:
        # Fallback: tenta seletor alternativo (busca padrão e outros grids)
        cards = await page.query_selector_all(".s-result-item, .a-carousel-card, [id*='grid-item']")

    logger.info(f"🛒 Amazon: {len(cards)} cards encontrados em {url}")

    for card in cards[:max_products * 2]:
        try:
            # Nota
            nota = None
            nota_el = await card.query_selector(AMZ_SELECTORS["nota"])
            if nota_el:
                nota_txt = (await nota_el.inner_text()).strip()
                match = re.search(r"(\d[,\.]\d)", nota_txt)
                if match:
                    nota = float(match.group(1).replace(",", "."))

            if nota is not None and nota < min_rating:
                continue

            # Título
            titulo_el = await card.query_selector(AMZ_SELECTORS["titulo"])
            if not titulo_el:
                # Tenta fallback
                titulo_el = await card.query_selector(".a-size-base-plus, .a-size-medium")
            if not titulo_el:
                continue
            nome = (await titulo_el.inner_text()).strip()

            # Preço
            preco_el = await card.query_selector(AMZ_SELECTORS["preco"])
            if not preco_el:
                preco_el = await card.query_selector(".a-price-whole")
            if not preco_el:
                # Tenta pegar qualquer texto com formato de preço no card
                card_text = await card.inner_text()
                match = re.search(r"R\$\s?(\d+[\.,]\d+)", card_text)
                if match:
                    preco_txt = match.group(1).replace(".", "").replace(",", ".")
                    preco = float(preco_txt)
                else:
                    continue
            else:
                preco_txt = (await preco_el.inner_text()).strip()
                preco_txt = re.sub(r"[R$\s\.]", "", preco_txt).replace(",", ".")
                try:
                    preco = float(preco_txt)
                except ValueError:
                    continue

            # Link
            link_el = await card.query_selector("a")
            if not link_el:
                continue
            href = await link_el.get_attribute("href")
            if not href:
                continue
            link = f"https://www.amazon.com.br{href}" if href.startswith("/") else href
            link = re.sub(r"/ref=.*", "", link)

            # Imagem
            img_el = await card.query_selector("img")
            imagem = None
            if img_el:
                imagem = await img_el.get_attribute("src")

            produtos_raw.append({
                "nome": nome,
                "preco": preco,
                "link_original": link,
                "imagem_url": imagem,
                "nota": nota,
            })

            if len(produtos_raw) >= max_products:
                break

        except Exception as e:
            logger.debug(f"Amazon: Erro ao processar card: {e}")
            continue

    return produtos_raw


async def _check_estoque(context: BrowserContext, link: str) -> dict:
    """Verifica disponibilidade e detalhes do produto na página da Amazon."""
    page = await context.new_page()
    resultado = {
        "estoque_disponivel": True,
        "poucas_unidades": False,
        "reputacao_vendedor": None,
        "nota": None,
    }

    try:
        await page.set_extra_http_headers(HEADERS)
        await page.goto(link, wait_until="domcontentloaded", timeout=25000)
        # Scroll para carregar preço e imagem
        await page.evaluate("window.scrollTo(0, 400)")
        await asyncio.sleep(1.5)

        # 1. Preço e Preço Original (para desconto real)
        preco_el = await page.query_selector(AMZ_SELECTORS["preco"])
        if preco_el:
            txt = (await preco_el.inner_text()).strip()
            txt = re.sub(r"[R$\s\.]", "", txt).replace(",", ".")
            try:
                resultado["preco_ajustado"] = float(txt)
            except: pass

        orig_el = await page.query_selector(AMZ_SELECTORS["preco_original"])
        if orig_el:
            txt = (await orig_el.inner_text()).strip()
            txt = re.sub(r"[R$\s\.]", "", txt).replace(",", ".")
            try:
                resultado["preco_original"] = float(txt)
            except: pass

        # 2. Imagem de Alta Resolução
        img_el = await page.query_selector(AMZ_SELECTORS["imagem"])
        if img_el:
            # Amazon usa data-old-hires para original, ou src com sufixos redimensionados
            img_src = await img_el.get_attribute("data-old-hires") or await img_el.get_attribute("src")
            if img_src and img_src.startswith("http"):
                # Limpa sufixos de tamanho da Amazon (Ex: ._AC_SX679_.jpg -> .jpg)
                high_res = re.sub(r"\._AC_.*_\.", ".", img_src)
                resultado["imagem_ajustada"] = high_res
                logger.debug(f"📸 Amazon: Forçando HQ para {high_res}")

        # 3. Verifica botão de compra
        btn = await page.query_selector(AMZ_SELECTORS["btn_comprar"])
        resultado["estoque_disponivel"] = btn is not None

        # 4. Nota na página do produto
        nota_el = await page.query_selector(AMZ_SELECTORS["nota_produto"])
        if nota_el:
            nota_txt = await nota_el.inner_text()
            match = re.search(r"(\d[,\.]\d)", nota_txt)
            if match:
                resultado["nota"] = float(match.group(1).replace(",", "."))

    except Exception as e:
        logger.debug(f"Amazon: Erro ao checar estoque de {link}: {e}")
    finally:
        await page.close()

    return resultado


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=8))
async def scrape_amazon(context: BrowserContext, min_rating: float = 4.5, max_products: int = 30) -> List[Product]:
    """
    Função principal: raspa Mais Vendidos e Ofertas da Amazon Brasil.
    """
    page = await context.new_page()
    produtos: List[Product] = []
    erros = 0

    try:
        raw_mais_vendidos = await _scrape_lista(page, MAIS_VENDIDOS_URL, min_rating, max_products // 2)
        raw_ofertas       = await _scrape_lista(page, OFERTAS_URL, min_rating, max_products // 2)
        todos_raw = raw_mais_vendidos + raw_ofertas

        logger.info(f"🔍 Amazon: Verificando estoque de {len(todos_raw)} produtos...")

        for item in todos_raw:
            try:
                estoque_info = await _check_estoque(context, item["link_original"])

                if not estoque_info["estoque_disponivel"]:
                    continue

                # Usa nota da página do produto se disponível e mais confiável
                nota_final = estoque_info.get("nota") or item.get("nota")

                # Re-aplica filtro de nota com dado mais confiável
                if nota_final is not None and nota_final < min_rating:
                    continue

                # Dados refinados na página
                preco_final = estoque_info.get("preco_ajustado") or item["preco"]
                preco_original = estoque_info.get("preco_original") or item.get("preco") # Fallback se não detectar original
                imagem_final = estoque_info.get("imagem_ajustada") or item.get("imagem_url")

                produto = Product(
                    nome=item["nome"],
                    preco=preco_final,
                    preco_original=preco_original,
                    link_original=item["link_original"],
                    imagem_url=imagem_final,
                    loja="amazon",
                    nota=nota_final,
                    estoque_disponivel=estoque_info["estoque_disponivel"],
                    poucas_unidades=estoque_info["poucas_unidades"],
                    reputacao_vendedor=estoque_info.get("reputacao_vendedor"),
                    encontrado_em=datetime.now(),
                )
                produtos.append(produto)
                logger.debug(f"✓ Amazon: {produto.nome[:50]} — R${produto.preco:.2f}")

            except Exception as e:
                erros += 1
                logger.warning(f"Amazon: Erro ao processar produto: {e}")

    finally:
        await page.close()

    logger.success(f"✅ Amazon: {len(produtos)} produtos válidos coletados. ({erros} erros)")
    return produtos
