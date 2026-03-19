"""
Módulo de banco de dados — integração com Supabase/PostgreSQL.
Inclui schema de criação e funções de CRUD.
"""
import os
from loguru import logger
from supabase import create_client, Client
from src.models import Product
from typing import List, Optional
from datetime import datetime

# ─────────────────────────────────────────────────────────────
# SCHEMA SQL — execute no Supabase SQL Editor para criar a tabela
# ─────────────────────────────────────────────────────────────
SCHEMA_SQL = """
-- Tabela principal de produtos encontrados pelo scraper
CREATE TABLE IF NOT EXISTS produtos_monitorados (
    id               BIGSERIAL PRIMARY KEY,
    nome             TEXT NOT NULL,
    preco            NUMERIC(10, 2) NOT NULL,
    preco_original   NUMERIC(10, 2),
    desconto_pct     NUMERIC(5, 1),
    link_original    TEXT NOT NULL UNIQUE,
    imagem_url       TEXT,
    loja             TEXT NOT NULL CHECK (loja IN ('mercadolivre', 'amazon', 'shopee')),
    nota             NUMERIC(3, 1),
    num_avaliacoes   INTEGER,
    reputacao_vendedor TEXT,
    estoque_disponivel BOOLEAN DEFAULT true,
    poucas_unidades  BOOLEAN DEFAULT false,
    categoria        TEXT,
    encontrado_em    TIMESTAMPTZ DEFAULT now(),
    atualizado_em    TIMESTAMPTZ DEFAULT now()
);

-- Índices para acelerar consultas
CREATE INDEX IF NOT EXISTS idx_loja ON produtos_monitorados (loja);
CREATE INDEX IF NOT EXISTS idx_nota ON produtos_monitorados (nota DESC);
CREATE INDEX IF NOT EXISTS idx_desconto ON produtos_monitorados (desconto_pct DESC);
CREATE INDEX IF NOT EXISTS idx_encontrado_em ON produtos_monitorados (encontrado_em DESC);

-- Trigger para atualizar atualizado_em automaticamente
CREATE OR REPLACE FUNCTION update_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_update_atualizado_em
    BEFORE UPDATE ON produtos_monitorados
    FOR EACH ROW EXECUTE FUNCTION update_atualizado_em();

-- Tabela de log de execuções do scraper
CREATE TABLE IF NOT EXISTS scraper_execucoes (
    id              BIGSERIAL PRIMARY KEY,
    iniciado_em     TIMESTAMPTZ DEFAULT now(),
    finalizado_em   TIMESTAMPTZ,
    lojas_varridas  TEXT[],
    total_encontrado INTEGER DEFAULT 0,
    total_salvos     INTEGER DEFAULT 0,
    erros            TEXT[],
    status          TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'failed'))
);
"""


def get_client() -> Client:
    """Cria e retorna o cliente Supabase."""
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError(
            "❌ SUPABASE_URL e SUPABASE_KEY devem estar definidos no .env"
        )
    return create_client(url, key)


def print_schema():
    """Imprime o SQL que deve ser executado no Supabase para criar as tabelas."""
    print("\n" + "═" * 60)
    print("  📋 Cole o SQL abaixo no Supabase SQL Editor:")
    print("═" * 60)
    print(SCHEMA_SQL)
    print("═" * 60 + "\n")


def upsert_produtos(produtos: List[Product]) -> int:
    """
    Insere ou atualiza produtos no Supabase.
    Usa 'link_original' como chave única (upsert).
    Retorna o número de registros salvos.
    """
    if not produtos:
        return 0

    client = get_client()
    dados = []
    for p in produtos:
        dados.append({
            "nome": p.nome,
            "preco": p.preco,
            "preco_original": p.preco_original,
            "desconto_pct": p.desconto_pct,
            "link_original": p.link_original,
            "imagem_url": p.imagem_url,
            "loja": p.loja,
            "nota": p.nota,
            "num_avaliacoes": p.num_avaliacoes,
            "reputacao_vendedor": p.reputacao_vendedor,
            "estoque_disponivel": p.estoque_disponivel,
            "poucas_unidades": p.poucas_unidades,
            "categoria": p.categoria,
            "encontrado_em": p.encontrado_em.isoformat(),
        })

    try:
        response = (
            client.table("produtos_monitorados")
            .upsert(dados, on_conflict="link_original")
            .execute()
        )
        count = len(response.data) if response.data else 0
        logger.success(f"✅ {count} produtos salvos/atualizados no Supabase.")
        return count
    except Exception as e:
        logger.error(f"❌ Erro ao salvar no Supabase: {e}")
        raise


def log_execucao_start(lojas: List[str]) -> Optional[int]:
    """Registra o início de uma execução do scraper. Retorna o ID do log."""
    try:
        client = get_client()
        res = (
            client.table("scraper_execucoes")
            .insert({"lojas_varridas": lojas, "status": "running"})
            .execute()
        )
        exec_id = res.data[0]["id"] if res.data else None
        logger.info(f"📋 Execução registrada com ID: {exec_id}")
        return exec_id
    except Exception as e:
        logger.warning(f"⚠️ Não foi possível registrar execução: {e}")
        return None


def log_execucao_end(
    exec_id: Optional[int],
    total_encontrado: int,
    total_salvos: int,
    erros: List[str],
    sucesso: bool,
):
    """Atualiza o log de execução com os resultados finais."""
    if exec_id is None:
        return
    try:
        client = get_client()
        client.table("scraper_execucoes").update({
            "finalizado_em": datetime.now().isoformat(),
            "total_encontrado": total_encontrado,
            "total_salvos": total_salvos,
            "erros": erros,
            "status": "success" if sucesso else "failed",
        }).eq("id", exec_id).execute()
    except Exception as e:
        logger.warning(f"⚠️ Não foi possível finalizar log de execução: {e}")
