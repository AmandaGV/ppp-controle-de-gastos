"""CRUD de Meios de Pagamento.

A planilha original não possui uma aba com o catálogo de meios de pagamento
(apenas texto livre concatenado nas células de despesa). Este serviço mantém
esse catálogo em uma aba própria ("Meios de Pagamento") dentro do mesmo
arquivo .xlsx, que alimenta as opções disponíveis no formulário de despesas.
Renomear um meio de pagamento propaga a alteração para as células já
lançadas na planilha de despesas, preservando os demais meios concatenados
na mesma célula.
"""
from api import config
from api.repositories.expense_repository import ExpenseRepository
from api.services.layout_service import SheetLayoutService

_HEADER = "Nome"
_SEED_PADRAO = ["Cartão de Crédito", "Cartão de Débito", "Pix", "Dinheiro", "Boleto"]


def _norm(texto: str) -> str:
    return " ".join(texto.strip().upper().split())


class PaymentMethodService:
    def __init__(self, repository: ExpenseRepository, layout_service: SheetLayoutService):
        self._repo = repository
        self._layout_service = layout_service
        self._sheet = config.SHEET_MEIOS_PAGAMENTO
        self._despesas_sheet = config.SHEET_DESPESAS

    def _ensure_sheet(self):
        sheet_ja_existia = self._sheet in self._repo.workbook.sheetnames
        sheet = self._repo.get_or_create_sheet(self._sheet)
        if sheet.cell(row=1, column=1).value != _HEADER:
            sheet.cell(row=1, column=1, value=_HEADER)
            self._repo.save()
        if not sheet_ja_existia:
            for indice, nome in enumerate(_SEED_PADRAO, start=2):
                sheet.cell(row=indice, column=1, value=nome)
            self._repo.save()
        return sheet

    def listar(self) -> list[str]:
        sheet = self._ensure_sheet()
        nomes = []
        for row in range(2, sheet.max_row + 1):
            valor = sheet.cell(row=row, column=1).value
            if valor is not None and str(valor).strip():
                nomes.append(str(valor).strip())
        return nomes

    def buscar(self, nome: str) -> str | None:
        chave = _norm(nome)
        for existente in self.listar():
            if _norm(existente) == chave:
                return existente
        return None

    def cadastrar(self, nome: str) -> None:
        nome = nome.strip()
        if not nome:
            raise ValueError("Nome do meio de pagamento não pode ser vazio.")
        if self.buscar(nome) is not None:
            raise ValueError(f"Meio de pagamento '{nome}' já está cadastrado.")

        sheet = self._ensure_sheet()
        proxima_linha = 2
        while sheet.cell(row=proxima_linha, column=1).value not in (None, ""):
            proxima_linha += 1
        sheet.cell(row=proxima_linha, column=1, value=nome)
        self._repo.save()

    def atualizar(self, nome_atual: str, novo_nome: str) -> None:
        novo_nome = novo_nome.strip()
        if not novo_nome:
            raise ValueError("Novo nome não pode ser vazio.")

        sheet = self._ensure_sheet()
        linha_encontrada = None
        nome_original = None
        for row in range(2, sheet.max_row + 1):
            valor = sheet.cell(row=row, column=1).value
            if valor is not None and _norm(str(valor)) == _norm(nome_atual):
                linha_encontrada = row
                nome_original = str(valor)
                break
        if linha_encontrada is None:
            raise ValueError(f"Meio de pagamento '{nome_atual}' não encontrado.")
        if _norm(novo_nome) != _norm(nome_atual) and self.buscar(novo_nome) is not None:
            raise ValueError(f"Já existe um meio de pagamento chamado '{novo_nome}'.")

        sheet.cell(row=linha_encontrada, column=1, value=novo_nome)
        self._renomear_em_despesas(nome_original, novo_nome)
        self._repo.save()

    def excluir(self, nome: str) -> None:
        sheet = self._ensure_sheet()
        for row in range(2, sheet.max_row + 1):
            valor = sheet.cell(row=row, column=1).value
            if valor is not None and _norm(str(valor)) == _norm(nome):
                sheet.delete_rows(row)
                self._repo.save()
                return
        raise ValueError(f"Meio de pagamento '{nome}' não encontrado.")

    def _renomear_em_despesas(self, nome_antigo: str, novo_nome: str) -> None:
        layout = self._layout_service.get_layout(self._despesas_sheet)
        chave_antiga = _norm(nome_antigo)
        for cols in layout.month_columns.values():
            for row in layout.all_subcategory_rows:
                texto = self._repo.get_cell(self._despesas_sheet, row, cols.meio_pagamento_col)
                if not texto:
                    continue
                partes = [p.strip() for p in str(texto).split(",") if p.strip()]
                if not any(_norm(p) == chave_antiga for p in partes):
                    continue
                novas_partes = [novo_nome if _norm(p) == chave_antiga else p for p in partes]
                self._repo.set_cell(
                    self._despesas_sheet, row, cols.meio_pagamento_col, ", ".join(novas_partes)
                )
