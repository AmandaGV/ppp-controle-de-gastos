# Visão da API

## Objetivo

Esta API oferece uma interface REST para gerenciar despesas pessoais e a planilha de controle financeiro. A ideia é permitir que o frontend consuma dados estruturados sem precisar abrir diretamente o arquivo Excel.

## Arquitetura

O projeto usa uma única implementação de backend:

- `backend/` — API Node.js com Express e Swagger.

A documentação abaixo descreve a API atual do diretório `backend/`, que é a implementação ativa do sistema.

## Princípios

- **Fonte única de verdade**: o arquivo Excel `data/PLANILHA CONTROLE DE GASTOS.xlsx` é a única fonte de dados do domínio financeiro.
- **Separação de camadas**: há um repositório para acesso à planilha, serviços para regras de negócio e controladores que expõem rotas HTTP.
- **Configuração dinâmica**: o layout da planilha não é codificado em posições fixas. O serviço de layout localiza colunas e linhas pelo texto dos cabeçalhos e rótulos.
- **Documentação automática**: o Swagger gera a documentação interativa a partir das rotas em `backend/src/routes/`.

## Pontos-chave

- A API lê e escreve diretamente no arquivo Excel.
- A lógica de negócio está isolada em `backend/src/services/`.
- Os controladores (`backend/src/controllers/`) fazem a ponte entre HTTP e regras de negócio.
- O repositório (`backend/src/repositories/excelRepository.js`) centraliza a leitura e escrita da planilha.
- A documentação interativa fica disponível em `/api/docs` quando a API está em execução.
