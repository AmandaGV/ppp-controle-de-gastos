// CT06 e CT10: cenários negativos/validação de despesas.

const request = require('supertest');
const { expect } = require('chai');
const { createTestApp } = require('./support/fixture');

describe('Despesas - Cenários negativos / validação', () => {
  let app;
  let cleanup;

  before(async () => {
    ({ app, cleanup } = await createTestApp());
  });

  after(() => cleanup());

  it('CT06 - rejeita cadastro com categoria/subcategoria inexistente na planilha', async () => {
    const res = await request(app).post('/api/despesas').send({
      category: 'Categoria-Inexistente-QA',
      subcategory: 'Sub-Inexistente-QA',
      year: 2026,
      month: 8,
      value: 10,
    });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include("Classe não encontrada para categoria='Categoria-Inexistente-QA', subcategoria='Sub-Inexistente-QA'.");
  });

  it('CT10 - rejeita consulta em mês/ano cuja coluna não existe na planilha', async () => {
    const res = await request(app).get('/api/despesas').query({ category: 'MORADIA', subcategory: 'Aluguel', year: 1999, month: 1 });
    expect(res.status).to.equal(400);
    expect(res.body.message).to.include('Não foi possível localizar as colunas de 1/1999.');
  });
});
