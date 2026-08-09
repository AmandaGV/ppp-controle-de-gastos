"""Schemas Pydantic de Renda Mensal e Resultado Operacional."""
from pydantic import BaseModel, Field


class IncomeUpdate(BaseModel):
    valor: float = Field(ge=0, description="Nova Renda Mensal; não pode ser negativa.")


class IncomeSummaryOut(BaseModel):
    renda_mensal: float
    total_despesas: float
    resultado_operacional: float
