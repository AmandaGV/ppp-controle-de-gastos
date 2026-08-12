const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, VerticalAlign,
  PageBreak, LevelFormat, convertInchesToTwip,
} = require('docx');
const { testCases } = require('./test-cases-data');

const US_LETTER = { width: 12240, height: 15840 };
const MARGIN = 1080;
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const HEADER_SHADING = { type: ShadingType.CLEAR, fill: 'D9D9D9' };

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 }, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, children: [new TextRun(text)] });
}
function p(text) {
  return new Paragraph({ spacing: { after: 160 }, children: [new TextRun(text)] });
}
function bullet(text) {
  return new Paragraph({ numbering: { reference: 'bullet-list', level: 0 }, spacing: { after: 60 }, children: [new TextRun(text)] });
}
function headCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: HEADER_SHADING,
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}
function cell(text, width, bold) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun({ text: String(text), bold: !!bold })] })],
  });
}

const children = [];

// Capa
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1600, after: 200 }, children: [new TextRun({ text: 'Plano de Testes', bold: true, size: 56 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'API de Controle de Gastos Pessoais', size: 32 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1600 }, children: [new TextRun({ text: 'Testes funcionais de API executados com Postman', size: 22, italics: true })] }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// 1. Introdução
children.push(h1('1. Introdução'));
children.push(p(
  'Este Plano de Testes descreve a estratégia, o escopo e os recursos utilizados para validar funcionalmente a API REST '
  + 'de Controle de Gastos Pessoais (projeto "ppp-controle-de-gastos"). A API é implementada em Node.js/Express '
  + '(backend/src), expõe seus endpoints sob o prefixo /api e utiliza como base de dados uma planilha Excel '
  + '("data/PLANILHA CONTROLE DE GASTOS.xlsx"), acessada exclusivamente através da camada de repositório da própria API.'
));
children.push(p(
  'O documento "Casos de Teste - Controle de Gastos.docx" complementa este plano, detalhando cada cenário no formato '
  + 'ID / Título / Prioridade / Rastreabilidade / Pré-Condições / Passos / Pós-Condições, com execução via Postman.'
));

// 2. Objetivo
children.push(h1('2. Objetivo'));
children.push(bullet('Validar que cada endpoint da API responde com o código de status e o corpo esperados para cenários positivos e negativos.'));
children.push(bullet('Validar as regras de negócio com efeito colateral sobre a planilha (soma x substituição de valor, zerar despesa, concatenação e propagação de meios de pagamento, recálculo de resultado operacional).'));
children.push(bullet('Confirmar o comportamento da API diante de dados inválidos ou inexistentes (categoria, subcategoria, mês/ano, meio de pagamento).'));
children.push(bullet('Registrar divergências entre a documentação (Swagger/wiki) e o comportamento real implementado.'));

// 3. Escopo
children.push(h1('3. Escopo'));
children.push(h2('3.1 Dentro do escopo'));
children.push(bullet('Recurso Despesas: GET, POST, PUT, DELETE /despesas; GET /despesas/categorias; GET /despesas/categorias/{categoria}/subcategorias; GET /despesas/meses.'));
children.push(bullet('Recurso Meios de Pagamento: GET, POST /meios-pagamento; PUT, DELETE /meios-pagamento/{name}.'));
children.push(bullet('Recurso Renda: GET, PUT /renda.'));
children.push(bullet('Recurso Sistema: POST /sistema/reload; POST /sistema/init; GET /sistema/planilha.'));
children.push(bullet('Tratamento padrão de rota inexistente (404).'));
children.push(h2('3.2 Fora do escopo'));
children.push(bullet('Interface Streamlit (ui/) e o arquivo frontend/index.html — são consumidores da API, não fazem parte deste plano.'));
children.push(bullet('Testes de carga, performance e segurança aprofundada (a API não implementa autenticação/autorização; ver seção 10).'));
children.push(bullet('Testes automatizados de unidade dos serviços internos (expenseService, layoutService etc.) — cobertos por testes de nível de código, não por esta suíte de API.'));

// 4. Itens de teste
children.push(h1('4. Itens de Teste (Endpoints)'));
const endpointRows = [
  ['Método', 'Endpoint', 'Descrição'],
  ['GET', '/despesas', 'Consulta uma despesa por category, subcategory, year, month'],
  ['POST', '/despesas', 'Cadastra despesa; soma o value ao valor já existente na célula'],
  ['PUT', '/despesas', 'Atualiza despesa; substitui o valor existente na célula'],
  ['DELETE', '/despesas', 'Remove despesa; zera o valor e limpa o meio de pagamento'],
  ['GET', '/despesas/categorias', 'Lista as categorias cadastradas'],
  ['GET', '/despesas/categorias/{categoria}/subcategorias', 'Lista as subcategorias de uma categoria'],
  ['GET', '/despesas/meses', 'Lista os meses (colunas) disponíveis na planilha'],
  ['GET', '/meios-pagamento', 'Lista os meios de pagamento cadastrados'],
  ['POST', '/meios-pagamento', 'Cadastra um novo meio de pagamento (nome único, case-insensitive)'],
  ['PUT', '/meios-pagamento/{name}', 'Renomeia um meio de pagamento e propaga para as despesas'],
  ['DELETE', '/meios-pagamento/{name}', 'Remove um meio de pagamento do catálogo'],
  ['GET', '/renda', 'Consulta renda mensal, total de despesas e resultado operacional'],
  ['PUT', '/renda', 'Atualiza a renda mensal e recalcula o resultado operacional'],
  ['POST', '/sistema/reload', 'Recarrega o workbook em memória a partir do disco'],
  ['POST', '/sistema/init', 'Inicializa/recria a planilha'],
  ['GET', '/sistema/planilha', 'Retorna visão consolidada da planilha (meses, meios de pagamento, linhas)'],
];
const widths = [1400, 3900, 4050];
children.push(new Table({
  width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: widths,
  rows: endpointRows.map((r, i) => new TableRow({
    children: r.map((t, ci) => (i === 0 ? headCell(t, widths[ci]) : cell(t, widths[ci]))),
  })),
}));

children.push(new Paragraph({ children: [new PageBreak()] }));

// 5. Estratégia
children.push(h1('5. Estratégia de Testes'));
children.push(p('Os testes são funcionais, de caixa-preta, executados diretamente contra a API HTTP (sem mocks), combinando:'));
children.push(bullet('Testes de contrato: código de status HTTP e formato do corpo da resposta para cada endpoint.'));
children.push(bullet('Testes de regra de negócio: efeitos colaterais sobre a planilha (soma, substituição, zeragem, concatenação, propagação, recálculo), validados consultando GET /sistema/planilha ou os próprios GETs após a operação.'));
children.push(bullet('Testes negativos: dados inexistentes ou inválidos (categoria/subcategoria/mês/ano/meio de pagamento inexistentes, campos obrigatórios ausentes, duplicidade).'));
children.push(bullet('Teste de rota inexistente: validação do catch-all 404 do Express.'));
children.push(p('Prioridades dos casos: Alta (fluxos principais com efeito colateral sobre a planilha e cálculos), Média (validações de negócio e cenários negativos), Baixa (listagens somente leitura e validações simples de campo obrigatório).'));

// 6. Ferramentas e ambiente
children.push(h1('6. Ferramentas e Ambiente de Teste'));
children.push(h2('6.1 Ferramenta principal: Postman'));
children.push(p('A execução dos casos de teste é feita através da coleção Postman "Controle de Gastos - API" (Anexo A), organizada em pastas por recurso (Sistema, Despesas, Meios de Pagamento, Renda, Rotas inexistentes). Cada requisição da coleção possui scripts de teste (pm.test) que validam automaticamente o código de status e os campos-chave do corpo da resposta.'));
children.push(bullet('Environment "Controle de Gastos - Local" (Anexo B): define a variável base_url = http://localhost:3000/api.'));
children.push(bullet('Execução manual: Postman Desktop/Web, selecionando o environment e disparando cada requisição ou a coleção inteira via Collection Runner.'));
children.push(bullet('Execução via linha de comando (opcional, para futura integração com pipeline de CI): Newman — comando "newman run controle-gastos-api.postman_collection.json -e controle-gastos-api.postman_environment.json".'));
children.push(h2('6.2 Ambiente sob teste'));
children.push(bullet('Backend: Node.js >= 18, Express, executado localmente a partir de backend/ (npm start ou equivalente), porta padrão 3000.'));
children.push(bullet('Base de dados: arquivo Excel data/PLANILHA CONTROLE DE GASTOS.xlsx (ou caminho definido pela variável de ambiente PLANILHA_CONTROLE_GASTOS_PATH).'));
children.push(bullet('Sem autenticação: nenhum endpoint exige token, chave de API ou sessão (ver seção 10).'));
children.push(p('Recomenda-se executar os testes contra uma cópia da planilha (ambiente de teste isolado), já que as operações de escrita alteram o arquivo em disco permanentemente e não há mecanismo de rollback automático — a restauração de estado entre execuções deve ser feita restaurando o arquivo original ou chamando POST /sistema/reload após substituir o arquivo manualmente.'));

// 7. Critérios de entrada e saída
children.push(h1('7. Critérios de Entrada e Saída'));
children.push(h2('7.1 Critérios de entrada'));
children.push(bullet('Backend em execução e respondendo em {{base_url}}.'));
children.push(bullet('Planilha de teste disponível, com ao menos as categorias/subcategorias e a coluna do mês usados nos casos de teste (ex.: MORADIA / Aluguel, mês 08/2026).'));
children.push(bullet('Coleção e environment do Postman importados.'));
children.push(h2('7.2 Critérios de saída'));
children.push(bullet('100% dos casos de teste executados.'));
children.push(bullet('Todos os casos de prioridade Alta aprovados (sem divergência entre resultado esperado e obtido).'));
children.push(bullet('Divergências encontradas registradas com evidência (request/response) e classificadas por severidade.'));

// 8. Matriz de rastreabilidade
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('8. Matriz de Rastreabilidade'));
children.push(p('Códigos de regra de negócio (RN) e requisito funcional (REQ) referenciados no campo "Rastreabilidade" dos Casos de Teste.'));

const rnDescriptions = {
  RN1: 'Cadastro de despesa (POST /despesas): o value informado é somado ao valor já existente na célula.',
  RN2: 'Atualização de despesa (PUT /despesas): o value informado substitui o valor existente na célula.',
  RN3: 'Exclusão de despesa (DELETE /despesas): zera o valor da célula e limpa o meio de pagamento; a linha não é removida.',
  RN4: 'Renomeação de meio de pagamento (PUT /meios-pagamento/{name}): propaga o novo nome para todas as células de despesa que referenciam o nome antigo.',
  RN5: 'Resultado Operacional = Renda Mensal − Total das Despesas; recalculado a cada alteração de despesa ou de renda.',
  RN6: 'Concatenação de meios de pagamento (POST /despesas): novo meio é concatenado (separado por vírgula) sem duplicar valores já existentes na célula.',
  RN7: 'Unicidade de meio de pagamento (POST /meios-pagamento): comparação case-insensitive contra os nomes já cadastrados.',
};
const reqDescriptions = {
  REQ1: 'Listagem de categorias cadastradas (GET /despesas/categorias).',
  REQ2: 'Listagem de subcategorias de uma categoria (GET /despesas/categorias/{categoria}/subcategorias).',
  REQ3: 'Listagem dos meses disponíveis no cabeçalho da planilha (GET /despesas/meses).',
  REQ4: 'Consulta/cadastro de despesa por categoria, subcategoria, mês e ano, incluindo cenários de dado inexistente (GET/POST /despesas).',
  REQ5: 'Consulta de renda mensal, total de despesas e resultado operacional (GET /renda).',
  REQ9: 'Listagem e cadastro de meios de pagamento no catálogo (GET/POST /meios-pagamento).',
  REQ10: 'Exclusão de meio de pagamento do catálogo (DELETE /meios-pagamento/{name}).',
  REQ11: 'Tratamento padrão de rota inexistente (404 catch-all).',
};

function casesFor(code) {
  return testCases.filter((tc) => tc.rastreabilidade === code).map((tc) => tc.id).join(', ');
}

const trWidths = [1100, 6350, 1500];
const trRows = [['Código', 'Descrição', 'Casos de Teste']];
Object.keys(rnDescriptions).forEach((code) => trRows.push([code, rnDescriptions[code], casesFor(code)]));
Object.keys(reqDescriptions).forEach((code) => trRows.push([code, reqDescriptions[code], casesFor(code)]));

children.push(new Table({
  width: { size: trWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: trWidths,
  rows: trRows.map((r, i) => new TableRow({
    children: r.map((t, ci) => (i === 0 ? headCell(t, trWidths[ci]) : cell(t, trWidths[ci]))),
  })),
}));

// 9. Riscos e achados
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(h1('9. Riscos e Achados do Levantamento Técnico'));
children.push(p('Os pontos abaixo foram identificados na leitura do código-fonte (backend/src) durante a preparação deste plano e devem ser tratados como cenários de teste de atenção, não como bugs confirmados:'));
children.push(bullet('Ausência de autenticação: nenhum endpoint da API exige token, chave de API ou sessão. Qualquer cliente na rede pode ler e escrever na planilha. Fora do escopo funcional deste plano, mas deve ser sinalizado como risco de segurança ao time.'));
children.push(bullet('Validações documentadas x implementadas: a wiki do projeto (03-Regras-de-Negocio.md) descreve validações como "valor deve ser maior que zero no cadastro" e "categoria/subcategoria não podem ser vazias", mas o código de expenseController/expenseService não implementa essas checagens explicitamente — um valor negativo ou zero é aceito. Recomenda-se caso de teste exploratório adicional para confirmar esse comportamento antes de reportar como defeito.'));
children.push(bullet('Divergência de status HTTP: o swagger-spec.json documenta 404 para "meio de pagamento não encontrado" em PUT/DELETE /meios-pagamento/{name}, mas o controller real (paymentMethodController.js) captura todos os erros e retorna 400. Os casos CT16 e CT18 validam o comportamento real (400).'));
children.push(bullet('DELETE /meios-pagamento/{name} não limpa referências: ao excluir um meio de pagamento do catálogo, células de despesa que ainda o referenciam não são atualizadas nem alertadas — o nome excluído permanece "órfão" nessas células (ver Pós-Condições do CT17).'));
children.push(bullet('POST /sistema/init não recria de fato: a implementação atual apenas chama a mesma rotina de POST /sistema/reload, não uma reinicialização/reset real da planilha, apesar do texto de resposta sugerir criação.'));

// 10. Papéis
children.push(h1('10. Papéis e Responsabilidades'));
const rrWidths = [3000, 5950];
const rrRows = [
  ['Papel', 'Responsabilidade'],
  ['Analista de Testes / QA', 'Elaborar e manter os casos de teste, executar a coleção Postman, registrar e acompanhar divergências.'],
  ['Desenvolvedor(a) Backend', 'Corrigir divergências confirmadas, revisar achados da seção 9, manter o swagger-spec.json alinhado ao código.'],
  ['Responsável pelo projeto', 'Aprovar os critérios de saída e priorizar os achados de risco.'],
];
children.push(new Table({
  width: { size: rrWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
  columnWidths: rrWidths,
  rows: rrRows.map((r, i) => new TableRow({
    children: r.map((t, ci) => (i === 0 ? headCell(t, rrWidths[ci]) : cell(t, rrWidths[ci]))),
  })),
}));

// 11. Anexos
children.push(h1('11. Anexos'));
children.push(bullet('Anexo A — Coleção Postman: controle-gastos-api.postman_collection.json'));
children.push(bullet('Anexo B — Environment Postman: controle-gastos-api.postman_environment.json'));
children.push(bullet('Anexo C — Casos de Teste: Casos de Teste - Controle de Gastos.docx'));

const numbering = {
  config: [
    {
      reference: 'bullet-list',
      levels: [
        { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) } } } },
      ],
    },
  ],
};

const doc = new Document({
  numbering,
  sections: [
    {
      properties: {
        page: {
          size: US_LETTER,
          margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
        },
      },
      children,
    },
  ],
});

const outPath = path.resolve(__dirname, '..', 'Plano de Testes - Postman.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Gerado:', outPath);
});
