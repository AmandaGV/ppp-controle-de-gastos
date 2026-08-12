"""Layout e navegação da interface Streamlit. Chamado a partir do
launcher em app.py (ver `streamlit run app.py` na raiz do projeto).

Requer a API REST em execução no backend Node.js — a UI não lê nem
grava a planilha diretamente, apenas consome os endpoints HTTP via
ui/api_client.py. Por padrão aponta para http://localhost:3000/api; defina a
variável de ambiente API_BASE_URL para apontar para outro endereço.
"""
import streamlit as st

from ui.api_client import ApiConnectionError, ApiError
from ui.dependencies import AppContext, build_context
from ui.views import dashboard_view, expenses_view, income_view, payment_methods_view


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
        try:
            ctx.system_client.recarregar()
        except (ApiError, ApiConnectionError) as erro:
            st.sidebar.error(str(erro))
        st.rerun()

    if menu == "Despesas":
        expenses_view.render(ctx)
    elif menu == "Meios de Pagamento":
        payment_methods_view.render(ctx)
    elif menu == "Renda e Resultado":
        income_view.render(ctx)
    else:
        dashboard_view.render(ctx)
