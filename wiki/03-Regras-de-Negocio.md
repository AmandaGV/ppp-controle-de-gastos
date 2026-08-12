# Regras de Negócio

## Despesas

- **Cadastro de despesa**: o `value` enviado em `POST /api/despesas` é somado ao valor já existente na célula correspondente ao mês e subcategoria.
- **Atualização de despesa**: `PUT /api/despesas` substitui o valor existente na célula pelo `value` enviado no payload.
- **Exclusão de despesa**: `DELETE /api/despesas` zera o valor e remove o meio de pagamento registrado para a célula.
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

- A API não usa uma camada de schema/validação (como Pydantic na antiga API Python). A validação é implícita e ocorre nos serviços:
  - `category`/`subcategory`/`year`/`month` precisam corresponder a uma linha e a um mês existentes na planilha; caso contrário o serviço lança um erro (`Classe não encontrada...`, `Não foi possível localizar as colunas...`).
  - Ao cadastrar um meio de pagamento, `name` vazio ou já existente no catálogo gera erro.
  - Ao renomear/excluir um meio de pagamento, `name` inexistente no catálogo gera erro.
  - Não há validação explícita de `value` negativo nem de campos de despesa vazios — o valor é convertido com `Number(value)` e gravado como está.
- Todo erro lançado nos serviços de despesas, renda e meios de pagamento é capturado pelos controladores e respondido como `400 Bad Request` com `{ "message": "..." }`. Os endpoints de sistema (`/api/sistema/*`) respondem erros como `500 Internal Server Error`.

## Observações importantes

- A edição por `PUT` representa substituição de valor, não um novo lançamento.
- A planilha serve como banco de dados e deve ser acessada apenas pela API para assegurar consistência.
