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
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.
- `POST /api/despesas`
  - Cadastra uma despesa e soma ao valor existente.
  - Payload: `valor`, `data`, `categoria`, `subcategoria`, `meio_pagamento`.
- `PUT /api/despesas`
  - Atualiza o valor de uma célula (substitui o valor atual).
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.
- `DELETE /api/despesas`
  - Exclui (zera) uma despesa.
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.

### Meios de Pagamento

- `GET /api/meios-pagamento`
  - Lista todos os meios de pagamento do catálogo.
- `GET /api/meios-pagamento/{nome}`
  - Busca um meio de pagamento pelo nome.
- `POST /api/meios-pagamento`
  - Cadastra um novo meio de pagamento.
- `PUT /api/meios-pagamento/{nome_atual}`
  - Renomeia um meio de pagamento e propaga a alteração nas células de despesas.
- `DELETE /api/meios-pagamento/{nome}`
  - Exclui um meio de pagamento do catálogo.

### Renda Mensal

- `GET /api/renda`
  - Retorna `renda_mensal`, `total_despesas` e `resultado_operacional` para o mês.
- `PUT /api/renda`
  - Atualiza a renda mensal de um mês.

### Sistema

- `POST /api/sistema/reload`
  - Recarrega o arquivo Excel do disco, descartando cache de workbook/layout.

## Swagger / OpenAPI

A API Node.js gera a documentação Swagger automaticamente em `/api/docs` usando `swagger-jsdoc` e `swagger-ui-express`.

## Observações

- A implementação ativa do repositório é a API do diretório `backend/`.
- O projeto ainda pode incluir interfaces opcionais em Python, mas a API oficial e documentada é a Node.js.
