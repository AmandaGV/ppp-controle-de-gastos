"""Composition root da interface: monta os clientes HTTP que consomem a
API REST. É o único lugar da UI que conhece os detalhes de transporte
(base URL, biblioteca requests); as views só enxergam os clientes."""
from dataclasses import dataclass

from ui.api_client import ExpenseApiClient, IncomeApiClient, PaymentMethodApiClient, SystemApiClient


@dataclass
class AppContext:
    expense_client: ExpenseApiClient
    income_client: IncomeApiClient
    payment_method_client: PaymentMethodApiClient
    system_client: SystemApiClient


def build_context() -> AppContext:
    return AppContext(
        expense_client=ExpenseApiClient(),
        income_client=IncomeApiClient(),
        payment_method_client=PaymentMethodApiClient(),
        system_client=SystemApiClient(),
    )
