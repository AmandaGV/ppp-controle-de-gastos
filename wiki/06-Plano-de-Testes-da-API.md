# Plano de Testes da API

## Objetivo

Garantir que a API do sistema de controle de gastos funcione corretamente em suas operações de cadastro, consulta, atualização e exclusão, além de validar o comportamento do catálogo de meios de pagamento e do cálculo de renda.

## Escopo

- endpoints de despesas
- endpoints de meios de pagamento
- endpoints de renda
- endpoints de sistema
- validação de payloads
- interação com a planilha Excel

## Tipos de teste

1. **Testes de integração**
   - verificar o fluxo completo do endpoint em memória através do TestClient.
   - validar que as alterações na planilha são persistidas na cópia temporária.
2. **Testes de contrato**
   - garantir que os schemas de entrada e saída estão corretos.
3. **Testes de regressão**
   - validar que operações antigas continuam funcionando após mudanças.

## Passos do plano

1. Executar `pytest` localmente.
2. Verificar falhas em endpoints principais:
   - `GET /despesas/categorias`
   - `GET /despesas/meses`
   - `POST /despesas`
   - `PUT /despesas`
   - `DELETE /despesas`
   - `GET /meios-pagamento`
   - `POST /meios-pagamento`
   - `PUT /meios-pagamento/{nome}`
   - `DELETE /meios-pagamento/{nome}`
   - `GET /renda`
   - `PUT /renda`
   - `POST /sistema/reload`
3. Analisar o funcionamento do cache de workbook e se as atualizações de layout são aplicadas corretamente.
4. Revisar a documentação Swagger para conferir consistência entre contrato e implementação.

## Critérios de aceitação

- todos os testes automatizados passam (`pytest` retorna 0);
- endpoints respondem com os códigos esperados;
- os dados retornados seguem os schemas declarados;
- a planilha original `data/PLANILHA CONTROLE DE GASTOS.xlsx` não é modificada pelos testes.
