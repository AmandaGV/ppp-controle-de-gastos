"""Rotas de Renda Mensal e Resultado Operacional."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from api.controllers.income_controller import IncomeController
from api.dependencies import get_income_controller
from api.schemas.income import IncomeSummaryOut, IncomeUpdate

router = APIRouter(prefix="/renda", tags=["Renda"])


@router.get("", response_model=IncomeSummaryOut)
def obter_resumo(
    ano: int, mes: int, controller: IncomeController = Depends(get_income_controller)
) -> IncomeSummaryOut:
    try:
        resumo = controller.obter_resumo(date(ano, mes, 1))
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return IncomeSummaryOut(**resumo)


@router.put("", response_model=IncomeSummaryOut)
def atualizar_renda(
    ano: int,
    mes: int,
    payload: IncomeUpdate,
    controller: IncomeController = Depends(get_income_controller),
) -> IncomeSummaryOut:
    referencia = date(ano, mes, 1)
    try:
        controller.atualizar_renda(referencia, payload.valor)
        resumo = controller.obter_resumo(referencia)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return IncomeSummaryOut(**resumo)
