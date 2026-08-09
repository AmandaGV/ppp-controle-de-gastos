# Controle de Gastos Pessoais

Sistema de Controle de Gastos Pessoais criado como projeto de portfólio pessoal
da Mentoria 2.0 em Testes de Software. A aplicação lê, atualiza e exibe, em
tempo real, o arquivo `PLANILHA CONTROLE DE GASTOS.xlsx` — sem exigir que o
usuário abra o Excel.

## Como o sistema interage com a planilha

O arquivo `data/PLANILHA CONTROLE DE GASTOS.xlsx` é a única fonte de verdade
do sistema (não há banco de dados). Ele contém duas abas:

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
layout (`src/services/layout_service.py`) varre a planilha em tempo de
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
  reexibe a planilha atualizada logo em seguida.
- **Meios de Pagamento**: cadastrar, buscar, atualizar (renomear) e excluir
  um meio de pagamento no catálogo. Renomear propaga a alteração para as
  células já lançadas na planilha de despesas (preservando os demais meios
  concatenados na mesma célula).

> **Observação sobre a planilha original**: na aba "Pessoa Física", a
> categoria "SERVIÇOS FINANCEIROS" tem duas linhas com o rótulo
> `Investimentos 1` (em vez da segunda ser um rótulo distinto). O sistema
> lida com isso somando os valores de **todas** as linhas de subcategoria ao
> calcular o Total das Despesas, mas o formulário só permite lançar despesas
> na última ocorrência de um rótulo duplicado (a primeira fica acessível
> apenas por edição direta do Excel).

## Arquitetura

```
app.py                          # Ponto de entrada Streamlit
src/
  config.py                     # Caminhos e rótulos usados na localização dinâmica
  models/                       # Expense, ExpenseCell, PaymentMethod (dataclasses)
  repositories/                 # ExpenseRepository: único responsável por abrir/salvar o .xlsx
  services/                     # Regras de negócio (soma, concatenação, recálculo, layout, CRUDs)
  controllers/                  # Validação de entrada e orquestração entre UI e services
  ui/
    dependencies.py             # Composition root (monta repositório + services + controllers)
    views/                      # Telas Streamlit (despesas, meios de pagamento, renda, dashboard)
tests/                          # Testes unitários de services (desacoplados da UI)
data/
  PLANILHA CONTROLE DE GASTOS.xlsx
```

A lógica matemática e de localização de células vive inteiramente em
`services/`, sem qualquer acoplamento com Streamlit — por isso é testável
isoladamente (ver `tests/`).

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

## Como executar

```bash
streamlit run app.py
```

O navegador abrirá automaticamente em `http://localhost:8501`. Use o menu
lateral para navegar entre **Despesas**, **Meios de Pagamento**,
**Renda e Resultado** e **Planilha Completa**.

Por padrão a aplicação lê/grava
`data/PLANILHA CONTROLE DE GASTOS.xlsx`. Para apontar para outro arquivo,
defina a variável de ambiente `PLANILHA_CONTROLE_GASTOS_PATH` antes de
executar.

## Como rodar os testes

```bash
pytest
```

Os testes copiam a planilha para um diretório temporário antes de cada
execução — o arquivo em `data/` nunca é alterado pelos testes.
