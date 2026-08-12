# Testes da API

## Estratégia de testes

A API Node.js é validada por smoke tests e checagens de endpoint em `backend/check_endpoints.js`, sem depender de uma implementação em Python.

## Como validar manualmente

```bash
cd backend
npm install
node check_endpoints.js
```

## Isolamento da planilha

- A planilha `data/PLANILHA CONTROLE DE GASTOS.xlsx` deve ser tratada como fonte principal.
- Operações de teste devem preferencialmente usar cópias temporárias antes de qualquer verificação automatizada.
- Assim, o arquivo original não é alterado durante a validação.

## Cobertura atual

Os testes existentes validam:

- listagem de categorias;
- fluxo completo de cadastro, busca e exclusão de despesa;
- CRUD de meios de pagamento;
- atualização de renda mensal e cálculo do resultado operacional.

## Observações

- A implementação ativa do repositório é a API em `backend/`.
- A camada Python foi removida para manter um único backend operacional.
