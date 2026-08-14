# Testes da API

## Estratégia de testes

A API Node.js é validada em duas camadas:

1. **Suíte automatizada** (`tests/*.test.js`, na raiz do repositório) —
   Mocha + Chai + Supertest, executada com `npm test` a partir da raiz. Sobe
   o app Express em memória (via `require`, sem precisar de `npm start`) e
   grava numa planilha de fixture isolada, nunca na planilha real.
2. **Smoke test manual** (`backend/check_endpoints.js`) — não é automatizado
   (não roda em CI nem como parte de `npm test`) e precisa da API já em
   execução em `http://localhost:3000`.

## Como rodar a suíte automatizada

```bash
npm install
npm test
```

Cada arquivo em `tests/*.test.js` cobre um recorte temático dos casos
documentados em [07. Casos de Teste da API](07-Casos-de-Teste-da-API.md):

| Arquivo | Casos cobertos |
| --- | --- |
| `tests/despesas-categorias.test.js` | CT01, CT02 — listagem de categorias e subcategorias |
| `tests/despesas-negativos.test.js` | CT06, CT10 — categoria/subcategoria e mês/ano inexistentes |
| `tests/despesas-cadastro.test.js` | CT04, CT05 — soma de valor e concatenação de meio de pagamento sem duplicar |
| `tests/meios-pagamento-crud.test.js` | CT12, CT15, CT17 — cadastro, renomeação com propagação e exclusão de meio de pagamento |

`tests/support/fixture.js` monta a planilha de fixture (categorias,
subcategorias, meses, meios de pagamento e linhas especiais) e devolve uma
instância do app Express já apontada para ela via
`PLANILHA_CONTROLE_GASTOS_PATH`. Cada arquivo de teste recebe sua própria
planilha temporária, isolada dos demais.

**Cobertura ainda não automatizada**: CT03, CT07–CT09, CT11, CT13, CT14,
CT16, CT18–CT21 continuam dependendo do teste manual via Postman (ver
[06. Plano de Testes da API](06-Plano-de-Testes-da-API.md) e
[07. Casos de Teste da API](07-Casos-de-Teste-da-API.md)).


## Como validar manualmente (smoke test)

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
- A suíte automatizada nunca toca esse arquivo: cada teste usa uma cópia de fixture criada em `os.tmpdir()`, redirecionada via `PLANILHA_CONTROLE_GASTOS_PATH`.
- Qualquer verificação manual mais invasiva (cadastro/atualização/exclusão de despesa) que não esteja coberta pela suíte automatizada deve ser feita contra uma cópia do arquivo, redirecionada da mesma forma.

## Cobertura do smoke test

`backend/check_endpoints.js` verifica apenas que os seguintes endpoints respondem sem erro:

- `POST /api/sistema/init`
- `POST /api/sistema/reload`
- `GET /api/sistema/planilha`
- `GET /api/despesas/meses`
- `GET /api/despesas/categorias`
- `GET /api/meios-pagamento`

## Observações

- A UI em Python/Streamlit (`app.py` + `ui/`) **não** foi removida — ela continua no repositório como interface alternativa, consumindo a API Node.js via HTTP.
