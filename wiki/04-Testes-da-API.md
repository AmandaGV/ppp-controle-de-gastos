# Testes da API

## Estratégia de testes

Os testes da API usam o FastAPI `TestClient` para fazer chamadas HTTP contra a aplicação em memória.
O arquivo principal de testes é `tests/test_api.py`.

## Como os testes são executados

O comando é:

```bash
pytest
```

## Isolamento da planilha

- Antes de cada teste, a planilha `data/PLANILHA CONTROLE DE GASTOS.xlsx` é copiada para um diretório temporário.
- A variável `PLANILHA_CONTROLE_GASTOS_PATH` é sobrescrita para apontar para essa cópia.
- Assim, os testes não alteram o arquivo original.

## Cobertura atual

Os testes existentes validam:

- listagem de categorias;
- fluxo completo de cadastro, busca e exclusão de despesa;
- rejeição de cadastro com valor inválido pelo schema;
- CRUD de meios de pagamento;
- atualização de renda mensal e cálculo do resultado operacional.

## Estrutura dos testes

- `tests/test_api.py`
  - `client` fixture cria o cliente de teste e monta o contexto.
  - testes usam `GET`, `POST`, `PUT` e `DELETE` contra os endpoints expostos.

## Boas práticas seguidas

- usar fixture para isolar o estado entre testes;
- evitar dependência no arquivo real `data/PLANILHA CONTROLE DE GASTOS.xlsx`;
- validar resposta HTTP e corpo JSON;
- verificar o efeito de uma operação sobre o estado subsequente.
