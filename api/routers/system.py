"""Rotas utilitárias de sistema (ex.: recarregar a planilha do disco,
descartando o cache de workbook e de layout em memória)."""
from fastapi import APIRouter, Depends

from api.dependencies import AppContext, get_context

router = APIRouter(prefix="/sistema", tags=["Sistema"])


@router.post("/reload")
def recarregar_planilha(ctx: AppContext = Depends(get_context)) -> dict:
    ctx.repository.reload()
    ctx.layout_service.refresh()
    return {"status": "ok"}
