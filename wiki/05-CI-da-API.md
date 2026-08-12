# CI da API

## Estado atual

Não há um pipeline de CI configurado no repositório (`.github/workflows/` não está presente). Também não existe suíte de testes automatizados para o backend Node.js — apenas o smoke test manual `backend/check_endpoints.js` (ver [04. Testes da API](04-Testes-da-API.md)).

## Recomendação de pipeline

A API ativa é a implementação em Node.js (`backend/`), então o pipeline sugerido usa a stack Node, não Python:

1. **Checkout** do repositório.
2. **Instalação de dependências**:
   - `cd backend && npm install`
3. **Execução de lint** (se/quando configurado no projeto):
   - `npm run lint`
4. **Execução de testes automatizados** (pré-requisito: adicionar uma suíte real, ex.: Jest + Supertest, já que hoje só existe o smoke test manual):
   - `npm test`
5. **Smoke test do servidor** (etapa mínima possível hoje, sem depender de uma suíte nova):
   - subir a API (`npm start`) em background,
   - rodar `node check_endpoints.js` contra ela,
   - encerrar o processo do servidor.

## Workflow sugerido

- disparar em `push` e `pull_request` para branches principais;
- usar matriz de versões do Node (por exemplo, `18.x`, `20.x`), alinhada ao `engines.node` do `backend/package.json`;
- configurar cache de `npm` (`actions/setup-node` com `cache: npm`, apontando para `backend/package-lock.json`).

## Resultados esperados

- build verde se lint/testes/smoke test passarem;
- relatórios de falhas claros com código de saída e stack trace do processo Node;
- validação de que a API sobe corretamente e responde nos endpoints básicos após cada alteração.

## Observação

A API ainda não expõe um workflow de CI local; esta página registra a necessidade de criar esse pipeline e o plano de ação sugerido, já com a stack correta (Node.js/`backend/`), substituindo a recomendação anterior baseada em Python/`pytest` (que referenciava a API já removida).
