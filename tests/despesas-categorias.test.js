// CT01 e CT02: listagem de categorias e subcategorias cadastradas.

const request = require('supertest');
const { expect } = require('chai');
const { createTestApp } = require('./support/fixture');

describe('Despesas - Categorias e Subcategorias', () => {
  let app;
  let cleanup;

  before(async () => {
    ({ app, cleanup } = await createTestApp());
  });

  after(() => cleanup());

  it('CT01 - lista as categorias cadastradas na planilha', async () => {
    const res = await request(app).get('/api/despesas/categorias');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal(['MORADIA', 'ALIMENTAÇÃO']);
  });

  it('CT02 - lista as subcategorias de uma categoria existente', async () => {
    const res = await request(app).get('/api/despesas/categorias/MORADIA/subcategorias');
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal(['Aluguel', 'Condomínio']);
  });
});
