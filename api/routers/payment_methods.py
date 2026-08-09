"""Rotas de Meios de Pagamento: cadastro, edição, busca e exclusão do
catálogo. Renomear propaga a alteração para as células já lançadas na
planilha de despesas (regra de negócio implementada em
PaymentMethodService)."""
from fastapi import APIRouter, Depends, HTTPException

from api.controllers.payment_method_controller import PaymentMethodController
from api.dependencies import get_payment_method_controller
from api.schemas.payment_method import PaymentMethodCreate, PaymentMethodOut, PaymentMethodUpdate

router = APIRouter(prefix="/meios-pagamento", tags=["Meios de Pagamento"])


@router.get("", response_model=list[str])
def listar(
    controller: PaymentMethodController = Depends(get_payment_method_controller),
) -> list[str]:
    return controller.listar()


@router.get("/{nome}", response_model=PaymentMethodOut)
def buscar(
    nome: str, controller: PaymentMethodController = Depends(get_payment_method_controller)
) -> PaymentMethodOut:
    try:
        encontrado = controller.buscar(nome)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    if encontrado is None:
        raise HTTPException(status_code=404, detail=f"Meio de pagamento '{nome}' não encontrado.")
    return PaymentMethodOut(nome=encontrado)


@router.post("", response_model=PaymentMethodOut, status_code=201)
def cadastrar(
    payload: PaymentMethodCreate,
    controller: PaymentMethodController = Depends(get_payment_method_controller),
) -> PaymentMethodOut:
    try:
        controller.cadastrar(payload.nome)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return PaymentMethodOut(nome=payload.nome.strip())


@router.put("/{nome_atual}", response_model=PaymentMethodOut)
def atualizar(
    nome_atual: str,
    payload: PaymentMethodUpdate,
    controller: PaymentMethodController = Depends(get_payment_method_controller),
) -> PaymentMethodOut:
    try:
        controller.atualizar(nome_atual, payload.novo_nome)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
    return PaymentMethodOut(nome=payload.novo_nome.strip())


@router.delete("/{nome}", status_code=204)
def excluir(
    nome: str, controller: PaymentMethodController = Depends(get_payment_method_controller)
) -> None:
    try:
        controller.excluir(nome)
    except ValueError as erro:
        raise HTTPException(status_code=400, detail=str(erro)) from erro
