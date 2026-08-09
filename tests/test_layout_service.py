from datetime import date

import pytest


def test_localiza_linhas_especiais(layout_service):
    layout = layout_service.get_layout()
    assert layout.total_despesas_row is not None
    assert layout.renda_mensal_row is not None
    assert layout.resultado_operacional_row is not None


def test_localiza_doze_meses(layout_service):
    layout = layout_service.get_layout()
    assert len(layout.month_columns) == 12
    assert (2026, 6) in layout.month_columns


def test_localiza_categoria_e_subcategoria(layout_service):
    layout = layout_service.get_layout()
    row = layout.get_subcategory_row("ALIMENTAÇÃO", "Supermercado")
    assert row > layout.header_row


def test_categoria_inexistente_gera_erro(layout_service):
    layout = layout_service.get_layout()
    with pytest.raises(ValueError):
        layout.get_category("CATEGORIA QUE NÃO EXISTE")


def test_mes_fora_do_periodo_gera_erro(layout_service):
    layout = layout_service.get_layout()
    with pytest.raises(ValueError):
        layout.get_month_columns(date(1999, 1, 1))
