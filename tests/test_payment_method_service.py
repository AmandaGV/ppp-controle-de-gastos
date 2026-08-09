from datetime import date

import pytest

from api.models.expense import Expense


def test_catalogo_e_seedado_com_padroes_no_primeiro_uso(payment_method_service):
    meios = payment_method_service.listar()
    assert "Pix" in meios
    assert "Dinheiro" in meios


def test_cadastrar_novo_meio_de_pagamento(payment_method_service):
    payment_method_service.cadastrar("Vale Alimentação")
    assert "Vale Alimentação" in payment_method_service.listar()


def test_cadastrar_meio_de_pagamento_duplicado_gera_erro(payment_method_service):
    payment_method_service.cadastrar("Vale Alimentação")
    with pytest.raises(ValueError):
        payment_method_service.cadastrar("Vale Alimentação")


def test_atualizar_renomeia_no_catalogo(payment_method_service):
    payment_method_service.atualizar("Pix", "PIX Banco X")
    meios = payment_method_service.listar()
    assert "PIX Banco X" in meios
    assert "Pix" not in meios


def test_atualizar_propaga_renomeacao_para_despesas_ja_lancadas(
    payment_method_service, expense_service
):
    expense_service.cadastrar(
        Expense(
            valor=50.0,
            data=date(2026, 6, 10),
            categoria="ALIMENTAÇÃO",
            subcategoria="Supermercado",
            meio_pagamento="Pix",
        )
    )
    payment_method_service.atualizar("Pix", "PIX Banco X")

    resultado = expense_service.buscar(
        "ALIMENTAÇÃO", "Supermercado", date(2026, 6, 1)
    )
    assert resultado.meios_pagamento == ["PIX Banco X"]


def test_excluir_remove_do_catalogo(payment_method_service):
    payment_method_service.cadastrar("Vale Alimentação")
    payment_method_service.excluir("Vale Alimentação")
    assert "Vale Alimentação" not in payment_method_service.listar()


def test_excluir_inexistente_gera_erro(payment_method_service):
    with pytest.raises(ValueError):
        payment_method_service.excluir("Não Existe")
