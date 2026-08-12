# Visão da API

## Objetivo

Esta API oferece uma interface REST para gerenciar despesas pessoais e a planilha de controle financeiro. A ideia é permitir que o frontend consuma dados estruturados sem precisar abrir diretamente o arquivo Excel.

## Arquitetura

O projeto contém duas implementações de backend:

- `backend/` — API Node.js com Express e Swagger.
- `api/` — API Python com FastAPI e Pydantic.

A documentação abaixo foca na API atual do diretório `api/`, a mesma usada pelos testes automatizados.

## Princípios

- **Fonte única de verdade**: o arquivo Excel `data/PLANILHA CONTROLE DE GASTOS.xlsx` é a única fonte de dados do domínio financeiro.
- **Separação de camadas**: há um repositório para acesso à planilha, serviços para regras de negócio e controladores que expõem rotas HTTP.
- **Configuração dinâmica**: o layout da planilha não é codificado em posições fixas. O serviço de layout localiza colunas e linhas pelo texto dos cabeçalhos e rótulos.
- **Validação de entrada**: o contrato de API é definido com schemas Pydantic em `api/schemas`, garantindo tipos e regras de payload.
- **Documentação automática**: o FastAPI gera documentação Swagger automaticamente a partir das rotas e dos modelos.

## Pontos-chave

- A API lê e escreve diretamente no arquivo Excel.
- A lógica de negócio está isolada em `api/services/`.
- Os controladores (`api/controllers/`) fazem a ponte entre HTTP e regras de negócio.
- O módulo de dependências (`api/dependencies.py`) compõe o contexto de aplicação com cache e controle de lifetime.
- A documentação interativa fica disponível em `/docs` quando a API está em execução.
