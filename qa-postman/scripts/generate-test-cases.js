const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  PageBreak, BorderStyle,
} = require('docx');
const { buildCaseTable, caseHeading } = require('./case-table');
const { testCases } = require('./test-cases-data');

const US_LETTER = { width: 12240, height: 15840 };
const MARGIN = 1080;

const children = [];

children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { before: 1600, after: 200 },
  children: [new TextRun({ text: 'Casos de Teste', bold: true, size: 56 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: 'API de Controle de Gastos Pessoais', size: 32 })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 100 },
  children: [new TextRun({ text: 'Baseado no modelo de Caso de Teste da ISO/IEC/IEEE 29119-3', size: 22, italics: true })],
}));
children.push(new Paragraph({
  alignment: AlignmentType.CENTER,
  spacing: { after: 1600 },
  children: [new TextRun({ text: 'Execução recomendada via Postman — coleção "Controle de Gastos - API"', size: 22 })],
}));

children.push(new Paragraph({
  heading: HeadingLevel.HEADING_1,
  children: [new TextRun('Introdução')],
}));
children.push(new Paragraph({
  spacing: { after: 200 },
  children: [new TextRun(
    'Este documento reúne os casos de teste funcionais da API de Controle de Gastos Pessoais (backend Node/Express, '
    + 'endpoints sob /api). Cada caso segue o modelo de Caso de Teste baseado na ISO/IEC/IEEE 29119-3: ID, Título, '
    + 'Prioridade, Rastreabilidade, Pré-Condições, Passos (Ação / Resultado Esperado) e Pós-Condições. A execução dos '
    + 'passos é feita através da coleção Postman "Controle de Gastos - API" (ver Plano de Testes, Anexo A).'
  )],
}));
children.push(new Paragraph({
  spacing: { after: 200 },
  children: [new TextRun(
    'A coluna "Rastreabilidade" referencia os códigos RN (Regra de Negócio) e REQ (Requisito Funcional) definidos na '
    + 'Matriz de Rastreabilidade do Plano de Testes.'
  )],
}));
children.push(new Paragraph({
  children: [new PageBreak()],
}));

testCases.forEach((tc, index) => {
  children.push(caseHeading(tc));
  children.push(buildCaseTable(tc));
  if (index < testCases.length - 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
});

const doc = new Document({
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

const outPath = path.resolve(__dirname, '..', 'Casos de Teste - Controle de Gastos.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outPath, buffer);
  console.log('Gerado:', outPath);
});
