// CT12, CT15 e CT17: ciclo de vida do catálogo de meios de pagamento



const request = require('supertest');
const { expect } = require('chai');
const { createTestApp } = require('./support/fixture');

describe('Meios de Pagamento - CRUD do catálogo', () => {
  let app;
  let cleanup;

  before(async () => {
    ({ app, cleanup } = await createTestApp());
  });

  after(() => cleanup());

  it('CT12 - cadastra um novo meio de pagamento no catálogo', async () => {
    const res = await request(app).post('/api/meios-pagamento').send({ name: 'Pix Teste QA' });
    expect(res.status).to.equal(201);
    expect(res.body.name).to.equal('Pix Teste QA');

    const list = await request(app).get('/api/meios-pagamento');
    expect(list.body.map((m) => m.name)).to.include('Pix Teste QA');
  });

  it('CT15 - renomeia um meio de pagamento e propaga o novo nome para as despesas que o referenciam', async () => {
    const propagationTarget = { category: 'ALIMENTAÇÃO', subcategory: 'Supermercado', year: 2026, month: 9 };
    await request(app).post('/api/despesas').send({ ...propagationTarget, value: 10, paymentMethod: 'Pix Teste QA' });

    const res = await request(app).put('/api/meios-pagamento/Pix Teste QA').send({ newName: 'Pix Teste QA Renomeado' });
    expect(res.status).to.equal(200);
    expect(res.body.name).to.equal('Pix Teste QA Renomeado');

    const expense = await request(app).get('/api/despesas').query(propagationTarget);
    expect(expense.body.paymentMethod).to.equal('Pix Teste QA Renomeado');
  });

  it('CT17 - exclui um meio de pagamento do catálogo', async () => {
    const res = await request(app).delete('/api/meios-pagamento/Pix Teste QA Renomeado');
    expect(res.status).to.equal(200);
    expect(res.body.message).to.equal('Meio de pagamento excluído com sucesso.');

    const list = await request(app).get('/api/meios-pagamento');
    expect(list.body.map((m) => m.name)).to.not.include('Pix Teste QA Renomeado');
  });
});
