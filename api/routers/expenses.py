"""Rotas de Despesas: cadastro, edição, busca e exclusão, além dos
endpoints auxiliares (categorias, subcategorias, meses e planilha
consolidada) usados pelos formulários da UI."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException

from api.controllers.expense_controller import ExpenseController
from api.dependencies import get_expense_controller
from api.schemas.expense import ExpenseCellOut, ExpenseCreate, ExpenseUpdate
from api.schemas.sheet import CellOut, LinhaOut, PlanilhaOut

router = APIRouter(prefix="/despesas", tags=["Despesas"])


@router.get("/categorias", response_model=list[str])
def listar_categorias(
    controller: ExpenseController = Depends(get_expense_controller),
) -> list[str]:
    return controller.listar_categorias()


@router.get("/categorias/{categoria}/subcategorias", response_model=list[str])
def listar_subcategorias(
    categoria: str, controller: ExpenseController = Depends(get_expense_controller)
) -> list[str]:
    try:
        return controller.listar_subcategorias(categoria)
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro


@router.get("/meses", response_model=list[str])
def listar_meses(
    controller: ExpenseController = Depends(get_expense_controller),
) -> list[str]:
    return [f"{mes.month:02d}/{mes.year}" for mes in controller.listar_meses_disponiveis()]


@router.get("/planilha", response_model=PlanilhaOut)
def obter_planilha(
    controller: ExpenseController = Depends(get_expense_controller),
) -> PlanilhaOut:
    df = controller.obter_dataframe()
    meses = list(dict.fromkeys(label for label, _ in df.columns))

    linhas = []
    for (categoria, subcategoria), row in df.iterrows():
        valores = [
            CellOut(
                mes=mes,
                valor=float(row[(mes, "Valor (R$)")]),
                meio_pagamento=str(row[(mes, "Meio de Pagamento")] or ""),
            )
            for mes in meses
        ]
        linhas.append(LinhaOut(categoria=categoria, subcategoria=subcategoria, valores=valores))

    return PlanilhaOut(meses=meses, linhas=linhas)


@router.get("", response_model=ExpenseCellOut)
def buscar_despesa(
    categoria: str,
    subcategoria: str,
    ano: int,
    mes: int,
    controller: ExpenseController = Depends(get_expense_controller),
) -> ExpenseCellOut:
    try:
        cell = controller.buscar(categoria, subcategoria, date(ano, mes, 1))
    except ValueError as erro:
        raise HTTPException(status_code=404, detail=str(erro)) from erro
    return ExpenseCellOut.model_validate(cell)


@router.post("", response_model=ExpenseCellOut, status_code=201)
def cadastrar_despesa(
    payload: ExpenseCreate, controller: ExpenseController = Depends(get_expense_controller)
) -> ExpenseCellOut:
    try:
        cell = controller.cadastrar(
            payload.valor,
            payload.data,
            payload.categoria,
            payload.subcategoria,
            payload.meio_pagamento,
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return ExpenseCellOut.model_validate(cell)


@router.put("", response_model=ExpenseCellOut)
def atualizar_despesa(
    categoria: str,
    subcategoria: str,
    ano: int,
    mes: int,
    payload: ExpenseUpdate,
    controller: ExpenseController = Depends(get_expense_controller),
) -> ExpenseCellOut:
    try:
        cell = controller.atualizar(
            categoria,
            subcategoria,
            date(ano, mes, 1),
            payload.novo_valor,
            payload.meio_pagamento,
        )
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return ExpenseCellOut.model_validate(cell)


@router.delete("", status_code=204)
def excluir_despesa(
    categoria: str,
    subcategoria: str,
    ano: int,
    mes: int,
    controller: ExpenseController = Depends(get_expense_controller),
) -> None:
    try:
        controller.excluir(categoria, subcategoria, date(ano, mes, 1))
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
