from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Expense:
    """Representa um lançamento de despesa informado pelo usuário no formulário.

    A planilha não guarda lançamentos individuais: cada célula (mês x
    subcategoria) armazena um valor agregado e uma lista de meios de
    pagamento concatenada. `Expense` é a entrada do lançamento; o que fica
    persistido é o resultado da regra de negócio aplicada sobre a célula.
    """

    valor: float
    data: date
    categoria: str
    subcategoria: str
    meio_pagamento: str


@dataclass(frozen=True)
class ExpenseCell:
    """Representa o estado agregado atual de uma célula (mês x subcategoria)."""

    categoria: str
    subcategoria: str
    mes_referencia: date
    valor: float
    meios_pagamento: list[str]
