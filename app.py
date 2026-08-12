"""Launcher da interface Streamlit.

Executar com:
    streamlit run app.py

A UI é um processo à parte da API — inicie o servidor do backend Node.js
antes (cd backend && npm start). Toda a tela vive em ui/, que consome a API
via HTTP (ui/api_client.py); nenhum código aqui acessa a planilha diretamente.
"""
import streamlit as st

from ui.main import main

st.set_page_config(page_title="Controle de Gastos Pessoais", layout="wide")

if __name__ == "__main__":
    main()
