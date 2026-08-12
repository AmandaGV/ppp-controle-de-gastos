const {
  Table, TableRow, TableCell, Paragraph, TextRun, WidthType, ShadingType,
  BorderStyle, VerticalAlign, HeadingLevel,
} = require('docx');

const COL1 = 1600;
const COL2 = 3875;
const COL3 = 3875;
const TABLE_WIDTH = COL1 + COL2 + COL3;

const BORDER = { style: BorderStyle.SINGLE, size: 4, color: '999999' };
const CELL_BORDERS = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER };
const LABEL_SHADING = { type: ShadingType.CLEAR, fill: 'E7E6E6' };
const HEADER_SHADING = { type: ShadingType.CLEAR, fill: 'D9D9D9' };

function labelCell(text) {
  return new TableCell({
    width: { size: COL1, type: WidthType.DXA },
    shading: LABEL_SHADING,
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function valueCell(children, span) {
  return new TableCell({
    width: { size: span === 2 ? COL2 + COL3 : COL2, type: WidthType.DXA },
    columnSpan: span,
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children,
  });
}

function textParagraphs(text) {
  return [new Paragraph({ children: [new TextRun(text)] })];
}

function bulletParagraphs(items) {
  return items.map((item) => new Paragraph({ children: [new TextRun(`- ${item}`)] }));
}

function headerCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: HEADER_SHADING,
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function stepCell(text, width) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    borders: CELL_BORDERS,
    children: [new Paragraph({ children: [new TextRun(text)] })],
  });
}

function buildCaseTable(tc) {
  const rows = [];

  rows.push(new TableRow({ children: [labelCell('ID'), valueCell(textParagraphs(tc.id), 2)] }));
  rows.push(new TableRow({ children: [labelCell('Título'), valueCell(textParagraphs(tc.titulo), 2)] }));
  rows.push(new TableRow({ children: [labelCell('Prioridade'), valueCell(textParagraphs(tc.prioridade), 2)] }));
  rows.push(new TableRow({ children: [labelCell('Rastreabilidade'), valueCell(textParagraphs(tc.rastreabilidade), 2)] }));
  rows.push(new TableRow({ children: [labelCell('Pré-Condições'), valueCell(bulletParagraphs(tc.preCondicoes), 2)] }));

  rows.push(new TableRow({
    children: [
      headerCell('Passos', COL1),
      headerCell('Ação', COL2),
      headerCell('Resultados Esperados', COL3),
    ],
  }));

  tc.passos.forEach((passo, index) => {
    rows.push(new TableRow({
      children: [
        stepCell(`Passo ${index + 1}`, COL1),
        stepCell(passo.acao, COL2),
        stepCell(passo.esperado, COL3),
      ],
    }));
  });

  rows.push(new TableRow({ children: [labelCell('Pós-Condições'), valueCell(bulletParagraphs(tc.posCondicoes), 2)] }));

  return new Table({
    width: { size: TABLE_WIDTH, type: WidthType.DXA },
    columnWidths: [COL1, COL2, COL3],
    rows,
  });
}

function caseHeading(tc) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun(`${tc.id} — ${tc.titulo}`)],
  });
}

module.exports = { buildCaseTable, caseHeading, TABLE_WIDTH, COL1, COL2, COL3 };
