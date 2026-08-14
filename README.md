# Controle de Gastos Pessoais

Sistema de Controle de Gastos Pessoais criado como projeto de portfólio pessoal.
A aplicação utiliza uma API REST em Node.js para ler, atualizar e exibir o arquivo
`PLANILHA CONTROLE DE GASTOS.xlsx`, sem exigir que o usuário abra o Excel.

## Arquitetura desacoplada (Backend + Frontends)

O sistema foi organizado em uma API central e duas interfaces independentes
que a consomem via HTTP:

- **`backend/`** — API REST em Node.js com `Express`. É a única parte do sistema
  que acessa o arquivo `.xlsx` e persiste as alterações no disco.
- **`frontend/`** — Interface simples em HTML/Vanilla JS. Não acessa a planilha
  diretamente; todas as operações são feitas via chamadas REST para a API.
- **`app.py` + `ui/`** — Interface alternativa em Python/Streamlit. Também não
  acessa a planilha diretamente; consome a mesma API Node.js via HTTP
  (`ui/api_client.py`).

```
backend/
  package.json                  # Dependências e scripts do backend Node.js
  src/
    app.js                      # Ponto de entrada da API Express
    dependencies.js             # Composição do repositório e serviços
    repositories/
      excelRepository.js        # Única camada que abre, lê e salva o .xlsx
    services/
      layoutService.js          # Localiza dinamicamente colunas e linhas na planilha
      expenseService.js         # Regras de despesa, soma inteligente e concatenação
      paymentMethodService.js   # CRUD de meios de pagamento no Excel
      balanceService.js         # Lógica de balanço e atualização de totais
    controllers/
      expenseController.js      # Validação de requisições e formatação de respostas
      paymentMethodController.js
      balanceController.js
      systemController.js
    routes/
      expenses.js
      paymentMethods.js
      balance.js
      system.js
frontend/
  index.html                    # Interface estática que consome a API via fetch
app.py                          # Launcher da interface Streamlit (streamlit run app.py)
ui/
  api_client.py                 # Única camada da UI Streamlit que fala HTTP com a API
  main.py                       # Layout e navegação da UI Streamlit
  views/                        # Telas (dashboard, despesas, renda, meios de pagamento)
data/
  PLANILHA CONTROLE DE GASTOS.xlsx
tests/
  support/fixture.js            # Monta a planilha de fixture e o app de teste
  *.test.js                     # Suíte Mocha + Chai + Supertest (npm test)
```

A lógica matemática e de localização de células vive inteiramente em
`backend/src/services/`, sem qualquer acoplamento com Streamlit ou HTTP — por isso é
testável isoladamente por meio do backend em Node.js.

## Como o sistema interage com a planilha

O arquivo `data/PLANILHA CONTROLE DE GASTOS.xlsx` é a única fonte de verdade
do sistema (não há banco de dados), e só a API o acessa. Ele contém duas
abas:

- **Pessoa Física**: a planilha original, no formato de matriz — cada linha é
  uma categoria/subcategoria de despesa e cada mês ocupa duas colunas (Valor e
  Meio de Pagamento). Também guarda as linhas "Total das Despesas", "Renda
  Mensal" e "Resultado Operacional".
- **Meios de Pagamento**: aba criada automaticamente pelo sistema no primeiro
  uso, com o catálogo de meios de pagamento disponíveis nos formulários (a
  planilha original não tinha essa lista — apenas texto livre já lançado).

A cada operação, o sistema **não usa fórmulas do Excel**: ele lê os valores
já lançados, recalcula no backend e grava o resultado diretamente nas células
`Total das Despesas` e `Resultado Operacional` do mês afetado. Isso garante
que a interface sempre mostre números corretos, mesmo sem abrir o arquivo no
Excel para recalcular fórmulas.

O sistema **nunca fixa números de linha/coluna no código**. Um serviço de
layout (`backend/src/services/layoutService.js`) varre a planilha em tempo de
execução e localiza dinamicamente:

- a coluna de cada mês/ano (a partir da linha de cabeçalho `MESES`);
- a linha de cada categoria e subcategoria (a partir da coluna de rótulos);
- as linhas especiais `Total das Despesas`, `Renda Mensal` e
  `Resultado Operacional`.

Isso torna o sistema resiliente a pequenos ajustes na planilha (linhas ou
colunas adicionadas), desde que os rótulos de texto sejam mantidos.

### Regras de negócio implementadas

- **Cadastro de despesa**: soma o valor informado ao que já existir na célula
  (mês x subcategoria) e concatena o meio de pagamento (ex.: `"Cartão, Pix"`),
  sem duplicar um meio já presente.
- **Atualização de despesa**: como a planilha guarda apenas o valor agregado
  por mês/subcategoria (não há um "lançamento" individual gravado), atualizar
  **substitui** o valor da célula pelo valor informado.
- **Exclusão de despesa**: zera o valor e limpa o(s) meio(s) de pagamento da
  célula correspondente.
- **Toda alteração** recalcula imediatamente `Total das Despesas` e
  `Resultado Operacional (Renda - Despesas)` do mês afetado, e a interface
  reexibe a planilha atualizada logo em seguida (buscando os dados na API).
- **Meios de Pagamento**: cadastrar, buscar, atualizar (renomear) e excluir
  um meio de pagamento no catálogo. Renomear propaga a alteração para as
  células já lançadas na planilha de despesas (preservando os demais meios
  concatenados na mesma célula).

Toda essa lógica vive na camada `backend/src/services/` e é acionada pelas rotas via
`backend/src/controllers/`. A validação de formato/obrigatoriedade do payload
é feita diretamente nos controladores do backend e pelas regras de negócio do
arquivo Excel.

> **Observação sobre a planilha original**: na aba "Pessoa Física", a
> categoria "SERVIÇOS FINANCEIROS" tem duas linhas com o rótulo
> `Investimentos 1` (em vez da segunda ser um rótulo distinto). O sistema
> lida com isso somando os valores de **todas** as linhas de subcategoria ao
> calcular o Total das Despesas, mas o formulário só permite lançar despesas
> na última ocorrência de um rótulo duplicado (a primeira fica acessível
> apenas por edição direta do Excel).

## Endpoints da API

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/despesas/categorias` | Lista categorias disponíveis |
| GET | `/despesas/categorias/{categoria}/subcategorias` | Lista subcategorias de uma categoria |
| GET | `/despesas/meses` | Lista meses/anos disponíveis na planilha |
| POST | `/sistema/init` | Inicializa ou recria a planilha de controle no disco |
| GET | `/sistema/planilha` | Visão consolidada (todas as células) para a tela "Planilha Completa" |
| GET | `/despesas?category=&subcategory=&year=&month=` | Busca o valor agregado de uma célula |
| POST | `/despesas` | Cadastra despesa (soma ao valor existente). Payload: `category`, `subcategory`, `year`, `month`, `value`, `paymentMethod` |
| PUT | `/despesas?category=&subcategory=&year=&month=` | Atualiza (substitui) o valor de uma célula. Payload: `value`, `paymentMethod` |
| DELETE | `/despesas?category=&subcategory=&year=&month=` | Exclui (zera) uma célula |
| GET | `/meios-pagamento` | Lista o catálogo de meios de pagamento |
| POST | `/meios-pagamento` | Cadastra um novo meio de pagamento. Payload: `name` |
| PUT | `/meios-pagamento/{name}` | Renomeia um meio de pagamento (propaga nas despesas já lançadas). Payload: `newName` |
| DELETE | `/meios-pagamento/{name}` | Exclui um meio de pagamento do catálogo |
| GET | `/renda?year=&month=` | Renda Mensal, Total de Despesas e Resultado Operacional do mês |
| PUT | `/renda?year=&month=` | Atualiza a Renda Mensal do mês. Payload: `rendaMensal` |
| POST | `/sistema/reload` | Descarta o cache de workbook/layout e recarrega a planilha do disco |

Não há um endpoint para buscar um único meio de pagamento pelo nome — apenas
listagem completa (`GET /meios-pagamento`), criação, renomeação e exclusão.

A documentação completa e interativa (Swagger) fica disponível em
`http://localhost:3000/api/docs` com a API em execução.

## Requisitos e execução

Pré-requisitos:

- Node.js 18+ instalado

Instalação e execução do backend:

```bash
cd backend
npm install
npm start
```

A API será iniciada em `http://localhost:3000/api` e o Swagger em
`http://localhost:3000/api/docs`.

Executando a interface (frontend estático):

Abra `frontend/index.html` no navegador ou sirva a pasta com um servidor
estático (ex.: `npx serve frontend`). A interface consome a API em
`http://localhost:3000/api` por padrão.

Executando a interface alternativa (Streamlit):

O projeto também inclui uma UI em Python/Streamlit (`app.py` e `ui/`), que
é apenas mais um consumidor HTTP da mesma API — não acessa a planilha
diretamente. Com o backend Node.js já em execução:

```bash
pip install -r requirements.txt
streamlit run app.py
```

### Variáveis de ambiente

- `PLANILHA_CONTROLE_GASTOS_PATH` (lida pela **API**): caminho alternativo
  para o arquivo `.xlsx`. Por padrão usa `data/PLANILHA CONTROLE DE
  GASTOS.xlsx`.
- `API_BASE_URL` (lida pela **UI**): endereço base da API. Por padrão
  `http://localhost:3000/api`.

## Como rodar os testes

Testes automatizados (Mocha + Chai + Supertest) ficam em `tests/`, na raiz
do repositório — separados do `backend/`, que tem seu próprio
`package.json`:

```bash
npm install
npm test
```

Cada teste sobe a API em memória e grava numa planilha de fixture isolada
(criada em uma pasta temporária), nunca em `data/PLANILHA CONTROLE DE
GASTOS.xlsx`. Ver [wiki/04. Testes da API](wiki/04-Testes-da-API.md) para o
que já está coberto e o que ainda depende de teste manual via Postman.

## Como rodar a API

```bash
cd backend
npm install
npm start
```

A API estará disponível em `http://localhost:3000/api` e a documentação do
Swagger em `http://localhost:3000/api/docs`.
