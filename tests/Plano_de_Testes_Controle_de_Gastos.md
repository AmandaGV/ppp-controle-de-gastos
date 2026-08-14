# Plano de Testes da API

## 1. Introdução

Este Plano de Testes descreve a estratégia, o escopo e os recursos utilizados para validar funcionalmente a API REST de Controle de Gastos Pessoais (projeto "ppp-controle-de-gastos"). A API é implementada em Node.js/Express (backend/src), expõe seus endpoints sob o prefixo /api e utiliza como base de dados uma planilha Excel ("data/PLANILHA CONTROLE DE GASTOS.xlsx"), acessada exclusivamente através da camada de repositório da própria API.
O documento "Casos de Teste - Controle de Gastos.docx" complementa este plano, detalhando cada cenário no formato ID / Título / Prioridade / Rastreabilidade / Pré-Condições / Passos / Pós-Condições, com execução via Postman.


## 2. Objetivo

- Validar que cada endpoint da API responde com o código de status e o corpo esperados para cenários positivos e negativos.

- Validar as regras de negócio com efeito colateral sobre a planilha (soma x substituição de valor, zerar despesa, concatenação e propagação de meios de pagamento, recálculo de resultado operacional).

- Confirmar o comportamento da API diante de dados inválidos ou inexistentes (categoria, subcategoria, mês/ano, meio de pagamento).

- Registrar divergências entre a documentação (Swagger/wiki) e o comportamento real implementado.


## 3. Escopo
### 3.1 Dentro do escopo
- endpoints de despesas (`/api/despesas`)
- endpoints de meios de pagamento (`/api/meios-pagamento`)
- endpoints de renda (`/api/renda`)
- endpoints de sistema (`/api/sistema`)
- interação com a planilha Excel

### 3.2 Fora do escopo
- Interface Streamlit (ui/) e o arquivo frontend/index.html — são consumidores da API, não fazem parte deste plano.
- Testes de carga, performance e segurança aprofundada (a API não implementa autenticação/autorização; ver seção 10).
- Testes automatizados de unidade dos serviços internos (expenseService, layoutService etc.) — cobertos por testes de nível de código, não por esta suíte de API.


## 4. Itens de Teste (Endpoints)


|            |                                                |                                                                           |
|------------|------------------------------------------------|---------------------------------------------------------------------------|
| **Método** | **Endpoint**                                   | **Descrição**                                                             |
| GET        | /despesas                                      | Consulta uma despesa por category, subcategory, year, month               |
| POST       | /despesas                                      | Cadastra despesa; soma o value ao valor já existente na célula            |
| PUT        | /despesas                                      | Atualiza despesa; substitui o valor existente na célula                   |
| DELETE     | /despesas                                      | Remove despesa; zera o valor e limpa o meio de pagamento                  |
| GET        | /despesas/categorias                           | Lista as categorias cadastradas                                           |
| GET        | /despesas/categorias/{categoria}/subcategorias | Lista as subcategorias de uma categoria                                   |
| GET        | /despesas/meses                                | Lista os meses (colunas) disponíveis na planilha                          |
| GET        | /meios-pagamento                               | Lista os meios de pagamento cadastrados                                   |
| POST       | /meios-pagamento                               | Cadastra um novo meio de pagamento (nome único, case-insensitive)         |
| PUT        | /meios-pagamento/{name}                        | Renomeia um meio de pagamento e propaga para as despesas                  |
| DELETE     | /meios-pagamento/{name}                        | Remove um meio de pagamento do catálogo                                   |
| GET        | /renda                                         | Consulta renda mensal, total de despesas e resultado operacional          |
| PUT        | /renda                                         | Atualiza a renda mensal e recalcula o resultado operacional               |
| POST       | /sistema/reload                                | Recarrega o workbook em memória a partir do disco                         |
| POST       | /sistema/init                                  | Inicializa/recria a planilha                                              |
| GET        | /sistema/planilha                              | Retorna visão consolidada da planilha (meses, meios de pagamento, linhas) |


## 5. Estratégia de Testes

Os testes são funcionais, de caixa-preta, executados diretamente contra a API HTTP (sem mocks), combinando:

- Testes de contrato: código de status HTTP e formato do corpo da resposta para cada endpoint.

- Testes de regra de negócio: efeitos colaterais sobre a planilha (soma, substituição, zeragem, concatenação, propagação, recálculo), validados consultando GET /sistema/planilha ou os próprios GETs após a operação.

- Testes negativos: dados inexistentes ou inválidos (categoria/subcategoria/mês/ano/meio de pagamento inexistentes, campos obrigatórios ausentes, duplicidade).

- Teste de rota inexistente: validação do catch-all 404 do Express.

Prioridades dos casos: Alta (fluxos principais com efeito colateral sobre a planilha e cálculos), Média (validações de negócio e cenários negativos), Baixa (listagens somente leitura e validações simples de campo obrigatório).

## 6. Ferramentas e Ambiente de Teste

### 6.1 Ferramenta principal: Postman

A execução dos casos de teste é feita através da coleção Postman "Controle de Gastos - API", organizada em pastas por recurso (Sistema, Despesas, Meios de Pagamento, Renda, Rotas inexistentes). Cada requisição da coleção possui scripts de teste (pm.test) que validam automaticamente o código de status e os campos-chave do corpo da resposta.

- Execução manual: Postman Desktop/Web.

- Execução via linha de comando (opcional, para futura integração com pipeline de CI): Newman — comando "newman run controle-gastos-api.postman_collection.json -e controle-gastos-api.postman_environment.json".

### 6.2 Ambiente sob teste

- Backend: Node.js >= 18, Express, executado localmente a partir de backend/ (npm start ou equivalente), porta padrão 3000.

- Base de dados: arquivo Excel data/PLANILHA CONTROLE DE GASTOS.xlsx (ou caminho definido pela variável de ambiente PLANILHA_CONTROLE_GASTOS_PATH).

- Sem autenticação: nenhum endpoint exige token, chave de API ou sessão.

Recomenda-se executar os testes contra uma cópia da planilha (ambiente de teste isolado), já que as operações de escrita alteram o arquivo em disco permanentemente e não há mecanismo de rollback automático — a restauração de estado entre execuções deve ser feita restaurando o arquivo original ou chamando POST /sistema/reload após substituir o arquivo manualmente.

## 7. Critérios de Entrada e Saída

### 7.1 Critérios de entrada

- Backend em execução e respondendo em {{base_url}}.

- Planilha de teste disponível, com ao menos as categorias/subcategorias e a coluna do mês usados nos casos de teste (ex.: MORADIA / Aluguel, mês 08/2026).

- Coleção do Postman importada.

### 7.2 Critérios de saída

- 100% dos casos de teste executados.

- Todos os casos de prioridade Alta aprovados (sem divergência entre resultado esperado e obtido).

- Divergências encontradas registradas com evidência (request/response) e classificadas por severidade.

## 8. Matriz de Rastreabilidade

Códigos de regra de negócio (RN) e requisito funcional (REQ) referenciados no campo "Rastreabilidade" dos Casos de Teste.

|            |                                                                                                                                                    |                        |
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| **Código** | **Descrição**                                                                                                                                      | **Casos de Teste**     |
| RN1        | Cadastro de despesa (POST /despesas): o value informado é somado ao valor já existente na célula.                                                  | CT04                   |
| RN2        | Atualização de despesa (PUT /despesas): o value informado substitui o valor existente na célula.                                                   | CT08                   |
| RN3        | Exclusão de despesa (DELETE /despesas): zera o valor da célula e limpa o meio de pagamento; a linha não é removida.                                | CT09                   |
| RN4        | Renomeação de meio de pagamento (PUT /meios-pagamento/{name}): propaga o novo nome para todas as células de despesa que referenciam o nome antigo. | CT15                   |
| RN5        | Resultado Operacional = Renda Mensal − Total das Despesas; recalculado a cada alteração de despesa ou de renda.                                    | CT20                   |
| RN6        | Concatenação de meios de pagamento (POST /despesas): novo meio é concatenado (separado por vírgula) sem duplicar valores já existentes na célula.  | CT05                   |
| RN7        | Unicidade de meio de pagamento (POST /meios-pagamento): comparação case-insensitive contra os nomes já cadastrados.                                | CT13                   |
| REQ1       | Listagem de categorias cadastradas (GET /despesas/categorias).                                                                                     | CT01                   |
| REQ2       | Listagem de subcategorias de uma categoria (GET /despesas/categorias/{categoria}/subcategorias).                                                   | CT02                   |
| REQ3       | Listagem dos meses disponíveis no cabeçalho da planilha (GET /despesas/meses).                                                                     | CT03                   |
| REQ4       | Consulta/cadastro de despesa por categoria, subcategoria, mês e ano, incluindo cenários de dado inexistente (GET/POST /despesas).                  | CT06, CT07, CT10       |
| REQ5       | Consulta de renda mensal, total de despesas e resultado operacional (GET /renda).                                                                  | CT19                   |
| REQ9       | Listagem e cadastro de meios de pagamento no catálogo (GET/POST /meios-pagamento).                                                                 | CT11, CT12, CT14, CT16 |
| REQ10      | Exclusão de meio de pagamento do catálogo (DELETE /meios-pagamento/{name}).                                                                        | CT17, CT18             |
| REQ11      | Tratamento padrão de rota inexistente (404 catch-all).                                                                                             | CT21                   |

## 9. Riscos e Achados do Levantamento Técnico

Os pontos abaixo foram identificados durante a preparação deste plano e devem ser tratados como cenários de teste de atenção, não como bugs confirmados:

- Ausência de autenticação: nenhum endpoint da API exige token, chave de API ou sessão. Qualquer cliente na rede pode ler e escrever na planilha. Fora do escopo funcional deste plano, mas deve ser sinalizado como risco de segurança ao time.

- Validações documentadas: a wiki do projeto (03-Regras-de-Negocio.md) descreve validações como "valor deve ser maior que zero no cadastro" e "categoria/subcategoria não podem ser vazias".

- POST /sistema/init não recria de fato: a implementação atual apenas chama a mesma rotina de POST /sistema/reload, não uma reinicialização/reset real da planilha, apesar do texto de resposta sugerir criação.