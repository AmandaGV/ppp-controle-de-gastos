"""Ponto de entrada da interface Streamlit.

Executar com:
    streamlit run app.py
"""
import streamlit as st

from src.ui.dependencies import AppContext, build_context
from src.ui.views import dashboard_view, expenses_view, income_view, payment_methods_view

st.set_page_config(page_title="Controle de Gastos Pessoais", layout="wide")


@st.cache_resource
def get_context() -> AppContext:
    return build_context()


def main() -> None:
    ctx = get_context()

    st.title("Controle de Gastos Pessoais")

    menu = st.sidebar.radio(
        "Menu",
        ["Despesas", "Meios de Pagamento", "Renda e Resultado", "Planilha Completa"],
    )

    if st.sidebar.button("Recarregar planilha do disco"):
        ctx.repository.reload()
        ctx.layout_service.refresh()
        st.rerun()

    if menu == "Despesas":
        expenses_view.render(ctx)
    elif menu == "Meios de Pagamento":
        payment_methods_view.render(ctx)
    elif menu == "Renda e Resultado":
        income_view.render(ctx)
    else:
        dashboard_view.render(ctx)


if __name__ == "__main__":
    main()
