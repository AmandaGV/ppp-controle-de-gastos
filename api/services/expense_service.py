"""Regras de negócio de despesas: soma inteligente de valores, concatenação
de meios de pagamento e recálculo automático de Total das Despesas e
Resultado Operacional.

Importante: a planilha não guarda lançamentos individuais, apenas o valor
agregado por (mês, subcategoria). Por isso:
- cadastrar(): SOMA o valor informado ao que já existe na célula.
- atualizar(): SUBSTITUI o valor da célula pelo valor informado.
- excluir(): ZERA o valor e limpa o meio de pagamento da célula.
"""
from datetime import date

import pandas as pd

from src import config
from src.models.expense import Expense, ExpenseCell
from src.repositories.expense_repository import ExpenseRepository
from src.services.layout_service import SheetLayoutService
from src.services.numeric_utils import to_float


def _split_meios(texto: str | None) -> list[str]:
    if not texto:
        return []
    return [parte.strip() for parte in str(texto).split(",") if parte.strip()]


def _join_meios(meios: list[str]) -> str:
    return ", ".join(meios)


class ExpenseService:
    def __init__(self, repository: ExpenseRepository, layout_service: SheetLayoutService):
        self._repo = repository
        self._layout_service = layout_service
        self._sheet = config.SHEET_DESPESAS

    def listar_categorias(self) -> list[str]:
        layout = self._layout_service.get_layout(self._sheet)
        return list(layout.categories.keys())

    def listar_subcategorias(self, categoria: str) -> list[str]:
        layout = self._layout_service.get_layout(self._sheet)
        bloco = layout.get_category(categoria)
        return list(bloco.subcategory_rows.keys())

    def listar_meses_disponiveis(self) -> list[date]:
        layout = self._layout_service.get_layout(self._sheet)
        return [date(ano, mes, 1) for (ano, mes) in sorted(layout.month_columns)]

    def buscar(self, categoria: str, subcategoria: str, referencia: date) -> ExpenseCell:
        layout = self._layout_service.get_layout(self._sheet)
        row = layout.get_subcategory_row(categoria, subcategoria)
        cols = layout.get_month_columns(referencia)

        valor = self._repo.get_cell(self._sheet, row, cols.valor_col)
        meio = self._repo.get_cell(self._sheet, row, cols.meio_pagamento_col)

        return ExpenseCell(
            categoria=categoria,
            subcategoria=subcategoria,
            mes_referencia=date(referencia.year, referencia.month, 1),
            valor=to_float(valor),
            meios_pagamento=_split_meios(meio),
        )

    def cadastrar(self, despesa: Expense) -> ExpenseCell:
        layout = self._layout_service.get_layout(self._sheet)
        row = layout.get_subcategory_row(despesa.categoria, despesa.subcategoria)
        cols = layout.get_month_columns(despesa.data)

        valor_atual = self._repo.get_cell(self._sheet, row, cols.valor_col)
        novo_valor = to_float(valor_atual) + float(despesa.valor)
        self._repo.set_cell(self._sheet, row, cols.valor_col, novo_valor)

        meio_atual = self._repo.get_cell(self._sheet, row, cols.meio_pagamento_col)
        meios = _split_meios(meio_atual)
        if despesa.meio_pagamento and despesa.meio_pagamento not in meios:
            meios.append(despesa.meio_pagamento)
        self._repo.set_cell(self._sheet, row, cols.meio_pagamento_col, _join_meios(meios))

        self._recalcular_totais(despesa.data)
        self._repo.save()
        return self.buscar(despesa.categoria, despesa.subcategoria, despesa.data)

    def atualizar(
        self,
        categoria: str,
        subcategoria: str,
        referencia: date,
        novo_valor: float,
        meio_pagamento: str | None = None,
    ) -> ExpenseCell:
        layout = self._layout_service.get_layout(self._sheet)
        row = layout.get_subcategory_row(categoria, subcategoria)
        cols = layout.get_month_columns(referencia)

        self._repo.set_cell(self._sheet, row, cols.valor_col, float(novo_valor))
        if meio_pagamento is not None:
            self._repo.set_cell(self._sheet, row, cols.meio_pagamento_col, meio_pagamento or None)

        self._recalcular_totais(referencia)
        self._repo.save()
        return self.buscar(categoria, subcategoria, referencia)

    def excluir(self, categoria: str, subcategoria: str, referencia: date) -> None:
        layout = self._layout_service.get_layout(self._sheet)
        row = layout.get_subcategory_row(categoria, subcategoria)
        cols = layout.get_month_columns(referencia)

        self._repo.set_cell(self._sheet, row, cols.valor_col, 0)
        self._repo.set_cell(self._sheet, row, cols.meio_pagamento_col, None)

        self._recalcular_totais(referencia)
        self._repo.save()

    def montar_dataframe(self) -> pd.DataFrame:
        """Monta uma visão tabular (pivô mês x categoria/subcategoria) do
        estado atual da planilha, para exibição na interface."""
        layout = self._layout_service.get_layout(self._sheet)
        meses = sorted(layout.month_columns.keys())

        colunas = []
        for ano, mes in meses:
            label = f"{config.MESES_PT_BR[mes]}/{ano}"
            colunas.append((label, "Valor (R$)"))
            colunas.append((label, "Meio de Pagamento"))
        columns = pd.MultiIndex.from_tuples(colunas)

        indices: list[tuple[str, str]] = []
        linhas: list[list] = []
        totais_por_mes: dict[tuple[int, int], float] = {mes: 0.0 for mes in meses}
        for categoria, bloco in layout.categories.items():
            for subcategoria, row in bloco.subcategory_rows.items():
                indices.append((categoria, subcategoria))
                valores = []
                for mes in meses:
                    cols = layout.month_columns[mes]
                    valor = to_float(self._repo.get_cell(self._sheet, row, cols.valor_col))
                    meio = self._repo.get_cell(self._sheet, row, cols.meio_pagamento_col) or ""
                    totais_por_mes[mes] += valor
                    valores.extend([valor, meio])
                linhas.append(valores)

        # Total das Despesas e Resultado Operacional são sempre calculados a
        # partir dos valores reais das subcategorias — nunca lidos direto da
        # célula — para nunca exibir uma fórmula/erro do Excel ainda não
        # recalculada em meses que o usuário não editou nesta sessão.
        indices.append(("Resumo", config.LABEL_TOTAL_DESPESAS))
        linhas.append(
            [valor for mes in meses for valor in (totais_por_mes[mes], "")]
        )

        rendas_por_mes = {
            mes: to_float(
                self._repo.get_cell(
                    self._sheet, layout.renda_mensal_row, layout.month_columns[mes].valor_col
                )
            )
            for mes in meses
        }
        indices.append(("Resumo", config.LABEL_RENDA_MENSAL))
        linhas.append([valor for mes in meses for valor in (rendas_por_mes[mes], "")])

        indices.append(("Resumo", config.LABEL_RESULTADO_OPERACIONAL))
        linhas.append(
            [
                valor
                for mes in meses
                for valor in (rendas_por_mes[mes] - totais_por_mes[mes], "")
            ]
        )

        index = pd.MultiIndex.from_tuples(indices, names=["Categoria", "Subcategoria"])
        return pd.DataFrame(linhas, index=index, columns=columns)

    def calcular_total_despesas(self, referencia: date) -> float:
        """Soma, a partir dos valores reais lançados, o total de despesas do
        mês — nunca lido direto da célula, que pode conter uma fórmula do
        Excel ainda não recalculada nesta sessão."""
        layout = self._layout_service.get_layout(self._sheet)
        cols = layout.get_month_columns(referencia)
        return sum(
            to_float(self._repo.get_cell(self._sheet, row, cols.valor_col))
            for row in layout.all_subcategory_rows
        )

    def obter_renda_mensal(self, referencia: date) -> float:
        layout = self._layout_service.get_layout(self._sheet)
        cols = layout.get_month_columns(referencia)
        return to_float(self._repo.get_cell(self._sheet, layout.renda_mensal_row, cols.valor_col))

    def recalcular_totais(self, referencia: date) -> None:
        """Recalcula e persiste Total das Despesas e Resultado Operacional."""
        self._recalcular_totais(referencia)
        self._repo.save()

    def _recalcular_totais(self, referencia: date) -> None:
        layout = self._layout_service.get_layout(self._sheet)
        cols = layout.get_month_columns(referencia)

        total = self.calcular_total_despesas(referencia)
        self._repo.set_cell(self._sheet, layout.total_despesas_row, cols.valor_col, total)

        renda = self.obter_renda_mensal(referencia)
        resultado = renda - total
        self._repo.set_cell(
            self._sheet, layout.resultado_operacional_row, cols.valor_col, resultado
        )
