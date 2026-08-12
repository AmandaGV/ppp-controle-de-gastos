# Endpoints e Swagger

## Base da API

A API FastAPI está configurada para rodar na raiz do app e expõe os endpoints a partir dos prefixos abaixo:

- `/despesas`
- `/meios-pagamento`
- `/renda`
- `/sistema`

A documentação interativa Swagger fica disponível em:

- `/docs`

## Endpoints principais

### Despesas

- `GET /despesas/categorias`
  - Lista categorias disponíveis na planilha.
- `GET /despesas/categorias/{categoria}/subcategorias`
  - Lista subcategorias de uma categoria.
- `GET /despesas/meses`
  - Lista meses/anos disponíveis.
- `GET /despesas`
  - Busca o valor agregado de uma despesa.
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.
- `POST /despesas`
  - Cadastra uma despesa e soma ao valor existente.
  - Payload: `valor`, `data`, `categoria`, `subcategoria`, `meio_pagamento`.
- `PUT /despesas`
  - Atualiza o valor de uma célula (substitui o valor atual).
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.
- `DELETE /despesas`
  - Exclui (zera) uma despesa.
  - Parâmetros obrigatórios: `categoria`, `subcategoria`, `ano`, `mes`.

### Meios de Pagamento

- `GET /meios-pagamento`
  - Lista todos os meios de pagamento do catálogo.
- `GET /meios-pagamento/{nome}`
  - Busca um meio de pagamento pelo nome.
- `POST /meios-pagamento`
  - Cadastra um novo meio de pagamento.
- `PUT /meios-pagamento/{nome_atual}`
  - Renomeia um meio de pagamento e propaga a alteração nas células de despesas.
- `DELETE /meios-pagamento/{nome}`
  - Exclui um meio de pagamento do catálogo.

### Renda Mensal

- `GET /renda`
  - Retorna `renda_mensal`, `total_despesas` e `resultado_operacional` para o mês.
- `PUT /renda`
  - Atualiza a renda mensal de um mês.

### Sistema

- `POST /sistema/reload`
  - Recarrega o arquivo Excel do disco, descartando cache de workbook/layout.

## Swagger / OpenAPI

A API FastAPI gera a documentação Swagger automaticamente em `/docs`. Os modelos de entrada e saída são definidos em `api/schemas`.

### Principais modelos expostos

- `ExpenseCreate` — payload de cadastro de despesa.
- `ExpenseUpdate` — payload de atualização de despesa.
- `ExpenseCellOut` — resposta de busca/cadastro/atualização de despesa.
- `PaymentMethodCreate`, `PaymentMethodUpdate`, `PaymentMethodOut` — contratos de meio de pagamento.
- `IncomeUpdate`, `IncomeSummaryOut` — contratos de renda mensal.
- `PlanilhaOut`, `LinhaOut`, `CellOut` — visualização consolidada da planilha.

## Observações

- O backend Node.js em `backend/` também contém sua própria documentação Swagger em `/api/docs`, mas o foco dos testes e da API ativa deste repositório é a implementação em `api/`.
