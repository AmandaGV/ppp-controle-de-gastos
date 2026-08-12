# Endpoints e Swagger

## Base da API

A API em `backend/` usa Express e expõe os endpoints com prefixo `/api`.

- `/api/despesas`
- `/api/meios-pagamento`
- `/api/renda`
- `/api/sistema`

A documentação interativa Swagger fica disponível em:

- `/api/docs`

## Endpoints principais

### Despesas

- `GET /api/despesas/categorias`
  - Lista categorias disponíveis na planilha.
- `GET /api/despesas/categorias/{categoria}/subcategorias`
  - Lista subcategorias de uma categoria.
- `GET /api/despesas/meses`
  - Lista meses/anos disponíveis.
- `GET /api/despesas`
  - Busca o valor agregado de uma despesa.
  - Parâmetros de query: `category`, `subcategory`, `year`, `month`.
- `POST /api/despesas`
  - Cadastra uma despesa e soma ao valor existente.
  - Payload: `category`, `subcategory`, `year`, `month`, `value`, `paymentMethod` (opcional).
- `PUT /api/despesas`
  - Atualiza o valor de uma célula (substitui o valor atual).
  - Parâmetros de query: `category`, `subcategory`, `year`, `month`.
  - Payload: `value`, `paymentMethod` (opcional).
- `DELETE /api/despesas`
  - Exclui (zera) uma despesa.
  - Parâmetros de query: `category`, `subcategory`, `year`, `month`.

### Meios de Pagamento

- `GET /api/meios-pagamento`
  - Lista todos os meios de pagamento do catálogo.
- `POST /api/meios-pagamento`
  - Cadastra um novo meio de pagamento.
  - Payload: `name`.
- `PUT /api/meios-pagamento/{name}`
  - Renomeia um meio de pagamento e propaga a alteração nas células de despesas.
  - Payload: `newName`.
- `DELETE /api/meios-pagamento/{name}`
  - Exclui um meio de pagamento do catálogo.

Não existe um `GET /api/meios-pagamento/{name}` para buscar um único item
pelo nome — a única forma de consulta é a listagem completa.

### Renda Mensal

- `GET /api/renda`
  - Parâmetros de query: `year`, `month`.
  - Retorna `rendaMensal`, `totalDespesas` e `resultadoOperacional` para o mês.
- `PUT /api/renda`
  - Parâmetros de query: `year`, `month`.
  - Payload: `rendaMensal`.
  - Atualiza a renda mensal de um mês.

### Sistema

- `POST /api/sistema/init`
  - Inicializa/recarrega o workbook e retorna o caminho do arquivo `.xlsx` em uso.
- `POST /api/sistema/reload`
  - Recarrega o arquivo Excel do disco, descartando cache de workbook/layout.
- `GET /api/sistema/planilha`
  - Retorna uma visão consolidada da planilha (meses, meios de pagamento e todas as linhas/células) para telas como "Planilha Completa".

## Swagger / OpenAPI

A API Node.js gera a documentação Swagger automaticamente em `/api/docs` usando `swagger-jsdoc` e `swagger-ui-express`.

## Observações

- A implementação ativa do repositório é a API do diretório `backend/`. A antiga API em Python (FastAPI) foi removida.
- O projeto inclui duas interfaces que consomem essa mesma API: `frontend/` (HTML/Vanilla JS) e `app.py` + `ui/` (Streamlit). Nenhuma delas acessa a planilha diretamente.
