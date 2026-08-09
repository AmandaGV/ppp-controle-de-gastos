"""View responsável por exibir o estado atual da planilha (DataFrame)."""
import streamlit as st

from src.ui.dependencies import AppContext


def render_table(ctx: AppContext) -> None:
    df = ctx.expense_controller.obter_dataframe()
    st.dataframe(df.round(2), width="stretch")


def render(ctx: AppContext) -> None:
    st.header("Planilha Completa")
    st.caption(
        "Visão consolidada de todas as categorias, subcategorias, meses, "
        "Total das Despesas, Renda Mensal e Resultado Operacional."
    )
    render_table(ctx)
