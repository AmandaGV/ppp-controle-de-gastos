import shutil
from datetime import date

import pytest

from api import config
from api.repositories.expense_repository import ExpenseRepository
from api.services.expense_service import ExpenseService
from api.services.income_service import IncomeService
from api.services.layout_service import SheetLayoutService
from api.services.payment_method_service import PaymentMethodService


@pytest.fixture
def planilha_temporaria(tmp_path):
    """Copia a planilha real para um diretório temporário, para que os
    testes nunca escrevam no arquivo usado pela aplicação."""
    destino = tmp_path / "PLANILHA CONTROLE DE GASTOS.xlsx"
    shutil.copy(config.PLANILHA_PATH, destino)
    return destino


@pytest.fixture
def repository(planilha_temporaria):
    return ExpenseRepository(path=planilha_temporaria)


@pytest.fixture
def layout_service(repository):
    return SheetLayoutService(repository)


@pytest.fixture
def expense_service(repository, layout_service):
    return ExpenseService(repository, layout_service)


@pytest.fixture
def income_service(repository, layout_service, expense_service):
    return IncomeService(repository, layout_service, expense_service)


@pytest.fixture
def payment_method_service(repository, layout_service):
    return PaymentMethodService(repository, layout_service)


@pytest.fixture
def mes_referencia():
    return date(2026, 6, 1)
