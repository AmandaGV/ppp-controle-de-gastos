"""View de Renda Mensal e Resultado Operacional. Toda leitura/escrita
passa pelo cliente HTTP (ctx.income_client / ctx.expense_client)."""
import streamlit as st

from ui.api_client import ApiConnectionError, ApiError
from ui.dependencies import AppContext
from ui.views import dashboard_view


def render(ctx: AppContext) -> None:
    st.header("Renda e Resultado Operacional")

    try:
        meses = ctx.expense_client.listar_meses_disponiveis()
    except (ApiError, ApiConnectionError) as erro:
        st.error(str(erro))
        return

    opcoes = {f"{mes.month:02d}/{mes.year}": mes for mes in meses}
    label = st.selectbox("Mês de referência", list(opcoes.keys()))
    referencia = opcoes.get(label)

    if referencia:
        try:
            resumo = ctx.income_client.obter_resumo(referencia)
            col1, col2, col3 = st.columns(3)
            col1.metric("Renda Mensal", f"R$ {resumo['renda_mensal']:.2f}")
            col2.metric("Total das Despesas", f"R$ {resumo['total_despesas']:.2f}")
            col3.metric("Resultado Operacional", f"R$ {resumo['resultado_operacional']:.2f}")
        except (ApiError, ApiConnectionError) as erro:
            st.error(str(erro))

    with st.form("form_atualizar_renda"):
        novo_valor = st.number_input(
            "Nova Renda Mensal (R$)", min_value=0.0, step=100.0, format="%.2f"
        )
        enviado = st.form_submit_button("Atualizar Renda Mensal")

    if enviado:
        try:
            ctx.income_client.atualizar_renda(referencia, novo_valor)
            st.success(f"Renda Mensal de {label} atualizada para R$ {novo_valor:.2f}.")
            dashboard_view.render_table(ctx)
        except (ApiError, ApiConnectionError) as erro:
            st.error(str(erro))
