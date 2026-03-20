"""
Módulo de scraping para o Mercado Livre.
Busca 'Ofertas do Dia' e 'Mais Vendidos' com filtros de qualidade.
"""
import re
import asyncio
from loguru import logger
from playwright.async_api import Page, BrowserContext
from tenacity import retry, stop_after_attempt, wait_exponential
from src.models import Product
from typing import List, Optional
from datetime import datetime


# ─── Seletores CSS do Mercado Livre (atualizado 2025) ───────
ML_SELECTORS = {
    "card":          ".poly-card, .ui-search-layout__item, .andes-carousel-snapped__slide",
    "titulo":        ".poly-component__title, .ui-search-item__title, a.splinter-link, .ui-pdp-title",
    "preco_atual":   ".poly-price__current, .andes-money-amount--current, .ui-pdp-price__second-line .andes-money-amount",
    "preco_original":".poly-price__original, .andes-money-amount--previous, .ui-search-price__original-value, .ui-pdp-price__original-value",
    "preco_pix":     "span.ui-pdp-price__payments-link, .ui-pdp-action-modal__link, .ui-search-price__payments-link",
    "nota":          ".poly-reviews__rating, .ui-search-reviews__rating-number, .ui-pdp-review__rating",
    "imagem":        "img.poly-component__picture, .poly-component__image, .ui-search-result-image__element, .ui-pdp-image",
    "galeria_midia": ".ui-pdp-gallery .ui-pdp-gallery__thumbnail",
    "link":          "a.poly-component__title, a.ui-search-item__group__element, a.splinter-link",
    "reputacao":     ".ui-seller-data-status__label-reputation",
    "btn_comprar":   "a.ui-pdp-action--primary, .andes-button--quiet",
    "poucas_unidades": "p.ui-pdp-stock-information, .ui-pdp-buybox__quantity__available",
}

OFERTAS_URL    = "https://www.mercadolivre.com.br/ofertas"
MAIS_VENDIDOS  = "https://www.mercadolivre.com.br/mais-vendidos"


async def _extrair_preco(elemento, seletor: str) -> Optional[float]:
    """Extrai e converte preço de um elemento Playwright."""
    try:
        el = await elemento.query_selector(seletor)
        if not el:
            return None
        # Pega todo o texto do componente de preço
        texto = (await el.inner_text()).strip()
        # Remove R$, espaços e pontos de milhar, troca vírgula por ponto
        texto_limpo = re.sub(r"[R$\s\.]", "", texto).replace(",", ".")
        # Captura apenas o primeiro número decimal válido
        match = re.search(r"(\d+\.?\d*)", texto_limpo)
        if match:
            return float(match.group(1))
        return None
    except Exception:
        return None


async def _scrape_lista(page: Page, url: str, min_rating: float, max_products: int) -> List[dict]:
    """Raspa uma lista de produtos de uma URL do Mercado Livre."""
    produtos_raw = []

    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_selector(ML_SELECTORS["card"], timeout=15000)
    except Exception as e:
        logger.warning(f"⚠️ ML: Não foi possível carregar {url}: {e}")
        return []

    # Scroll para carregar produtos lazy-loaded
    for _ in range(4):
        await page.keyboard.press("End")
        await asyncio.sleep(1.2)

    # Scroll progressivo para carregar as imagens (lazy load)
    for i in range(5):
        await page.evaluate(f"window.scrollTo(0, {(i + 1) * 800})")
        await asyncio.sleep(0.5)

    cards = await page.query_selector_all(ML_SELECTORS["card"])
    logger.info(f"🛒 ML: {len(cards)} cards encontrados em {url}")

    for card in cards[:max_products * 2]:  # * 2 para ter margem para filtragem
        try:
            # Nota
            nota_el = await card.query_selector(ML_SELECTORS["nota"])
            nota = None
            if nota_el:
                nota_txt = (await nota_el.inner_text()).strip().replace(",", ".")
                try:
                    nota = float(nota_txt)
                except ValueError:
                    pass

            # Filtro de nota — pula produtos sem nota ou abaixo do mínimo
            if nota is not None and nota < min_rating:
                continue

            # Título
            titulo_el = await card.query_selector(ML_SELECTORS["titulo"])
            if not titulo_el:
                continue
            nome = (await titulo_el.inner_text()).strip()

            # Preço
            preco = await _extrair_preco(card, ML_SELECTORS["preco_atual"])
            if not preco:
                continue

            preco_original = await _extrair_preco(card, ML_SELECTORS["preco_original"])
            if not preco_original:
                preco_original = preco

            # Link
            link_el = await card.query_selector(ML_SELECTORS["link"])
            link = await link_el.get_attribute("href") if link_el else None
            if not link:
                continue
            link = link.split("?")[0]  # remove tracking params

            # Imagem
            img_el = await card.query_selector(ML_SELECTORS["imagem"])
            imagem = None
            if img_el:
                # Prioridade para data-src devido ao lazy load
                sources = ["data-src", "src", "srcset"]
                for attr in sources:
                    val = await img_el.get_attribute(attr)
                    if val and val.startswith("http"):
                        imagem = val
                        break

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
            logger.debug(f"ML: Erro ao processar card: {e}")
            continue

    return produtos_raw


async def _check_estoque(context: BrowserContext, link: str) -> dict:
    """
    Abre a página do produto e verifica estoque, reputação e PREÇO REAL.
    """
    page = await context.new_page()
    resultado = {
        "estoque_disponivel": True, 
        "poucas_unidades": False, 
        "reputacao_vendedor": None,
        "preco_ajustado": None,
        "imagem_ajustada": None
    }

    try:
        await page.goto(link, wait_until="domcontentloaded", timeout=25000)
        # Scroll suave para carregar componentes dinâmicos de preço e imagem
        await page.evaluate("window.scrollTo(0, 400)")
        await asyncio.sleep(1.5)

        # 1. Verifica preço real na página (Pode ser diferente do Pix na lista)
        # Tenta o seletor de Pix primeiro
        preco_pix = await _extrair_preco(page, ML_SELECTORS["preco_pix"])
        if preco_pix:
            resultado["preco_ajustado"] = preco_pix
        else:
            # Pega o preço atual padrão da página
            preco_standard = await _extrair_preco(page, ML_SELECTORS["preco_atual"])
            if preco_standard:
                resultado["preco_ajustado"] = preco_standard

        # 2. Imagem de Alta Qualidade (da página do produto)
        img_el = await page.query_selector(ML_SELECTORS["imagem"])
        if img_el:
            # Pega o melhor atributo (zoom geralmente é o maior)
            img_src = await img_el.get_attribute("data-zoom") or \
                      await img_el.get_attribute("src")
            if img_src and img_src.startswith("http"):
                # Garante qualidade máxima substituindo sufixos de miniatura (-V, -I, -M, -F, -L, -X) por -O (Original/High)
                # Ex: D_NQ_...-V.webp -> D_NQ_...-O.webp
                high_res = re.sub(r"-[VIMFLX]\.(webp|jpg|png|jpeg)$", r"-O.\1", img_src, flags=re.IGNORECASE)
                resultado["imagem_ajustada"] = high_res
                logger.debug(f"📸 ML: Forçando HQ para {high_res}")

        # 3. Verifica botão de compra
        btn = await page.query_selector(ML_SELECTORS["btn_comprar"])
        if btn:
            is_disabled = await btn.get_attribute("disabled")
            resultado["estoque_disponivel"] = is_disabled is None
        else:
            resultado["estoque_disponivel"] = False

        # 4. Verifica aviso de poucas unidades
        stock_el = await page.query_selector(ML_SELECTORS["poucas_unidades"])
        if stock_el:
            texto = (await stock_el.inner_text()).lower()
            resultado["poucas_unidades"] = any(
                kw in texto for kw in ["pouca", "último", "restam", "unidade"]
            )

        # 5. Reputação do vendedor
        rep_el = await page.query_selector(ML_SELECTORS["reputacao"])
        if rep_el:
            resultado["reputacao_vendedor"] = (await rep_el.inner_text()).strip()

    except Exception as e:
        logger.debug(f"ML: Erro ao checar detalhes de {link}: {e}")
    finally:
        await page.close()

    return resultado


@retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=8))
async def scrape_mercadolivre(context: BrowserContext, min_rating: float = 4.5, max_products: int = 30) -> List[Product]:
    """
    Função principal: raspa as seções 'Ofertas do Dia' e 'Mais Vendidos'
    do Mercado Livre e retorna lista de produtos validados.
    """
    page = await context.new_page()
    produtos: List[Product] = []
    erros = 0

    try:
        # Scrape das duas fontes
        raw_ofertas = await _scrape_lista(page, OFERTAS_URL, min_rating, max_products // 2)
        raw_mais_vendidos = await _scrape_lista(page, MAIS_VENDIDOS, min_rating, max_products // 2)
        todos_raw = raw_ofertas + raw_mais_vendidos

        logger.info(f"🔍 ML: Verificando estoque de {len(todos_raw)} produtos...")

        # Check de estoque para cada produto
        for item in todos_raw:
            try:
                estoque_info = await _check_estoque(context, item["link_original"])

                # Pula se sem estoque
                if not estoque_info["estoque_disponivel"]:
                    logger.debug(f"ML: Produto sem estoque ignorado: {item['nome'][:40]}")
                    continue

                # Atualiza com dados refinados da página do produto (se existirem)
                preco_final = estoque_info.get("preco_ajustado") or item["preco"]
                imagem_final = estoque_info.get("imagem_ajustada") or item.get("imagem_url")

                produto = Product(
                    nome=item["nome"],
                    preco=preco_final,
                    preco_original=item.get("preco_original"),
                    link_original=item["link_original"],
                    imagem_url=imagem_final,
                    loja="mercadolivre",
                    nota=item.get("nota"),
                    estoque_disponivel=estoque_info["estoque_disponivel"],
                    poucas_unidades=estoque_info["poucas_unidades"],
                    reputacao_vendedor=estoque_info["reputacao_vendedor"],
                    encontrado_em=datetime.now(),
                )
                produtos.append(produto)
                logger.debug(f"✓ ML: {produto.nome[:50]} — R${produto.preco:.2f}")

            except Exception as e:
                erros += 1
                logger.warning(f"ML: Erro ao processar produto: {e}")

    finally:
        await page.close()

    logger.success(f"✅ Mercado Livre: {len(produtos)} produtos válidos coletados. ({erros} erros)")
    return produtos
