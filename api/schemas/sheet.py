"""Schema Pydantic da visão consolidada da planilha (usada pela tela
'Planilha Completa' da UI para reconstruir a tabela sem acessar o .xlsx)."""
from pydantic import BaseModel


class CellOut(BaseModel):
    mes: str
    valor: float
    meio_pagamento: str


class LinhaOut(BaseModel):
    categoria: str
    subcategoria: str
    valores: list[CellOut]


class PlanilhaOut(BaseModel):
    meses: list[str]
    linhas: list[LinhaOut]
