from datetime import date

from src.models.expense import Expense


def _despesa(valor, meio_pagamento, data=date(2026, 6, 15)):
    return Expense(
        valor=valor,
        data=data,
        categoria="ALIMENTAÇÃO",
        subcategoria="Supermercado",
        meio_pagamento=meio_pagamento,
    )


def test_cadastrar_soma_valores_existentes(expense_service, mes_referencia):
    expense_service.cadastrar(_despesa(100.0, "Pix"))
    resultado = expense_service.cadastrar(_despesa(50.0, "Pix"))

    assert resultado.valor == 150.0


def test_cadastrar_concatena_meios_de_pagamento_diferentes(expense_service):
    expense_service.cadastrar(_despesa(100.0, "Cartão"))
    resultado = expense_service.cadastrar(_despesa(50.0, "Pix"))

    assert resultado.meios_pagamento == ["Cartão", "Pix"]


def test_cadastrar_nao_duplica_mesmo_meio_de_pagamento(expense_service):
    expense_service.cadastrar(_despesa(100.0, "Pix"))
    resultado = expense_service.cadastrar(_despesa(50.0, "Pix"))

    assert resultado.meios_pagamento == ["Pix"]


def test_cadastrar_recalcula_total_das_despesas(
    expense_service, income_service, mes_referencia
):
    expense_service.cadastrar(_despesa(100.0, "Pix"))
    assert income_service.obter_total_despesas(mes_referencia) == 100.0


def test_atualizar_sobrescreve_valor(expense_service, mes_referencia):
    expense_service.cadastrar(_despesa(100.0, "Pix"))
    resultado = expense_service.atualizar(
        "ALIMENTAÇÃO", "Supermercado", mes_referencia, 30.0
    )
    assert resultado.valor == 30.0


def test_excluir_zera_valor_e_limpa_meio_pagamento(expense_service, mes_referencia):
    expense_service.cadastrar(_despesa(100.0, "Pix"))
    expense_service.excluir("ALIMENTAÇÃO", "Supermercado", mes_referencia)

    resultado = expense_service.buscar("ALIMENTAÇÃO", "Supermercado", mes_referencia)
    assert resultado.valor == 0.0
    assert resultado.meios_pagamento == []


def test_resultado_operacional_reflete_renda_menos_despesas(
    expense_service, income_service, mes_referencia
):
    income_service.atualizar_renda(mes_referencia, 1000.0)
    expense_service.cadastrar(_despesa(300.0, "Pix"))

    assert income_service.obter_total_despesas(mes_referencia) == 300.0
    assert income_service.obter_resultado_operacional(mes_referencia) == 700.0
