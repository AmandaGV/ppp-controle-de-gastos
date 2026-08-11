const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const expenseRoutes = require('./routes/expenses');
const paymentRoutes = require('./routes/paymentMethods');
const balanceRoutes = require('./routes/balance');
const systemRoutes = require('./routes/system');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Controle de Gastos Pessoais',
    version: '1.0.0',
    description: 'API REST em Node.js que manipula o arquivo Excel como fonte de dados.',
  },
  servers: [
    {
      url: `http://localhost:${port}/api`,
    },
  ],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/despesas', expenseRoutes);
app.use('/api/meios-pagamento', paymentRoutes);
app.use('/api/renda', balanceRoutes);
app.use('/api/sistema', systemRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint não encontrado.' });
});

app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
});
