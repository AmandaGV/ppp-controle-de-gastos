# Testes da API

## Estratégia de testes

A API Node.js é validada por um script de smoke test manual,
`backend/check_endpoints.js`. Ele não é automatizado (não roda em CI nem
como parte de `npm test`) e precisa da API já em execução em
`http://localhost:3000`.

Não existe suíte de testes automatizados (unitários ou de integração) para
o backend Node.js hoje — a antiga suíte `pytest` (`tests/`) foi removida
junto com a antiga API em Python (`api/`).

## Como validar manualmente

```bash
# terminal 1
cd backend
npm install
npm start

# terminal 2
cd backend
node check_endpoints.js
```

## Isolamento da planilha

- A planilha `data/PLANILHA CONTROLE DE GASTOS.xlsx` é o arquivo real usado pela API em execução — o script de smoke test lê e também dispara `POST /api/sistema/init` e `POST /api/sistema/reload`, que recarregam esse arquivo.
- Como ainda não há testes automatizados isolados, qualquer verificação mais invasiva (cadastro/atualização/exclusão de despesa) deve ser feita manualmente contra uma cópia do arquivo, redirecionada via a variável de ambiente `PLANILHA_CONTROLE_GASTOS_PATH`.

## Cobertura atual

`backend/check_endpoints.js` verifica apenas que os seguintes endpoints respondem sem erro:

- `POST /api/sistema/init`
- `POST /api/sistema/reload`
- `GET /api/sistema/planilha`
- `GET /api/despesas/meses`
- `GET /api/despesas/categorias`
- `GET /api/meios-pagamento`

Ele não cobre `POST`/`PUT`/`DELETE /api/despesas`, o CRUD completo de
`/api/meios-pagamento` (criar, renomear, excluir) nem `/api/renda` — esses
fluxos ainda dependem de teste manual (ver
[06. Plano de Testes da API](06-Plano-de-Testes-da-API.md) e
[07. Casos de Teste da API](07-Casos-de-Teste-da-API.md)).

## Observações

- A implementação ativa do repositório é a API em `backend/`. A antiga API em Python (FastAPI) e sua suíte `pytest` foram removidas.
- A UI em Python/Streamlit (`app.py` + `ui/`) **não** foi removida — ela continua no repositório como interface alternativa, consumindo a API Node.js via HTTP.
