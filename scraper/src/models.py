"""
Modelos de dados (Pydantic) — garante validação e tipo forte em todo o sistema.
"""
from pydantic import BaseModel, HttpUrl, field_validator
from typing import Optional, Literal
from datetime import datetime


class Product(BaseModel):
    external_id: str
    nome: str
    preco: float
    preco_original: Optional[float] = None
    desconto_pct: Optional[float] = None
    link_original: str
    imagem_url: Optional[str] = None
    loja: Literal["mercadolivre", "amazon", "shopee"]
    nota: Optional[float] = None
    num_avaliacoes: Optional[int] = None
    reputacao_vendedor: Optional[str] = None
    estoque_disponivel: bool = True
    poucas_unidades: bool = False
    categoria: Optional[str] = None
    encontrado_em: datetime = None

    @field_validator("preco", mode="before")
    @classmethod
    def parse_preco(cls, v):
        if isinstance(v, str):
            v = v.replace("R$", "").replace(".", "").replace(",", ".").strip()
        return float(v)

    @field_validator("nota", mode="before")
    @classmethod
    def parse_nota(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            v = v.replace(",", ".").strip()
        try:
            return float(v)
        except (ValueError, TypeError):
            return None

    def model_post_init(self, __context):
        if self.encontrado_em is None:
            self.encontrado_em = datetime.now()
        if self.preco_original and self.preco_original > self.preco:
            self.desconto_pct = round(
                (1 - self.preco / self.preco_original) * 100, 1
            )
