# Casos de Teste da API

## Lista de casos de teste

### 1. Listar categorias

- **Objetivo**: verificar se o endpoint retorna as categorias existentes.
- **Método/Rota**: `GET /despesas/categorias`
- **Resultado esperado**: status `200` e lista de strings com categorias.

### 2. Listar subcategorias de categoria existente

- **Objetivo**: retornar subcategorias válidas para uma categoria existente.
- **Método/Rota**: `GET /despesas/categorias/{categoria}/subcategorias`
- **Parâmetros**: `categoria=ALIMENTAÇÃO`
- **Resultado esperado**: status `200` e lista de subcategorias.

### 3. Buscar meses disponíveis

- **Objetivo**: listar os meses/anos presentes na planilha.
- **Método/Rota**: `GET /despesas/meses`
- **Resultado esperado**: status `200` e array de strings `MM/YYYY`.

### 4. Cadastrar despesa válida

- **Objetivo**: adicionar valor a uma célula de despesa.
- **Método/Rota**: `POST /despesas`
- **Payload**:
  - `valor`: `100.0`
  - `data`: `2026-06-15`
  - `categoria`: `ALIMENTAÇÃO`
  - `subcategoria`: `Supermercado`
  - `meio_pagamento`: `Pix`
- **Resultado esperado**: status `201` e objeto com a despesa cadastrada.

### 5. Buscar despesa cadastrada

- **Objetivo**: verificar que a despesa cadastrada está disponível.
- **Método/Rota**: `GET /despesas` com params `categoria`, `subcategoria`, `ano`, `mes`
- **Resultado esperado**: status `200` e valor igual ao cadastrado.

### 6. Excluir despesa

- **Objetivo**: zerar a célula da despesa cadastrada.
- **Método/Rota**: `DELETE /despesas` com mesmos parâmetros da busca.
- **Resultado esperado**: status `204` e valor `0` ao buscar novamente.

### 7. Cadastrar despesa inválida

- **Objetivo**: garantir validação de payload.
- **Método/Rota**: `POST /despesas`
- **Payload**: `valor=-10.0` e demais campos válidos.
- **Resultado esperado**: status `422`.

### 8. CRUD de meios de pagamento

- **Objetivo**: testar criação, busca e exclusão de meio de pagamento.
- **Sequência**:
  1. `POST /meios-pagamento` com `nome`: `Vale Alimentação`.
  2. `GET /meios-pagamento/Vale Alimentação`.
  3. `DELETE /meios-pagamento/Vale Alimentação`.
  4. `GET /meios-pagamento/Vale Alimentação` retorna `404`.
- **Resultado esperado**: `201`, `200`, `204`, `404`.

### 9. Atualizar renda mensal e resultado operacional

- **Objetivo**: verificar cálculo correto de resultado operacional.
- **Método/Rota**: `PUT /renda` com params `ano`, `mes` e payload `valor=1000.0`.
- **Resultado esperado**: `200` e campo `renda_mensal` igual a `1000.0`.
- **Validação adicional**: após cadastro de despesa de `300.0`, `GET /renda` deve retornar `total_despesas=300.0` e `resultado_operacional=700.0`.

### 10. Recarregar planilha do disco

- **Objetivo**: testar endpoint de sistema que limpa cache.
- **Método/Rota**: `POST /sistema/reload`
- **Resultado esperado**: status `200` e objeto `{"status": "ok"}`.

## Observações

- Todos os casos de teste devem ser executados com uma cópia temporária da planilha.
- O arquivo original `data/PLANILHA CONTROLE DE GASTOS.xlsx` não deve ser alterado.
- Casos adicionais recomendados:
  - tentativa de cadastrar meio de pagamento vazio.
  - tentativa de atualizar despesa em categoria/subcategoria inexistente.
  - tentativa de buscar despesa com parâmetros incompletos.
