"""Schemas Pydantic de Despesas: contrato de entrada/saída da API. Toda
validação de payload (tipo, obrigatoriedade, faixa de valores) acontece
aqui — o backend nunca confia em dado vindo da interface sem passar por
este schema."""
from datetime import date

from pydantic import BaseModel, Field


class ExpenseCreate(BaseModel):
    valor: float = Field(gt=0, description="Valor lançado; deve ser maior que zero.")
    data: date
    categoria: str = Field(min_length=1)
    subcategoria: str = Field(min_length=1)
    meio_pagamento: str = Field(min_length=1)


class ExpenseUpdate(BaseModel):
    novo_valor: float = Field(ge=0, description="Novo valor da célula; substitui o valor atual.")
    meio_pagamento: str | None = Field(
        default=None, description="Se informado, substitui o(s) meio(s) de pagamento da célula."
    )


class ExpenseCellOut(BaseModel):
    categoria: str
    subcategoria: str
    mes_referencia: date
    valor: float
    meios_pagamento: list[str]

    model_config = {"from_attributes": True}
