# CI da API

## Estado atual

Existe um workflow de CI em `.github/workflows/ci.yml`, disparado a cada `push` e `pull_request`. Ele instala as dependências da raiz e do `backend/`, roda a suíte automatizada (`tests/*.test.js`, Mocha + Chai + Supertest — ver [04. Testes da API](04-Testes-da-API.md)) e, em seguida, sobe a API de verdade para rodar o smoke test `backend/check_endpoints.js` contra ela. Casos ainda não cobertos pela suíte automatizada continuam dependendo de execução manual via Postman.

## Pipeline implementado

A API ativa é a implementação em Node.js (`backend/`). Como a suíte automatizada vive na raiz do repositório (com seu próprio `package.json`) e a API vive em `backend/`, o workflow instala dependências nos dois locais:

1. **Checkout** do repositório.
2. **Instalação de dependências**:
   - `npm install` (raiz — instala Mocha/Chai/Supertest/ExcelJS usados pelos testes)
   - `cd backend && npm install` (API)
3. **Execução de lint**: nenhum script de lint está configurado no projeto ainda, então essa etapa não existe no workflow — pode ser adicionada quando (e se) um linter for introduzido.
4. **Execução de testes automatizados**:
   - `npm test` (a partir da raiz)
5. **Smoke test do servidor** (cobre os endpoints ainda não automatizados):
   - subir a API (`cd backend && npm start`) em background,
   - fazer polling em `GET /api/despesas/categorias` até responder (timeout de 30s),
   - rodar `node check_endpoints.js` contra ela,
   - encerrar o processo do servidor.

## Configuração do workflow

- dispara em todo `push` e `pull_request`, sem restrição de branch (projeto pessoal em desenvolvimento ativo — pode ser restringido a `main` depois, se fizer sentido);
- roda em matriz com Node `18.x` e `20.x`, alinhada ao `engines.node` do `backend/package.json`;
- usa `actions/setup-node` com `cache: npm` e `cache-dependency-path` apontando para os dois lockfiles (`package-lock.json` da raiz e `backend/package-lock.json`).

## Resultados esperados

- build verde se testes/smoke test passarem (lint entra na lista quando for configurado);
- relatórios de falhas claros com código de saída e stack trace do processo Node;
- validação de que a API sobe corretamente e responde nos endpoints básicos após cada alteração.

## Observação

`backend/check_endpoints.js` registra erros no console (`console.error`), mas não lança exceção nem sai com código diferente de zero quando um endpoint falha — então o passo de smoke test do CI hoje não quebra o build sozinho nesse cenário. A etapa de testes automatizados (`npm test`, passo 4) é a que efetivamente falha o build hoje.
