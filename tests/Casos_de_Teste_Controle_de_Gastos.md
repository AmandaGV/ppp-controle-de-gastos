# Casos de Teste

API de Controle de Gastos Pessoais

*Baseado no modelo de Caso de Teste da ISO/IEC/IEEE 29119-3*

Execução recomendada via Postman — coleção "Controle de Gastos - API"

## Introdução

Este documento reúne os casos de teste funcionais da API de Controle de Gastos Pessoais (backend Node/Express, endpoints sob /api). Cada caso segue o modelo de Caso de Teste baseado na ISO/IEC/IEEE 29119-3: ID, Título, Prioridade, Rastreabilidade, Pré-Condições, Passos (Ação / Resultado Esperado) e Pós-Condições. A execução dos passos é feita através da coleção Postman "Controle de Gastos - API" (ver Plano de Testes, Anexo A).

A coluna "Rastreabilidade" referencia os códigos RN (Regra de Negócio) e REQ (Requisito Funcional) definidos na Matriz de Rastreabilidade do Plano de Testes.

### CT01 — Listar as categorias de despesa cadastradas na planilha

| | | |
|---|---|---|
| **ID** | CT01 | |
| **Título** | Listar as categorias de despesa cadastradas na planilha | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ1 | |
| **Pré-Condições** | - A API está em execução e a planilha "PLANILHA CONTROLE DE GASTOS.xlsx" está acessível. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > GET /despesas/categorias" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 3 | Conferir o corpo da resposta | Corpo é um array de strings contendo as categorias da coluna A da planilha (ex.: "MORADIA", "ALIMENTAÇÃO", "TRANSPORTE", "LAZER", "EDUCAÇÃO") |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT02 — Listar as subcategorias de uma categoria existente

| | | |
|---|---|---|
| **ID** | CT02 | |
| **Título** | Listar as subcategorias de uma categoria existente | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ2 | |
| **Pré-Condições** | - A categoria "MORADIA" existe na planilha, com pelo menos uma subcategoria cadastrada na coluna B. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > GET /despesas/categorias/{{test_category}}/subcategorias (test_category = MORADIA)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 3 | Conferir o corpo da resposta | Corpo é um array de strings com as subcategorias associadas à categoria "MORADIA" |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT03 — Listar os meses disponíveis (colunas de cabeçalho) na planilha

| | | |
|---|---|---|
| **ID** | CT03 | |
| **Título** | Listar os meses disponíveis (colunas de cabeçalho) na planilha | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ3 | |
| **Pré-Condições** | - A planilha possui ao menos uma coluna de mês/ano no cabeçalho da primeira linha (formato MM/YYYY ou YYYY-MM). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > GET /despesas/meses" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 3 | Conferir o corpo da resposta | Corpo é um array de strings com os rótulos de mês encontrados no cabeçalho |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT04 — Cadastrar uma despesa somando o valor ao já existente na célula (categoria/subcategoria/mês válidos)

| | | |
|---|---|---|
| **ID** | CT04 | |
| **Título** | Cadastrar uma despesa somando o valor ao já existente na célula (categoria/subcategoria/mês válidos) | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | RN1 | |
| **Pré-Condições** | - A categoria "MORADIA" e a subcategoria "Aluguel" existem na planilha.<br>- A coluna do mês 08/2026 existe no cabeçalho.<br>- O valor atual da célula (categoria x mês) é conhecido antes do teste (ex.: 0,00). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > POST /despesas - cadastra despesa (soma valor)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Preencher o body com { category: "MORADIA", subcategory: "Aluguel", year: 2026, month: 8, value: 150.50, paymentMethod: "Pix" } e enviar | Requisição enviada com o body acima |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 201 |
| Passo 4 | Conferir o corpo da resposta | value = valor anterior da célula + 150.50; paymentMethod contém "Pix" |
| Passo 5 | Consultar GET /sistema/planilha e localizar a célula correspondente | O valor persistido na planilha confere com o value retornado pelo POST |
| **Pós-Condições** | - A célula de valor da linha "Aluguel" na coluna 08/2026 é incrementada em 150.50.<br>- A linha especial "Total das Despesas" e "Resultado Operacional" de 08/2026 são recalculadas. | |


### CT05 — Cadastrar despesa com meio de pagamento novo, concatenando sem duplicar valores já existentes na célula

| | | |
|---|---|---|
| **ID** | CT05 | |
| **Título** | Cadastrar despesa com meio de pagamento novo, concatenando sem duplicar valores já existentes na célula | |
| **Prioridade** | Média | |
| **Rastreabilidade** | RN6 | |
| **Pré-Condições** | - Existe uma despesa cadastrada em "MORADIA"/"Aluguel" no mês 08/2026 com o meio de pagamento "Pix" já registrado na célula. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > POST /despesas" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar POST /despesas com { category: "MORADIA", subcategory: "Aluguel", year: 2026, month: 8, value: 50, paymentMethod: "Cartão de Crédito" } | Requisição enviada |
| Passo 3 | Conferir o corpo da resposta | paymentMethod = "Pix, Cartão de Crédito" (concatenado, sem duplicar "Pix") |
| Passo 4 | Repetir o mesmo POST enviando novamente paymentMethod = "Pix" | paymentMethod continua "Pix, Cartão de Crédito", sem entrada duplicada de "Pix" |
| **Pós-Condições** | - A célula de meio de pagamento da linha "Aluguel" em 08/2026 contém a lista concatenada e sem duplicatas. | |


### CT06 — Tentar cadastrar despesa com categoria/subcategoria inexistente na planilha

| | | |
|---|---|---|
| **ID** | CT06 | |
| **Título** | Tentar cadastrar despesa com categoria/subcategoria inexistente na planilha | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ4 | |
| **Pré-Condições** | - A categoria "Categoria-Inexistente-QA" não existe na planilha. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > POST /despesas - categoria inexistente (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar POST /despesas com category = "Categoria-Inexistente-QA" e subcategory = "Sub-Inexistente-QA" | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 400 |
| Passo 4 | Conferir a mensagem de erro | message contém "Classe não encontrada para categoria='Categoria-Inexistente-QA', subcategoria='Sub-Inexistente-QA'." |
| **Pós-Condições** | - Nenhuma linha ou valor é criado na planilha. | |


### CT07 — Consultar uma despesa já cadastrada por categoria, subcategoria, mês e ano

| | | |
|---|---|---|
| **ID** | CT07 | |
| **Título** | Consultar uma despesa já cadastrada por categoria, subcategoria, mês e ano | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | REQ4 | |
| **Pré-Condições** | - Existe uma despesa cadastrada em "MORADIA"/"Aluguel" no mês 08/2026 (ver CT04). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > GET /despesas - consulta despesa cadastrada" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar GET /despesas?category=MORADIA&subcategory=Aluguel&year=2026&month=8 | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir o corpo da resposta | Corpo contém category, subcategory, year, month, value (numérico) e paymentMethod |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT08 — Atualizar uma despesa existente substituindo (e não somando) o valor da célula

| | | |
|---|---|---|
| **ID** | CT08 | |
| **Título** | Atualizar uma despesa existente substituindo (e não somando) o valor da célula | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | RN2 | |
| **Pré-Condições** | - Existe uma despesa cadastrada em "MORADIA"/"Aluguel" no mês 08/2026 com valor diferente de 999.99. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > PUT /despesas - atualiza (substitui valor)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar PUT /despesas com { category: "MORADIA", subcategory: "Aluguel", year: 2026, month: 8, value: 999.99 } | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir o corpo da resposta | value = 999.99 (valor substituído, não somado ao anterior) |
| **Pós-Condições** | - A célula de valor passa a conter exatamente 999.99.<br>- "Total das Despesas" e "Resultado Operacional" de 08/2026 são recalculados. | |


### CT09 — Excluir uma despesa: valor da célula é zerado e o meio de pagamento é removido

| | | |
|---|---|---|
| **ID** | CT09 | |
| **Título** | Excluir uma despesa: valor da célula é zerado e o meio de pagamento é removido | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | RN3 | |
| **Pré-Condições** | - Existe uma despesa cadastrada em "MORADIA"/"Aluguel" no mês 08/2026 com valor e meio de pagamento preenchidos. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > DELETE /despesas - remove (zera valor)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar DELETE /despesas?category=MORADIA&subcategory=Aluguel&year=2026&month=8 | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir a mensagem de resposta | message = "Despesa removida com sucesso." |
| Passo 5 | Executar GET /despesas com os mesmos parâmetros | value = 0 e paymentMethod = null; a linha continua existindo na planilha (a exclusão não remove a linha) |
| **Pós-Condições** | - A célula de valor da linha "Aluguel" em 08/2026 é zerada e a célula de meio de pagamento fica vazia.<br>- "Total das Despesas" e "Resultado Operacional" de 08/2026 são recalculados. | |


### CT10 — Tentar consultar despesa em um mês/ano cuja coluna não existe na planilha

| | | |
|---|---|---|
| **ID** | CT10 | |
| **Título** | Tentar consultar despesa em um mês/ano cuja coluna não existe na planilha | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ4 | |
| **Pré-Condições** | - Não existe coluna de cabeçalho para o mês 01/1999 na planilha. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Despesas > GET /despesas - mês/ano inexistente (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar GET /despesas?category=MORADIA&subcategory=Aluguel&year=1999&month=1 | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 400 |
| Passo 4 | Conferir a mensagem de erro | message contém "Não foi possível localizar as colunas de 1/1999." |
| **Pós-Condições** | - Nenhum dado da planilha é alterado. | |


### CT11 — Listar os meios de pagamento cadastrados no catálogo

| | | |
|---|---|---|
| **ID** | CT11 | |
| **Título** | Listar os meios de pagamento cadastrados no catálogo | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ9 | |
| **Pré-Condições** | - A aba "Meios de Pagamento" existe e possui ao menos um registro além do cabeçalho. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > GET /meios-pagamento" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 3 | Conferir o corpo da resposta | Corpo é um array de objetos no formato { name: string } |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT12 — Cadastrar um novo meio de pagamento no catálogo

| | | |
|---|---|---|
| **ID** | CT12 | |
| **Título** | Cadastrar um novo meio de pagamento no catálogo | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ9 | |
| **Pré-Condições** | - O meio de pagamento "Pix Teste QA" ainda não existe no catálogo. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > POST /meios-pagamento - cadastra novo (positivo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar POST /meios-pagamento com { name: "Pix Teste QA" } | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 201 |
| Passo 4 | Conferir o corpo da resposta | name = "Pix Teste QA" |
| Passo 5 | Executar GET /meios-pagamento | A lista retornada agora inclui "Pix Teste QA" |
| **Pós-Condições** | - Uma nova linha é adicionada à aba "Meios de Pagamento" com o nome informado. | |


### CT13 — Tentar cadastrar um meio de pagamento com nome já existente (comparação sem diferenciar maiúsculas/minúsculas)

| | | |
|---|---|---|
| **ID** | CT13 | |
| **Título** | Tentar cadastrar um meio de pagamento com nome já existente (comparação sem diferenciar maiúsculas/minúsculas) | |
| **Prioridade** | Média | |
| **Rastreabilidade** | RN7 | |
| **Pré-Condições** | - O meio de pagamento "Pix Teste QA" já está cadastrado no catálogo (ver CT12). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > POST /meios-pagamento - duplicado (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar POST /meios-pagamento com { name: "pix teste qa" } (variação de caixa) | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 400 |
| Passo 4 | Conferir a mensagem de erro | message = "Meio de pagamento já existe." |
| **Pós-Condições** | - Nenhum novo registro é criado no catálogo. | |


### CT14 — Tentar cadastrar um meio de pagamento sem informar o campo obrigatório "name"

| | | |
|---|---|---|
| **ID** | CT14 | |
| **Título** | Tentar cadastrar um meio de pagamento sem informar o campo obrigatório "name" | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ9 | |
| **Pré-Condições** | - Nenhuma (validação ocorre antes de qualquer acesso à planilha). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > POST /meios-pagamento - nome ausente (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar POST /meios-pagamento com body {} (sem o campo name) | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 400 |
| Passo 4 | Conferir a mensagem de erro | message = "Nome do meio de pagamento é obrigatório." |
| **Pós-Condições** | - Nenhum novo registro é criado no catálogo. | |


### CT15 — Renomear um meio de pagamento e validar a propagação do novo nome para todas as despesas que o referenciam

| | | |
|---|---|---|
| **ID** | CT15 | |
| **Título** | Renomear um meio de pagamento e validar a propagação do novo nome para todas as despesas que o referenciam | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | RN4 | |
| **Pré-Condições** | - O meio de pagamento "Pix Teste QA" existe no catálogo.<br>- Ao menos uma célula de despesa referencia "Pix Teste QA" no campo de meio de pagamento. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > PUT /meios-pagamento/{name} - renomeia (positivo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar PUT /meios-pagamento/Pix Teste QA com { newName: "Pix Teste QA Renomeado" } | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir o corpo da resposta | name = "Pix Teste QA Renomeado" |
| Passo 5 | Executar GET /sistema/planilha e localizar as células que antes continham "Pix Teste QA" | Todas as células foram atualizadas para "Pix Teste QA Renomeado", sem duplicidade |
| **Pós-Condições** | - O registro no catálogo "Meios de Pagamento" passa a exibir o novo nome.<br>- Toda célula de despesa que referenciava o nome antigo passa a referenciar o novo nome. | |


### CT16 — Tentar renomear um meio de pagamento que não existe no catálogo

| | | |
|---|---|---|
| **ID** | CT16 | |
| **Título** | Tentar renomear um meio de pagamento que não existe no catálogo | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ9 | |
| **Pré-Condições** | - O meio de pagamento "Meio-Inexistente-QA" não existe no catálogo nem em nenhuma célula de despesa. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > PUT /meios-pagamento/{name} - inexistente (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar PUT /meios-pagamento/Meio-Inexistente-QA com { newName: "Nao Importa" } | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 400 (nota: a documentação Swagger descreve 404 para este cenário; o código implementado retorna 400 — ver observação em Riscos e Achados no Plano de Testes) |
| Passo 4 | Conferir a mensagem de erro | message = "Meio de pagamento não encontrado." |
| **Pós-Condições** | - Nenhum dado do catálogo ou das despesas é alterado. | |


### CT17 — Excluir um meio de pagamento do catálogo

| | | |
|---|---|---|
| **ID** | CT17 | |
| **Título** | Excluir um meio de pagamento do catálogo | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ10 | |
| **Pré-Condições** | - O meio de pagamento "Pix Teste QA Renomeado" existe no catálogo (ver CT15). | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Meios de Pagamento > DELETE /meios-pagamento/{name} - exclui (positivo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar DELETE /meios-pagamento/Pix Teste QA Renomeado | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir a mensagem de resposta | message = "Meio de pagamento excluído com sucesso." |
| Passo 5 | Executar GET /meios-pagamento | "Pix Teste QA Renomeado" não aparece mais na lista |
| **Pós-Condições** | - O registro é removido da aba "Meios de Pagamento".<br>- Observação: eventuais células de despesa que ainda referenciem o nome excluído NÃO são limpas por esta operação (gap de negócio a ser confirmado — ver Riscos e Achados no Plano de Testes). | |


### CT18 — Tentar excluir um meio de pagamento que não existe no catálogo

| | | |
|---|---|---|
| **ID** | CT18 | |
| **Título** | Tentar excluir um meio de pagamento que não existe no catálogo | |
| **Prioridade** | Média | |
| **Rastreabilidade** | REQ10 | |
| **Pré-Condições** | - O meio de pagamento "Meio-Inexistente-QA" não existe no catálogo. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Abrir o Postman e selecionar o environment "Controle de Gastos - Local" | A variável {{base_url}} é carregada com http://localhost:3000/api |
| Passo 2 | Selecionar a requisição "Meios de Pagamento > DELETE /meios-pagamento/{name} - inexistente (negativo)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 3 | Enviar DELETE /meios-pagamento/Meio-Inexistente-QA | Requisição enviada |
| Passo 4 | Conferir o código de status HTTP da resposta | Código de status 400 |
| Passo 5 | Conferir a mensagem de erro | message = "Meio de pagamento não encontrado." |
| **Pós-Condições** | - Nenhum dado do catálogo é alterado. | |


### CT19 — Consultar a renda mensal, o total de despesas e o resultado operacional de um mês/ano

| | | |
|---|---|---|
| **ID** | CT19 | |
| **Título** | Consultar a renda mensal, o total de despesas e o resultado operacional de um mês/ano | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | REQ5 | |
| **Pré-Condições** | - A coluna do mês 08/2026 existe e as linhas especiais "Renda Mensal", "Total das Despesas" e "Resultado Operacional" existem na planilha. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Renda > GET /renda" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar GET /renda?year=2026&month=8 | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir o corpo da resposta | Corpo contém year, month, rendaMensal, totalDespesas e resultadoOperacional, todos numéricos |
| Passo 5 | Validar a fórmula do resultado | resultadoOperacional = rendaMensal - totalDespesas |
| **Pós-Condições** | - Nenhum dado da planilha é alterado (operação somente leitura). | |


### CT20 — Atualizar a renda mensal e validar o recálculo automático do resultado operacional

| | | |
|---|---|---|
| **ID** | CT20 | |
| **Título** | Atualizar a renda mensal e validar o recálculo automático do resultado operacional | |
| **Prioridade** | Alta | |
| **Rastreabilidade** | RN5 | |
| **Pré-Condições** | - A coluna do mês 08/2026 existe e o "Total das Despesas" desse mês é conhecido antes do teste. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Renda > PUT /renda - atualiza renda mensal (recalcula resultado)" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Enviar PUT /renda?year=2026&month=8 com { rendaMensal: 8000 } | Requisição enviada |
| Passo 3 | Conferir o código de status HTTP da resposta | Código de status 200 |
| Passo 4 | Conferir o corpo da resposta | rendaMensal = 8000 e resultadoOperacional = 8000 - totalDespesas |
| Passo 5 | Executar GET /renda com os mesmos parâmetros | Os valores persistidos conferem com os retornados pelo PUT |
| **Pós-Condições** | - A linha especial "Renda Mensal" e "Resultado Operacional" da coluna 08/2026 são atualizadas na planilha. | |


### CT21 — Acessar uma rota que não existe na API e validar o tratamento padrão de 404

| | | |
|---|---|---|
| **ID** | CT21 | |
| **Título** | Acessar uma rota que não existe na API e validar o tratamento padrão de 404 | |
| **Prioridade** | Baixa | |
| **Rastreabilidade** | REQ11 | |
| **Pré-Condições** | - Nenhuma. | |
| Passos | Ação | Resultados Esperados |
| Passo 1 | Selecionar a requisição "Rotas inexistentes > GET /rota-invalida - 404 catch-all" na coleção "Controle de Gastos - API" e clicar em "Send" | A requisição é enviada para a API |
| Passo 2 | Conferir o código de status HTTP da resposta | Código de status 404 |
| Passo 3 | Conferir a mensagem de erro | message = "Endpoint não encontrado." |
| **Pós-Condições** | - Nenhum dado da planilha é alterado. | |
