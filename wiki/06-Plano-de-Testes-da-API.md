# Plano de Testes da API

## Objetivo

Garantir que a API Node.js (`backend/`) funcione corretamente em suas operações de cadastro, consulta, atualização e exclusão, além de validar o comportamento do catálogo de meios de pagamento e do cálculo de renda.

## Escopo

- endpoints de despesas (`/api/despesas`)
- endpoints de meios de pagamento (`/api/meios-pagamento`)
- endpoints de renda (`/api/renda`)
- endpoints de sistema (`/api/sistema`)
- interação com a planilha Excel

## Situação atual da automação

Hoje não existe suíte de testes automatizados para o backend Node.js — apenas o script de smoke test manual `backend/check_endpoints.js`, que cobre só um subconjunto de endpoints `GET`/`POST` sem payload (ver [04. Testes da API](04-Testes-da-API.md)). Este plano descreve tanto a validação manual possível hoje quanto a suíte automatizada recomendada para o futuro.

## Tipos de teste

1. **Smoke test manual** (existente)
   - `node backend/check_endpoints.js` com a API em execução, validando que os endpoints básicos respondem sem erro.
2. **Testes de integração** (recomendado, ainda não implementado)
   - framework sugerido: [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest), rodando contra a instância Express (`backend/src/app.js`) sem precisar do servidor já em execução.
   - validar o fluxo completo de cada endpoint, incluindo `POST`/`PUT`/`DELETE /api/despesas` e o CRUD de `/api/meios-pagamento`.
   - validar que as alterações são persistidas em uma **cópia temporária** do arquivo `.xlsx` (apontada via `PLANILHA_CONTROLE_GASTOS_PATH`), nunca no arquivo original.
3. **Testes de regressão**
   - validar que operações antigas continuam funcionando após mudanças no `layoutService`/`excelRepository`.

## Passos do plano

1. Subir a API localmente (`cd backend && npm start`) apontando `PLANILHA_CONTROLE_GASTOS_PATH` para uma cópia temporária da planilha.
2. Rodar o smoke test manual (`node check_endpoints.js`) e conferir que não há erros.
3. Exercitar manualmente (ou, quando a suíte automatizada existir, via testes) os endpoints principais:
   - `GET /api/despesas/categorias`
   - `GET /api/despesas/categorias/{categoria}/subcategorias`
   - `GET /api/despesas/meses`
   - `GET /api/despesas`
   - `POST /api/despesas`
   - `PUT /api/despesas`
   - `DELETE /api/despesas`
   - `GET /api/meios-pagamento`
   - `POST /api/meios-pagamento`
   - `PUT /api/meios-pagamento/{name}`
   - `DELETE /api/meios-pagamento/{name}`
   - `GET /api/renda`
   - `PUT /api/renda`
   - `POST /api/sistema/init`
   - `POST /api/sistema/reload`
   - `GET /api/sistema/planilha`
4. Conferir que o cache de workbook/layout é descartado corretamente por `POST /api/sistema/reload` (edições feitas fora da API, direto no arquivo, devem aparecer após o reload).
5. Revisar a documentação Swagger (`/api/docs`) para conferir consistência entre o contrato documentado nas rotas (`backend/src/routes/*.js`) e o comportamento real dos controladores/serviços.

## Critérios de aceitação

- o smoke test manual (`check_endpoints.js`) roda sem erros;
- endpoints respondem com os códigos esperados (ver [07. Casos de Teste da API](07-Casos-de-Teste-da-API.md) para o contrato de status codes real da API);
- os dados retornados seguem os campos expostos pelos serviços (nomes em inglês: `category`, `subcategory`, `year`, `month`, `value`, `paymentMethod`, `rendaMensal`, `totalDespesas`, `resultadoOperacional`);
- a planilha original `data/PLANILHA CONTROLE DE GASTOS.xlsx` não é modificada durante a validação (usar sempre uma cópia).
