"""Ponto de entrada da API REST.

Executar com:
    uvicorn api.main:app --reload --port 8000

Documentação interativa (Swagger) disponível em /docs.
"""
from fastapi import FastAPI

from api.routers import expenses, income, payment_methods, system

app = FastAPI(
    title="Controle de Gastos Pessoais - API",
    description=(
        "API REST para cadastro, edição, busca e exclusão de despesas e "
        "meios de pagamento, e para consulta do balanço mensal (renda, "
        "total de despesas e resultado operacional). Única responsável "
        "por ler e gravar o arquivo PLANILHA CONTROLE DE GASTOS.xlsx."
    ),
    version="1.0.0",
)

app.include_router(expenses.router)
app.include_router(payment_methods.router)
app.include_router(income.router)
app.include_router(system.router)


@app.get("/", tags=["Sistema"])
def raiz() -> dict:
    return {"status": "ok", "docs": "/docs"}
