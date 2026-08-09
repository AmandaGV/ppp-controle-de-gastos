"""View de CRUD de Meios de Pagamento."""
import streamlit as st

from src.ui.dependencies import AppContext
from src.ui.views import dashboard_view


def render(ctx: AppContext) -> None:
    st.header("Meios de Pagamento")
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

    st.divider()
    st.subheader("Catálogo atual")
    st.write(ctx.payment_method_controller.listar())


def _render_cadastrar(ctx: AppContext) -> None:
    with st.form("form_cadastrar_meio_pagamento"):
        nome = st.text_input("Nome do meio de pagamento")
        enviado = st.form_submit_button("Cadastrar")

    if enviado:
        try:
            ctx.payment_method_controller.cadastrar(nome)
            st.success(f"Meio de pagamento '{nome.strip()}' cadastrado.")
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))


def _render_buscar(ctx: AppContext) -> None:
    nome = st.text_input("Buscar por nome", key="busca_meio_pagamento")
    if st.button("Buscar", key="btn_buscar_meio_pagamento"):
        try:
            encontrado = ctx.payment_method_controller.buscar(nome)
            if encontrado:
                st.info(f"Encontrado: {encontrado}")
            else:
                st.warning("Nenhum meio de pagamento com esse nome.")
        except ValueError as erro:
            st.error(str(erro))


def _render_atualizar(ctx: AppContext) -> None:
    meios = ctx.payment_method_controller.listar()
    if not meios:
        st.info("Nenhum meio de pagamento cadastrado ainda.")
        return

    nome_atual = st.selectbox("Meio de pagamento", meios, key="atualizar_meio_atual")
    with st.form("form_atualizar_meio_pagamento"):
        novo_nome = st.text_input("Novo nome")
        enviado = st.form_submit_button("Atualizar")

    if enviado:
        try:
            ctx.payment_method_controller.atualizar(nome_atual, novo_nome)
            st.success(f"'{nome_atual}' renomeado para '{novo_nome.strip()}'.")
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))


def _render_excluir(ctx: AppContext) -> None:
    meios = ctx.payment_method_controller.listar()
    if not meios:
        st.info("Nenhum meio de pagamento cadastrado ainda.")
        return

    nome = st.selectbox("Meio de pagamento a excluir", meios, key="excluir_meio_pagamento")
    if st.button("Excluir", type="primary", key="btn_excluir_meio_pagamento"):
        try:
            ctx.payment_method_controller.excluir(nome)
            st.success(f"'{nome}' excluído do catálogo.")
            dashboard_view.render_table(ctx)
        except ValueError as erro:
            st.error(str(erro))
