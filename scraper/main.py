"""
Script principal — orquestra todos os scrapers e salva no Supabase.
Inclui o Cron Job agendado 2x por dia via APScheduler.

Uso:
    python main.py            # Inicia o scheduler (modo contínuo)
    python main.py --agora    # Roda a varredura imediatamente e encerra
    python main.py --schema   # Exibe o SQL para criar as tabelas no Supabase
"""
import asyncio
import argparse
import os
import sys
from datetime import datetime

from dotenv import load_dotenv
from loguru import logger
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from playwright.async_api import async_playwright

from src.scraper_ml      import scrape_mercadolivre
from src.scraper_amazon  import scrape_amazon
from src.scraper_shopee  import scrape_shopee
from src.database        import upsert_produtos, log_execucao_start, log_execucao_end, print_schema
from src.models          import Product
from typing              import List

# ─────────────────────────────────────────────────────────────
# Configuração de logging
# ─────────────────────────────────────────────────────────────
load_dotenv()

logger.remove()
logger.add(
    sys.stdout,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}",
    level="INFO",
    colorize=True,
)
logger.add(
    "logs/scraper_{time:YYYY-MM-DD}.log",
    rotation="1 day",
    retention="30 days",
    level="DEBUG",
    encoding="utf-8",
)

# ─────────────────────────────────────────────────────────────
# Configurações vindas do .env
# ─────────────────────────────────────────────────────────────
MIN_RATING    = float(os.getenv("MIN_RATING", "4.5"))
MAX_PRODUCTS  = int(os.getenv("MAX_PRODUCTS_PER_STORE", "30"))
HEADLESS      = os.getenv("HEADLESS", "true").lower() == "true"
CRON_HORA_1   = os.getenv("CRON_HORA_1", "07:00")
CRON_HORA_2   = os.getenv("CRON_HORA_2", "19:00")
PROXY_URL     = os.getenv("PROXY_URL") or None


# ─────────────────────────────────────────────────────────────
# Orquestrador principal
# ─────────────────────────────────────────────────────────────
async def executar_varredura():
    """
    Executa a varredura completa em todas as lojas:
    Mercado Livre → Amazon → Shopee
    """
    inicio = datetime.now()
    logger.info("=" * 55)
    logger.info(f"🚀 Iniciando varredura em {inicio.strftime('%d/%m/%Y %H:%M:%S')}")
    logger.info("=" * 55)

    lojas = ["mercadolivre", "amazon", "shopee"]
    exec_id = log_execucao_start(lojas)

    todos_produtos: List[Product] = []
    erros_globais: List[str] = []

    playwright_kwargs = {}
    if PROXY_URL:
        playwright_kwargs["proxy"] = {"server": PROXY_URL}

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=HEADLESS,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
            ],
        )

        context = await browser.new_context(
            viewport={"width": 1366, "height": 768},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            ),
            locale="pt-BR",
            **playwright_kwargs,
        )

        # ── Mercado Livre ────────────────────────────────────
        try:
            logger.info("🏪 Varrendo Mercado Livre...")
            prods_ml = await scrape_mercadolivre(context, MIN_RATING, MAX_PRODUCTS)
            todos_produtos.extend(prods_ml)
        except Exception as e:
            msg = f"ERRO Mercado Livre: {e}"
            logger.error(f"❌ {msg}")
            erros_globais.append(msg)

        # ── Amazon ───────────────────────────────────────────
        try:
            logger.info("🏪 Varrendo Amazon...")
            prods_amz = await scrape_amazon(context, MIN_RATING, MAX_PRODUCTS)
            todos_produtos.extend(prods_amz)
        except Exception as e:
            msg = f"ERRO Amazon: {e}"
            logger.error(f"❌ {msg}")
            erros_globais.append(msg)

        # ── Shopee ───────────────────────────────────────────
        try:
            logger.info("🏪 Varrendo Shopee...")
            prods_shopee = await scrape_shopee(context, MIN_RATING, MAX_PRODUCTS)
            todos_produtos.extend(prods_shopee)
        except Exception as e:
            msg = f"ERRO Shopee: {e}"
            logger.error(f"❌ {msg}")
            erros_globais.append(msg)

        await browser.close()

    # ── Salvar no banco ──────────────────────────────────────
    total_encontrado = len(todos_produtos)
    total_salvos = 0

    if todos_produtos:
        try:
            total_salvos = upsert_produtos(todos_produtos)
        except Exception as e:
            msg = f"ERRO ao salvar no banco: {e}"
            logger.error(f"❌ {msg}")
            erros_globais.append(msg)

    # ── Relatório final ─────────────────────────────────────
    duracao = (datetime.now() - inicio).seconds
    logger.info("=" * 55)
    logger.info(f"📊 RELATÓRIO DA VARREDURA")
    logger.info(f"   🕐 Duração:         {duracao // 60}min {duracao % 60}s")
    logger.info(f"   🔍 Total encontrado: {total_encontrado} produtos")
    logger.info(f"   💾 Salvos no banco:  {total_salvos} registros")
    logger.info(f"   ❌ Erros:           {len(erros_globais)}")
    if erros_globais:
        for e in erros_globais:
            logger.warning(f"   ⚠️  {e}")
    logger.info("=" * 55)

    sucesso = len(erros_globais) == 0 or total_salvos > 0
    log_execucao_end(exec_id, total_encontrado, total_salvos, erros_globais, sucesso)

    return total_salvos


# ─────────────────────────────────────────────────────────────
# Cron Job — APScheduler
# ─────────────────────────────────────────────────────────────
def _parse_horario(horario_str: str) -> tuple:
    """Converte 'HH:MM' para (hora, minuto)."""
    partes = horario_str.split(":")
    return int(partes[0]), int(partes[1])


async def iniciar_scheduler():
    """Configura e inicia o scheduler com os 2 horários configurados."""
    hora1, min1 = _parse_horario(CRON_HORA_1)
    hora2, min2 = _parse_horario(CRON_HORA_2)

    scheduler = AsyncIOScheduler(timezone="America/Sao_Paulo")

    scheduler.add_job(
        executar_varredura,
        trigger="cron",
        hour=hora1, minute=min1,
        id="varredura_manha",
        name=f"Varredura Manhã ({CRON_HORA_1})",
        misfire_grace_time=300,  # 5 min de tolerância
    )
    scheduler.add_job(
        executar_varredura,
        trigger="cron",
        hour=hora2, minute=min2,
        id="varredura_noite",
        name=f"Varredura Noite ({CRON_HORA_2})",
        misfire_grace_time=300,
    )

    scheduler.start()

    logger.info("⏰ Scheduler iniciado! Próximas execuções:")
    for job in scheduler.get_jobs():
        logger.info(f"   • {job.name}: {job.next_run_time.strftime('%d/%m/%Y %H:%M:%S')}")

    logger.info("🔄 Aguardando horários programados... (Ctrl+C para parar)")

    try:
        while True:
            await asyncio.sleep(60)
    except (KeyboardInterrupt, SystemExit):
        scheduler.shutdown()
        logger.info("⛔ Scheduler encerrado.")


# ─────────────────────────────────────────────────────────────
# Servidor HTTP para Gatilho Manual
# ─────────────────────────────────────────────────────────────
from http.server import BaseHTTPRequestHandler, HTTPServer
import threading

class TriggerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/scrape":
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b'{"status": "started"}')
            
            # Inicia varredura em background para não travar a resposta
            logger.info("⚡ Gatilho manual recebido via HTTP!")
            asyncio.run_coroutine_threadsafe(executar_varredura(), loop)
        else:
            self.send_response(404)
            self.end_headers()

def iniciar_servidor_http():
    server = HTTPServer(("0.0.0.0", 8000), TriggerHandler)
    logger.info("🌐 Servidor de gatilho manual ouvindo na porta 8000")
    server.serve_forever()

# ─────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────
loop = asyncio.new_event_loop()

if __name__ == "__main__":
    asyncio.set_event_loop(loop)
    
    parser = argparse.ArgumentParser(
        description="🛒 Bateu, Comprou — Monitor de Produtos de Afiliados"
    )
    parser.add_argument(
        "--agora",
        action="store_true",
        help="Roda a varredura imediatamente e encerra.",
    )
    parser.add_argument(
        "--schema",
        action="store_true",
        help="Exibe o SQL para criar as tabelas no Supabase.",
    )
    args = parser.parse_args()

    if args.schema:
        print_schema()
        sys.exit(0)
    elif args.agora:
        logger.info("▶ Modo: Varredura imediata")
        loop.run_until_complete(executar_varredura())
    else:
        logger.info("▶ Modo: Scheduler contínuo + Servidor HTTP")
        
        # Inicia o servidor HTTP em uma thread separada
        thread = threading.Thread(target=iniciar_servidor_http, daemon=True)
        thread.start()
        
        # Inicia o scheduler no loop principal
        loop.run_until_complete(iniciar_scheduler())
