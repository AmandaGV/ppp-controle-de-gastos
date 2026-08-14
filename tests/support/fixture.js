// Monta uma planilha de fixture isolada (fora de data/) e devolve uma
// instância do app Express apontando para ela via PLANILHA_CONTROLE_GASTOS_PATH.
// Cada arquivo de teste chama createTestApp() no seu próprio before/after,
// então cada um recebe planilha e app isolados — sem estado compartilhado
// entre arquivos de teste.

const path = require('path');
const os = require('os');
const fs = require('fs');
const ExcelJS = require('exceljs');

const CATEGORY_FILL = 'FFFFEC64';
const SUBCATEGORY_FILL = 'FFFFF7C5';

async function buildFixtureWorkbook(filePath) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Pessoa Física');

  // Linha 1 fica em branco; cabeçalho de meses vive na linha 2 (ver layoutService.js).
  sheet.getRow(1).values = [];
  sheet.getRow(2).values = ['', 'Categoria / Subcategoria', '08/2026', 'Pagamento 08/2026', '09/2026', 'Pagamento 09/2026'];

  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });

  sheet.getRow(3).values = ['', 'MORADIA'];
  sheet.getRow(3).getCell(2).fill = fill(CATEGORY_FILL);
  sheet.mergeCells('C3:D3');
  sheet.mergeCells('E3:F3');

  sheet.getRow(4).values = ['', 'Aluguel', 0, null, 0, null];
  sheet.getRow(4).getCell(2).fill = fill(SUBCATEGORY_FILL);

  sheet.getRow(5).values = ['', 'Condomínio', 0, null, 0, null];
  sheet.getRow(5).getCell(2).fill = fill(SUBCATEGORY_FILL);

  sheet.getRow(6).values = ['', 'ALIMENTAÇÃO'];
  sheet.getRow(6).getCell(2).fill = fill(CATEGORY_FILL);
  sheet.mergeCells('C6:D6');
  sheet.mergeCells('E6:F6');

  sheet.getRow(7).values = ['', 'Supermercado', 300, 'Cartão de Crédito', 0, null];
  sheet.getRow(7).getCell(2).fill = fill(SUBCATEGORY_FILL);

  sheet.getRow(8).values = ['', 'Total das Despesas', 300, null, 0, null];
  sheet.getRow(9).values = ['', 'Renda Mensal', 8000, null, 8000, null];
  sheet.getRow(10).values = ['', 'Resultado Operacional', 7700, null, 8000, null];

  const paymentSheet = workbook.addWorksheet('Meios de Pagamento');
  paymentSheet.getRow(1).values = ['Nome'];
  paymentSheet.addRow(['Pix']);
  paymentSheet.addRow(['Cartão de Crédito']);

  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  await workbook.xlsx.writeFile(filePath);
}

const BACKEND_SRC_DIR = path.resolve(__dirname, '..', '..', 'backend', 'src');

// dependencies.js cria um ExcelRepository singleton na primeira vez que é
// importado, e cada módulo entre app.js e ele (routes, controllers, services)
// fica em cache com essa mesma referência. Como cada arquivo de teste roda
// no mesmo processo do Mocha, limpar só 'app' e 'dependencies' não é
// suficiente: os módulos intermediários, já em cache, continuariam presos ao
// ExcelRepository (e à planilha) do primeiro arquivo de teste que rodou. Por
// isso toda a árvore de módulos do backend é removida do cache antes de cada
// require, forçando reconstrução com a planilha de fixture atual.
function clearBackendRequireCache() {
  Object.keys(require.cache)
    .filter((modulePath) => modulePath.startsWith(BACKEND_SRC_DIR))
    .forEach((modulePath) => {
      delete require.cache[modulePath];
    });
}

async function createTestApp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ppp-fixture-'));
  const fixturePath = path.join(dir, 'PLANILHA CONTROLE DE GASTOS.xlsx');
  await buildFixtureWorkbook(fixturePath);
  process.env.PLANILHA_CONTROLE_GASTOS_PATH = fixturePath;

  clearBackendRequireCache();
  const app = require('../../backend/src/app');

  return {
    app,
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

module.exports = { createTestApp };
