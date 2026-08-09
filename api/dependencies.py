"""Composition root da API: monta e conecta repositório, services e
controllers. É o único lugar do backend que conhece todas as camadas ao
mesmo tempo. O contexto é montado uma única vez (singleton em cache) para
que o workbook fique carregado em memória entre requisições, em vez de
reabrir o .xlsx a cada chamada."""
from dataclasses import dataclass
from functools import lru_cache

from api.controllers.expense_controller import ExpenseController
from api.controllers.income_controller import IncomeController
from api.controllers.payment_method_controller import PaymentMethodController
from api.repositories.expense_repository import ExpenseRepository
from api.services.expense_service import ExpenseService
from api.services.income_service import IncomeService
from api.services.layout_service import SheetLayoutService
from api.services.payment_method_service import PaymentMethodService


@dataclass
class AppContext:
    repository: ExpenseRepository
    layout_service: SheetLayoutService
    expense_controller: ExpenseController
    income_controller: IncomeController
    payment_method_controller: PaymentMethodController


@lru_cache
def get_context() -> AppContext:
    repository = ExpenseRepository()
    layout_service = SheetLayoutService(repository)

    expense_service = ExpenseService(repository, layout_service)
    income_service = IncomeService(repository, layout_service, expense_service)
    payment_method_service = PaymentMethodService(repository, layout_service)

    return AppContext(
        repository=repository,
        layout_service=layout_service,
        expense_controller=ExpenseController(expense_service),
        income_controller=IncomeController(income_service),
        payment_method_controller=PaymentMethodController(payment_method_service),
    )


def get_expense_controller() -> ExpenseController:
    return get_context().expense_controller


def get_income_controller() -> IncomeController:
    return get_context().income_controller


def get_payment_method_controller() -> PaymentMethodController:
    return get_context().payment_method_controller
