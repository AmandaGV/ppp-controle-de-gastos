# Controle de Gastos Pessoais

Sistema de Controle de Gastos Pessoais criado como projeto de portfólio pessoal
da Mentoria 2.0 em Testes de Software. A aplicação lê, atualiza e exibe, em
tempo real, o arquivo `PLANILHA CONTROLE DE GASTOS.xlsx` — sem exigir que o
usuário abra o Excel.

## Arquitetura desacoplada (API + UI)

O sistema é dividido em dois processos independentes:

- **`/api`** — API REST em [FastAPI](https://fastapi.tiangolo.com/). É a
  **única** parte do sistema que acessa o arquivo `.xlsx` (leitura e
  escrita). Expõe rotas para CRUD de Despesas, CRUD de Meios de Pagamento e
  consulta do balanço mensal (Renda, Total de Despesas, Resultado
  Operacional). Documentação interativa automática em `/docs` (Swagger).
- **`/ui`** — Interface Streamlit. Não importa nenhum código da API nem
  acessa a planilha diretamente: toda leitura e escrita acontece via
  requisições HTTP (`requests`) para a API, através de `ui/api_client.py`.

```
app.py                          # Launcher da UI Streamlit (streamlit run app.py)
api/
  main.py                       # Ponto de entrada da API (uvicorn api.main:app)
  config.py                     # Caminhos e rótulos usados na localização dinâmica
  models/                       # Expense, ExpenseCell, PaymentMethod (dataclasses)
  repositories/                 # ExpenseRepository: único responsável por abrir/salvar o .xlsx
  services/                     # Regras de negócio (soma, concatenação, recálculo, layout, CRUDs)
  controllers/                  # Validação de entrada e orquestração entre rotas e services
  schemas/                      # Schemas Pydantic (validação de payload de entrada/saída)
  routers/                      # Rotas HTTP (despesas, meios-pagamento, renda, sistema)
  dependencies.py               # Composition root da API (monta repositório + services + controllers)
ui/
  main.py                       # Layout e navegação Streamlit
  api_client.py                 # Única camada da UI que fala HTTP com a API
  dependencies.py               # Composition root da UI (monta os clientes HTTP)
  views/                        # Telas Streamlit (despesas, meios de pagamento, renda, dashboard)
tests/                          # Testes unitários de services + testes de fumaça da API
data/
  PLANILHA CONTROLE DE GASTOS.xlsx
```

A lógica matemática e de localização de células vive inteiramente em
`api/services/`, sem qualquer acoplamento com Streamlit ou HTTP — por isso é
testável isoladamente (ver `tests/`).

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
já lançados, recalcula em Python e grava o resultado diretamente nas células
`Total das Despesas` e `Resultado Operacional` do mês afetado. Isso garante
que a interface sempre mostre números corretos, mesmo sem abrir o arquivo no
Excel para recalcular fórmulas.

O sistema **nunca fixa números de linha/coluna no código**. Um serviço de
layout (`api/services/layout_service.py`) varre a planilha em tempo de
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

Toda essa lógica vive na camada `api/services/` e é acionada pelas rotas via
`api/controllers/`. A validação de formato/obrigatoriedade do payload (tipos,
valores negativos, campos vazios) é feita pelos schemas Pydantic em
`api/schemas/`.

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
| GET | `/despesas/planilha` | Visão consolidada (todas as células) para a tela "Planilha Completa" |
| GET | `/despesas?categoria=&subcategoria=&ano=&mes=` | Busca o valor agregado de uma célula |
| POST | `/despesas` | Cadastra despesa (soma ao valor existente) |
| PUT | `/despesas?categoria=&subcategoria=&ano=&mes=` | Atualiza (substitui) o valor de uma célula |
| DELETE | `/despesas?categoria=&subcategoria=&ano=&mes=` | Exclui (zera) uma célula |
| GET | `/meios-pagamento` | Lista o catálogo de meios de pagamento |
| GET | `/meios-pagamento/{nome}` | Busca um meio de pagamento pelo nome |
| POST | `/meios-pagamento` | Cadastra um novo meio de pagamento |
| PUT | `/meios-pagamento/{nome_atual}` | Renomeia um meio de pagamento (propaga nas despesas já lançadas) |
| DELETE | `/meios-pagamento/{nome}` | Exclui um meio de pagamento do catálogo |
| GET | `/renda?ano=&mes=` | Renda Mensal, Total de Despesas e Resultado Operacional do mês |
| PUT | `/renda?ano=&mes=` | Atualiza a Renda Mensal do mês |
| POST | `/sistema/reload` | Descarta o cache de workbook/layout e recarrega a planilha do disco |

A documentação completa e interativa (Swagger) fica disponível em
`http://localhost:8000/docs` com a API em execução.

## Configuração do ambiente no VS Code

1. Instale o [Python 3.12+](https://www.python.org/downloads/) (marque a
   opção "Add to PATH" no instalador do Windows).
2. Abra a pasta do projeto no VS Code e, no terminal integrado, crie um
   ambiente virtual:

   ```bash
   python -m venv .venv
   ```

3. Ative o ambiente virtual:

   - Windows (PowerShell): `.venv\Scripts\Activate.ps1`
   - Windows (cmd): `.venv\Scripts\activate.bat`
   - Git Bash / Linux / macOS: `source .venv/Scripts/activate` (Windows) ou
     `source .venv/bin/activate` (Linux/macOS)

4. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

5. No VS Code, selecione o interpretador Python do `.venv` (Ctrl+Shift+P →
   "Python: Select Interpreter").

## Como executar (dois processos)

A API e a UI rodam em **processos separados**. Abra dois terminais
integrados no VS Code (ícone de `+`/"Split Terminal") e ative o `.venv` em
cada um.

**Terminal 1 — API (FastAPI/uvicorn):**

```bash
uvicorn api.main:app --reload --port 8000
```

A API sobe em `http://localhost:8000`, com Swagger em
`http://localhost:8000/docs`.

**Terminal 2 — Interface (Streamlit):**

```bash
streamlit run app.py
```

O navegador abrirá automaticamente em `http://localhost:8501`. Use o menu
lateral para navegar entre **Despesas**, **Meios de Pagamento**,
**Renda e Resultado** e **Planilha Completa**.

> Inicie sempre a API primeiro. Se a UI não conseguir se conectar, uma
> mensagem de erro é exibida na tela indicando que o servidor uvicorn
> precisa estar em execução.

### Variáveis de ambiente

- `PLANILHA_CONTROLE_GASTOS_PATH` (lida pela **API**): caminho alternativo
  para o arquivo `.xlsx`. Por padrão usa `data/PLANILHA CONTROLE DE
  GASTOS.xlsx`.
- `API_BASE_URL` (lida pela **UI**): endereço base da API. Por padrão
  `http://localhost:8000`.

## Como rodar os testes

```bash
pytest
```

Os testes copiam a planilha para um diretório temporário antes de cada
execução — o arquivo em `data/` nunca é alterado pelos testes. Isso inclui
tanto os testes de `api/services/` quanto os testes de fumaça da API
(`tests/test_api.py`, via `fastapi.testclient.TestClient`, sem precisar do
uvicorn em execução).
