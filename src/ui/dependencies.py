"""Composition root: monta e conecta repositórios, serviços e controllers.
É o único lugar do sistema que conhece todas as camadas ao mesmo tempo."""
from dataclasses import dataclass

from src.controllers.expense_controller import ExpenseController
from src.controllers.income_controller import IncomeController
from src.controllers.payment_method_controller import PaymentMethodController
from src.repositories.expense_repository import ExpenseRepository
from src.services.expense_service import ExpenseService
from src.services.income_service import IncomeService
from src.services.layout_service import SheetLayoutService
from src.services.payment_method_service import PaymentMethodService


@dataclass
class AppContext:
    repository: ExpenseRepository
    layout_service: SheetLayoutService
    expense_controller: ExpenseController
    income_controller: IncomeController
    payment_method_controller: PaymentMethodController


def build_context() -> AppContext:
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
