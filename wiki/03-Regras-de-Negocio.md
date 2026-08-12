# Regras de Negócio

## Despesas

- **Cadastro de despesa**: o valor enviado em `POST /despesas` é somado ao valor já existente na célula correspondente ao mês e subcategoria.
- **Atualização de despesa**: `PUT /despesas` substitui o valor existente na célula por `novo_valor`.
- **Exclusão de despesa**: `DELETE /despesas` zera o valor e remove o meio de pagamento registrado para a célula.
- **Meios de pagamento**: o cadastro e alteração de meios de pagamento atualiza apenas o catálogo de `Meios de Pagamento` e, no caso de renomeação, propaga o novo nome para todas as células que já tinham o meio antigo.

## Renda e resultado operacional

- A planilha guarda três valores especiais por mês:
  - `Renda Mensal`
  - `Total das Despesas`
  - `Resultado Operacional`
- `Resultado Operacional` é recalculado como `Renda Mensal - Total das Despesas` sempre que a despesa ou a renda é atualizada.

## Regras de layout da planilha

- A API não usa coordenadas fixas de linha/coluna para localizar dados.
- O serviço de layout identifica:
  - as colunas de mês/ano a partir dos cabeçalhos da primeira linha;
  - as linhas de categoria/subcategoria na primeira e segunda colunas;
  - as linhas especiais por rótulo (`Total das Despesas`, `Renda Mensal`, `Resultado Operacional`).

## Tratamento de pagamentos

- O campo de meio de pagamento em uma célula pode conter múltiplas entradas concatenadas.
- Ao cadastrar uma despesa, o meio de pagamento novo é concatenado sem duplicar valores já existentes.
- Ao renomear um meio de pagamento, todas as células que o referenciam são atualizadas.

## Validação de entrada

- Os schemas Pydantic (`api/schemas`) garantem:
  - `valor` deve ser maior que zero no cadastro.
  - `novo_valor` deve ser maior ou igual a zero na atualização.
  - `meio_pagamento`, `categoria` e `subcategoria` não podem ser strings vazias.

## Observações importantes

- A edição por `PUT` representa substituição de valor, não um novo lançamento.
- A planilha serve como banco de dados e deve ser acessada apenas pela API para assegurar consistência.
