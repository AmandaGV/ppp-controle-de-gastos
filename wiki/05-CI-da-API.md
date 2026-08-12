# CI da API

## Estado atual

Não há um pipeline de CI configurado no repositório (`.github/workflows/` não está presente).

## Recomendação de pipeline

Sugere-se usar GitHub Actions com as seguintes etapas:

1. **Checkout** do repositório.
2. **Instalação de dependências**:
   - `python -m pip install -U pip`
   - `pip install -r requirements.txt`
3. **Execução de lint** (opcional):
   - `flake8 api tests`
   - `ruff check api tests`
4. **Execução de testes**:
   - `pytest`

## Workflow sugerido

- disparar em `push` e `pull_request` para branches principais;
- usar matrizes de Python (por exemplo, `3.11`, `3.12`);
- configurar cache de pip para acelerar a instalação.

## Resultados esperados

- build verde se todos os testes passarem;
- relatórios de falhas claros com código de status e traceback;
- validação de que a API está compatível após cada alteração.

## Observação

A API ainda não expõe um workflow CI local; a página registra a necessidade de criar esse pipeline e o plano de ação sugerido.
