# Casos de Teste da API

> Os exemplos abaixo usam os nomes de campo reais expostos pela API Node.js
> (`backend/`) — em inglês (`category`, `subcategory`, `year`, `month`,
> `value`, `paymentMethod`, `rendaMensal`) — e os status codes que os
> controladores (`backend/src/controllers/`) realmente retornam. A API não
> usa `404`/`422`/`204`: praticamente todo erro de negócio é respondido como
> `400` com `{ "message": "..." }`, e as escritas bem-sucedidas retornam
> `200` (ou `201` para criação) com o objeto atualizado.

## Lista de casos de teste

### 1. Listar categorias

- **Objetivo**: verificar se o endpoint retorna as categorias existentes.
- **Método/Rota**: `GET /api/despesas/categorias`
- **Resultado esperado**: status `200` e array de strings com categorias (ex.: `"ALIMENTAÇÃO"`, `"MORADIA"`).

### 2. Listar subcategorias de categoria existente

- **Objetivo**: retornar subcategorias válidas para uma categoria existente.
- **Método/Rota**: `GET /api/despesas/categorias/{categoria}/subcategorias`
- **Parâmetros**: `categoria=ALIMENTAÇÃO`
- **Resultado esperado**: status `200` e array de strings (ex.: `"Supermercado"`, `"Feira / Sacolão"`, `"Padaria"`).

### 3. Buscar meses disponíveis

- **Objetivo**: listar os meses/anos presentes na planilha.
- **Método/Rota**: `GET /api/despesas/meses`
- **Resultado esperado**: status `200` e array de objetos `{ label, year, month, valueColumn, paymentColumn }`.

### 4. Cadastrar despesa válida

- **Objetivo**: somar um valor a uma célula de despesa existente.
- **Método/Rota**: `POST /api/despesas`
- **Payload**:
  ```json
  {
    "category": "ALIMENTAÇÃO",
    "subcategory": "Supermercado",
    "year": 2025,
    "month": 4,
    "value": 100.0,
    "paymentMethod": "Pix"
  }
  ```
- **Resultado esperado**: status `201` e objeto `{ year, month, category, subcategory, value, paymentMethod }` com o valor já somado ao existente.

### 5. Buscar despesa cadastrada

- **Objetivo**: verificar que a despesa cadastrada está disponível.
- **Método/Rota**: `GET /api/despesas` com query `category`, `subcategory`, `year`, `month`.
- **Resultado esperado**: status `200` e `value` igual ao total acumulado na célula.

### 6. Atualizar despesa (substituição de valor)

- **Objetivo**: confirmar que `PUT` substitui o valor em vez de somar.
- **Método/Rota**: `PUT /api/despesas` com query `category`, `subcategory`, `year`, `month` e payload `{ "value": 50.0, "paymentMethod": "Dinheiro" }`.
- **Resultado esperado**: status `200` e `value` igual a `50.0` (não somado ao valor anterior).

### 7. Excluir despesa

- **Objetivo**: zerar a célula da despesa cadastrada.
- **Método/Rota**: `DELETE /api/despesas` com os mesmos parâmetros de query da busca.
- **Resultado esperado**: status `200` e `{ "message": "Despesa removida com sucesso." }`; uma nova consulta (`GET`) deve retornar `value: 0` e `paymentMethod: null`.

### 8. Cadastrar despesa com categoria/subcategoria/mês inexistente

- **Objetivo**: garantir que a API responde com erro quando a célula não pode ser localizada na planilha.
- **Método/Rota**: `POST /api/despesas` com `category`/`subcategory` que não existem na planilha, ou `year`/`month` fora do range de colunas.
- **Resultado esperado**: status `400` e `{ "message": "Classe não encontrada..." }` ou `{ "message": "Não foi possível localizar as colunas..." }`.

> **Observação**: a API atual **não valida** `value` negativo — um `POST`/`PUT` com `value: -10` é aceito normalmente (o valor é apenas somado/gravado). Não existe um caso de teste de "payload inválido por valor negativo" porque esse cenário não é rejeitado pela implementação hoje.

### 9. CRUD de meios de pagamento

- **Objetivo**: testar criação, listagem, renomeação e exclusão de um meio de pagamento.
- **Sequência**:
  1. `POST /api/meios-pagamento` com `{ "name": "Vale Alimentação" }` → `201`.
  2. `GET /api/meios-pagamento` → `200`, lista contém `{ "name": "Vale Alimentação" }`.
  3. `PUT /api/meios-pagamento/Vale Alimentação` com `{ "newName": "VA" }` → `200`, `{ "name": "VA" }`.
  4. `DELETE /api/meios-pagamento/VA` → `200`, `{ "message": "Meio de pagamento excluído com sucesso." }`.
  5. `GET /api/meios-pagamento` → `200`, lista não contém mais `"VA"`.
- **Resultado esperado**: `201`, `200`, `200`, `200`, `200`. Não existe endpoint `GET /api/meios-pagamento/{nome}` para buscar um único item — por isso a verificação de existência é feita pela listagem completa.
- **Caso de erro**: repetir o passo 3/4 para um nome que não existe no catálogo retorna `400` com `{ "message": "Meio de pagamento não encontrado." }` (não `404`).

### 10. Atualizar renda mensal e resultado operacional

- **Objetivo**: verificar cálculo correto de resultado operacional.
- **Método/Rota**: `PUT /api/renda` com query `year`, `month` e payload `{ "rendaMensal": 1000.0 }`.
- **Resultado esperado**: status `200` e `rendaMensal` igual a `1000.0` na resposta.
- **Validação adicional**: após cadastro de despesa de `300.0` no mesmo mês, `GET /api/renda?year=&month=` deve retornar `totalDespesas: 300.0` e `resultadoOperacional: 700.0`.

### 11. Operações de sistema

- **Objetivo**: validar os endpoints administrativos.
- **Sequência**:
  1. `POST /api/sistema/init` → `200`, `{ "message": "Workbook inicializado com sucesso.", "path": "..." }`.
  2. `POST /api/sistema/reload` → `200`, `{ "message": "Workbook recarregado com sucesso." }`.
  3. `GET /api/sistema/planilha` → `200`, objeto com `sheetName`, `rowCount`, `columnCount`, `months`, `paymentMethods`, `rows`.

## Observações

- Todos os casos de teste devem ser executados com uma cópia temporária da planilha (apontada via `PLANILHA_CONTROLE_GASTOS_PATH`).
- O arquivo original `data/PLANILHA CONTROLE DE GASTOS.xlsx` não deve ser alterado.
- Casos adicionais recomendados, ainda não cobertos por automação:
  - tentativa de cadastrar meio de pagamento com `name` vazio ou duplicado (`400`);
  - tentativa de renomear/excluir um meio de pagamento inexistente (`400`);
  - tentativa de buscar/atualizar/excluir despesa com query params ausentes (o comportamento depende de `Number(undefined)` gerar `NaN` e a busca de coluna/linha falhar com `400`).
