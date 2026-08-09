"""Regras de negócio de Renda Mensal e Resultado Operacional."""
from datetime import date

from api import config
from api.repositories.expense_repository import ExpenseRepository
from api.services.expense_service import ExpenseService
from api.services.layout_service import SheetLayoutService


class IncomeService:
    def __init__(
        self,
        repository: ExpenseRepository,
        layout_service: SheetLayoutService,
        expense_service: ExpenseService,
    ):
        self._repo = repository
        self._layout_service = layout_service
        self._expense_service = expense_service
        self._sheet = config.SHEET_DESPESAS

    def obter_renda(self, referencia: date) -> float:
        return self._expense_service.obter_renda_mensal(referencia)

    def atualizar_renda(self, referencia: date, valor: float) -> float:
        layout = self._layout_service.get_layout(self._sheet)
        cols = layout.get_month_columns(referencia)
        self._repo.set_cell(self._sheet, layout.renda_mensal_row, cols.valor_col, float(valor))
        # recalcular_totais também persiste a alteração da renda no mesmo save().
        self._expense_service.recalcular_totais(referencia)
        return float(valor)

    def obter_total_despesas(self, referencia: date) -> float:
        return self._expense_service.calcular_total_despesas(referencia)

    def obter_resultado_operacional(self, referencia: date) -> float:
        renda = self._expense_service.obter_renda_mensal(referencia)
        total = self._expense_service.calcular_total_despesas(referencia)
        return renda - total
