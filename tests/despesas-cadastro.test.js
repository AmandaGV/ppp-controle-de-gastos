// CT04 e CT05: cadastro de despesa somando o valor à célula e concatenando


const request = require('supertest');
const { expect } = require('chai');
const { createTestApp } = require('./support/fixture');

describe('Despesas - Cadastro (soma valor, concatena meio de pagamento)', () => {
  let app;
  let cleanup;

  const expensePayload = { category: 'MORADIA', subcategory: 'Aluguel', year: 2026, month: 8 };

  before(async () => {
    ({ app, cleanup } = await createTestApp());
  });

  after(() => cleanup());

  it('CT04 - cadastra despesa somando o valor ao já existente na célula', async () => {
    const res = await request(app).post('/api/despesas').send({ ...expensePayload, value: 150.5, paymentMethod: 'Pix' });
    expect(res.status).to.equal(201);
    expect(res.body.value).to.equal(150.5);
    expect(res.body.paymentMethod).to.equal('Pix');
  });

  it('CT05 - concatena novo meio de pagamento sem duplicar valores já existentes na célula', async () => {
    const res = await request(app).post('/api/despesas').send({ ...expensePayload, value: 50, paymentMethod: 'Cartão de Crédito' });
    expect(res.status).to.equal(201);
    expect(res.body.value).to.equal(200.5);
    expect(res.body.paymentMethod).to.equal('Pix, Cartão de Crédito');

    const repeated = await request(app).post('/api/despesas').send({ ...expensePayload, value: 0, paymentMethod: 'Pix' });
    expect(repeated.body.paymentMethod).to.equal('Pix, Cartão de Crédito');
  });
});
