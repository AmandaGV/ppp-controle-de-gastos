"""View de CRUD de Despesas."""
from datetime import date

import streamlit as st

from src.ui.dependencies import AppContext
from src.ui.views import dashboard_view


def render(ctx: AppContext) -> None:
    st.header("Despesas")
    aba_cadastrar, aba_buscar, aba_atualizar, aba_excluir = st.tabs(
        ["Cadastrar", "Buscar", "Atualizar", "Excluir"]
    )

    with aba_cadastrar:
        _render_cadastrar(ctx)
    with aba_buscar:
        _render_buscar(ctx)
    with aba_atualizar:
        _render_atualizar(ctx)
    with aba_excluir:
        _render_excluir(ctx)


def _selecionar_categoria_subcategoria(ctx: AppContext, key_prefix: str) -> tuple[str, str]:
    categorias = ctx.expense_controller.listar_categorias()
    categoria = st.selectbox("Categoria", categorias, key=f"{key_prefix}_categoria")
    subcategorias = ctx.expense_controller.listar_subcategorias(categoria) if categoria else []
    subcategoria = st.selectbox("Subcategoria", subcategorias, key=f"{key_prefix}_subcategoria")
    return categoria, subcategoria


def _selecionar_mes(ctx: AppContext, key_prefix: str) -> date | None:
    meses = ctx.expense_controller.listar_meses_disponiveis()
    opcoes = {f"{mes.month:02d}/{mes.year}": mes for mes in meses}
    label = st.selectbox("Mês de referência", list(opcoes.keys()), key=f"{key_prefix}_mes")
    return opcoes.get(label)


def _render_cadastrar(ctx: AppContext) -> None:
    categoria, subcategoria = _selecionar_categoria_subcategoria(ctx, "cad")
    meios = ctx.payment_method_controller.listar()
    if not meios:
        st.warning(
            "Nenhum meio de pagamento cadastrado. Cadastre um na aba "
            "'Meios de Pagamento' antes de lançar despesas."
        )
        return

    with st.form("form_cadastrar_despesa"):
        valor = st.number_input("Valor (R$)", min_value=0.0, step=10.0, format="%.2f")
        data_despesa = st.date_input("Data", value=date.today())
        meio_pagamento = st.selectbox("Meio de Pagamento", meios)
        enviado = st.form_submit_button("Cadastrar despesa")

    if enviado:
        try:
            resultado = ctx.expense_controller.cadastrar(
                valor, data_despesa, categoria, subcategoria, meio_pagamento
            )
            st.success(
                f"Despesa cadastrada. Novo total de {resultado.subcategoria} em "
                f"{resultado.mes_referencia.month:02d}/{resultado.mes_referencia.year}: "
                f"R$ {resultado.valor:.2f} — Meios: {', '.join(resultado.meios_pagamento)}"
            )
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))


def _render_buscar(ctx: AppContext) -> None:
    categoria, subcategoria = _selecionar_categoria_subcategoria(ctx, "busca")
    referencia = _selecionar_mes(ctx, "busca")

    if st.button("Buscar despesa"):
        try:
            resultado = ctx.expense_controller.buscar(categoria, subcategoria, referencia)
            st.info(
                f"{resultado.categoria} / {resultado.subcategoria} — "
                f"{resultado.mes_referencia.month:02d}/{resultado.mes_referencia.year}: "
                f"R$ {resultado.valor:.2f} — Meios de pagamento: "
                f"{', '.join(resultado.meios_pagamento) or '—'}"
            )
        except ValueError as erro:
            st.error(str(erro))


def _render_atualizar(ctx: AppContext) -> None:
    categoria, subcategoria = _selecionar_categoria_subcategoria(ctx, "atu")
    referencia = _selecionar_mes(ctx, "atu")
    meios = ctx.payment_method_controller.listar()

    with st.form("form_atualizar_despesa"):
        novo_valor = st.number_input("Novo valor (R$)", min_value=0.0, step=10.0, format="%.2f")
        substituir_meio = st.checkbox("Substituir também o(s) meio(s) de pagamento?")
        novo_meio = st.selectbox("Novo meio de pagamento", meios) if meios else None
        enviado = st.form_submit_button("Atualizar despesa")

    if enviado:
        try:
            resultado = ctx.expense_controller.atualizar(
                categoria,
                subcategoria,
                referencia,
                novo_valor,
                novo_meio if substituir_meio else None,
            )
            st.success(
                f"Despesa atualizada. {resultado.subcategoria} em "
                f"{resultado.mes_referencia.month:02d}/{resultado.mes_referencia.year}: "
                f"R$ {resultado.valor:.2f}"
            )
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))


def _render_excluir(ctx: AppContext) -> None:
    categoria, subcategoria = _selecionar_categoria_subcategoria(ctx, "exc")
    referencia = _selecionar_mes(ctx, "exc")

    st.warning("Excluir zera o valor e limpa o(s) meio(s) de pagamento dessa célula.")
    if st.button("Excluir despesa", type="primary"):
        try:
            ctx.expense_controller.excluir(categoria, subcategoria, referencia)
            st.success(f"Despesa de {subcategoria} removida do mês selecionado.")
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))
