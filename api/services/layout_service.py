"""Serviço responsável por localizar dinamicamente, dentro da planilha, a
coluna do mês/ano e a linha da categoria/subcategoria. Nenhuma coordenada de
linha ou coluna é fixada em código: tudo é descoberto lendo os rótulos reais
da planilha, para que o sistema continue funcionando mesmo que linhas/colunas
sejam inseridas ou reordenadas na planilha original.
"""
from dataclasses import dataclass, field
from datetime import date, datetime

from src import config
from src.repositories.expense_repository import ExpenseRepository


@dataclass(frozen=True)
class MonthColumns:
    valor_col: int
    meio_pagamento_col: int


@dataclass(frozen=True)
class CategoryBlock:
    header_row: int
    subcategory_rows: dict[str, int] = field(default_factory=dict)


@dataclass(frozen=True)
class SheetLayout:
    label_col: int
    header_row: int
    month_columns: dict[tuple[int, int], MonthColumns]
    categories: dict[str, CategoryBlock]
    total_despesas_row: int
    renda_mensal_row: int
    resultado_operacional_row: int
    all_subcategory_rows: tuple[int, ...] = ()

    def month_key(self, referencia: date) -> tuple[int, int]:
        return (referencia.year, referencia.month)

    def get_month_columns(self, referencia: date) -> MonthColumns:
        key = self.month_key(referencia)
        if key not in self.month_columns:
            meses_disponiveis = ", ".join(
                f"{m:02d}/{y}" for (y, m) in sorted(self.month_columns)
            )
            raise ValueError(
                f"A planilha não possui coluna para {referencia.month:02d}/{referencia.year}. "
                f"Meses disponíveis: {meses_disponiveis}"
            )
        return self.month_columns[key]

    def get_category(self, categoria: str) -> CategoryBlock:
        chave = _norm(categoria)
        for nome, bloco in self.categories.items():
            if _norm(nome) == chave:
                return bloco
        raise ValueError(f"Categoria '{categoria}' não encontrada na planilha.")

    def get_subcategory_row(self, categoria: str, subcategoria: str) -> int:
        bloco = self.get_category(categoria)
        chave = _norm(subcategoria)
        for nome, row in bloco.subcategory_rows.items():
            if _norm(nome) == chave:
                return row
        raise ValueError(
            f"Subcategoria '{subcategoria}' não encontrada em '{categoria}'."
        )


def _norm(texto: str) -> str:
    return " ".join(texto.strip().upper().split())


def _is_category_header(valor) -> bool:
    if not isinstance(valor, str):
        return False
    texto = valor.strip()
    if not texto or not any(ch.isalpha() for ch in texto):
        return False
    return texto == texto.upper()


class SheetLayoutService:
    def __init__(self, repository: ExpenseRepository):
        self._repository = repository
        self._cache: dict[str, SheetLayout] = {}

    def refresh(self) -> None:
        self._cache.clear()

    def get_layout(self, sheet_name: str = config.SHEET_DESPESAS) -> SheetLayout:
        if sheet_name not in self._cache:
            self._cache[sheet_name] = self._build_layout(sheet_name)
        return self._cache[sheet_name]

    def _build_layout(self, sheet_name: str) -> SheetLayout:
        max_row, max_col = self._repository.dimensions(sheet_name)

        header_row, label_col = self._find_header(sheet_name, max_row, max_col)
        month_columns = self._scan_month_columns(sheet_name, header_row, label_col, max_col)

        categories: dict[str, CategoryBlock] = {}
        all_subcategory_rows: list[int] = []
        total_despesas_row = None
        renda_mensal_row = None
        resultado_operacional_row = None
        current_category: str | None = None

        for row in range(header_row + 1, max_row + 1):
            valor = self._repository.get_cell(sheet_name, row, label_col)
            if valor is None or (isinstance(valor, str) and not valor.strip()):
                continue
            texto = valor.strip() if isinstance(valor, str) else valor

            if texto == config.LABEL_TOTAL_DESPESAS:
                total_despesas_row = row
                current_category = None
                continue
            if texto == config.LABEL_RENDA_MENSAL:
                renda_mensal_row = row
                continue
            if texto == config.LABEL_RESULTADO_OPERACIONAL:
                resultado_operacional_row = row
                continue
            if total_despesas_row is not None:
                # Linhas após "Total das Despesas" (ex.: Investimentos Mensais)
                # não fazem parte do bloco de categorias.
                continue

            if _is_category_header(texto):
                if texto == "DESPESAS":
                    # título de seção, não é uma categoria de fato
                    current_category = None
                    continue
                current_category = texto
                categories[texto] = CategoryBlock(header_row=row)
            elif current_category is not None:
                categories[current_category].subcategory_rows[str(texto)] = row
                all_subcategory_rows.append(row)

        if total_despesas_row is None:
            raise ValueError(
                f"Não foi possível localizar a linha '{config.LABEL_TOTAL_DESPESAS}' na planilha."
            )
        if renda_mensal_row is None:
            raise ValueError(
                f"Não foi possível localizar a linha '{config.LABEL_RENDA_MENSAL}' na planilha."
            )
        if resultado_operacional_row is None:
            raise ValueError(
                f"Não foi possível localizar a linha '{config.LABEL_RESULTADO_OPERACIONAL}' na planilha."
            )

        categories = {
            nome: bloco for nome, bloco in categories.items() if bloco.subcategory_rows
        }

        return SheetLayout(
            label_col=label_col,
            header_row=header_row,
            month_columns=month_columns,
            categories=categories,
            total_despesas_row=total_despesas_row,
            renda_mensal_row=renda_mensal_row,
            resultado_operacional_row=resultado_operacional_row,
            all_subcategory_rows=tuple(all_subcategory_rows),
        )

    def _find_header(self, sheet_name: str, max_row: int, max_col: int) -> tuple[int, int]:
        for row in self._repository.iter_rows(sheet_name, min_row=1, max_row=max_row, min_col=1, max_col=max_col):
            for cell in row:
                if isinstance(cell.value, str) and cell.value.strip() == config.LABEL_MESES:
                    return cell.row, cell.column
        raise ValueError(
            f"Não foi possível localizar o cabeçalho '{config.LABEL_MESES}' na planilha."
        )

    def _scan_month_columns(
        self, sheet_name: str, header_row: int, label_col: int, max_col: int
    ) -> dict[tuple[int, int], MonthColumns]:
        month_columns: dict[tuple[int, int], MonthColumns] = {}
        col = label_col + 1
        while col <= max_col:
            valor = self._repository.get_cell(sheet_name, header_row, col)
            if isinstance(valor, (date, datetime)):
                pagamento_col = col + 1
                key = (valor.year, valor.month)
                month_columns[key] = MonthColumns(valor_col=col, meio_pagamento_col=pagamento_col)
                col += 2
            else:
                col += 1
        return month_columns
