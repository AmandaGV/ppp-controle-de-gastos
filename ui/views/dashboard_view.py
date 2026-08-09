"""View responsável por exibir o estado atual da planilha (DataFrame),
obtido via GET /despesas/planilha na API."""
import streamlit as st

from ui.api_client import ApiConnectionError, ApiError
from ui.dependencies import AppContext


def render_table(ctx: AppContext) -> None:
    try:
        df = ctx.expense_client.obter_dataframe()
    except (ApiError, ApiConnectionError) as erro:
        st.error(str(erro))
        return
    st.dataframe(df.round(2), width="stretch")


def render(ctx: AppContext) -> None:
    st.header("Planilha Completa")
    st.caption(
        "Visão consolidada de todas as categorias, subcategorias, meses, "
        "Total das Despesas, Renda Mensal e Resultado Operacional."
    )
    render_table(ctx)
