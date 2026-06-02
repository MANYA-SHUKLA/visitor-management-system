require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const yaml = require('yaml');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const visitRoutes = require('./routes/visitRoutes');
const residentRoutes = require('./routes/residentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const openApiPath = path.join(__dirname, '../openapi.yaml');
const openApiSpec = yaml.parse(fs.readFileSync(openApiPath, 'utf8'));

app.get('/openapi.yaml', (req, res) => {
  res.type('application/yaml').send(fs.readFileSync(openApiPath, 'utf8'));
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customSiteTitle: 'Visitor Management API',
  })
);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
