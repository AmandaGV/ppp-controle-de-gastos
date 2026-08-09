"""Controller de Despesas: valida as entradas vindas da interface e aciona
o ExpenseService. Nenhuma regra de negócio vive aqui — apenas validação e
orquestração."""
from datetime import date

import pandas as pd

from src.models.expense import Expense, ExpenseCell
from src.services.expense_service import ExpenseService


class ExpenseController:
    def __init__(self, expense_service: ExpenseService):
        self._service = expense_service

    def listar_categorias(self) -> list[str]:
        return self._service.listar_categorias()

    def listar_subcategorias(self, categoria: str) -> list[str]:
        return self._service.listar_subcategorias(categoria)

    def listar_meses_disponiveis(self) -> list[date]:
        return self._service.listar_meses_disponiveis()

    def obter_dataframe(self) -> pd.DataFrame:
        return self._service.montar_dataframe()

    def cadastrar(
        self,
        valor,
        data: date,
        categoria: str,
        subcategoria: str,
        meio_pagamento: str,
    ) -> ExpenseCell:
        self._validar_selecao(categoria, subcategoria, data)
        valor_float = self._validar_valor(valor, permitir_zero=False)
        if not meio_pagamento or not meio_pagamento.strip():
            raise ValueError("Informe o meio de pagamento.")

        despesa = Expense(
            valor=valor_float,
            data=data,
            categoria=categoria,
            subcategoria=subcategoria,
            meio_pagamento=meio_pagamento.strip(),
        )
        return self._service.cadastrar(despesa)

    def buscar(self, categoria: str, subcategoria: str, referencia: date) -> ExpenseCell:
        self._validar_selecao(categoria, subcategoria, referencia)
        return self._service.buscar(categoria, subcategoria, referencia)

    def atualizar(
        self,
        categoria: str,
        subcategoria: str,
        referencia: date,
        novo_valor,
        meio_pagamento: str | None = None,
    ) -> ExpenseCell:
        self._validar_selecao(categoria, subcategoria, referencia)
        valor_float = self._validar_valor(novo_valor, permitir_zero=True)
        return self._service.atualizar(
            categoria, subcategoria, referencia, valor_float, meio_pagamento
        )

    def excluir(self, categoria: str, subcategoria: str, referencia: date) -> None:
        self._validar_selecao(categoria, subcategoria, referencia)
        self._service.excluir(categoria, subcategoria, referencia)

    def _validar_selecao(self, categoria, subcategoria, referencia) -> None:
        if not categoria:
            raise ValueError("Selecione a categoria.")
        if not subcategoria:
            raise ValueError("Selecione a subcategoria.")
        if not referencia:
            raise ValueError("Informe a data/mês de referência.")

    def _validar_valor(self, valor, permitir_zero: bool) -> float:
        try:
            valor_float = float(valor)
        except (TypeError, ValueError):
            raise ValueError("Valor inválido.") from None
        if valor_float < 0:
            raise ValueError("Valor não pode ser negativo.")
        if not permitir_zero and valor_float == 0:
            raise ValueError("Valor deve ser maior que zero.")
        return valor_float
