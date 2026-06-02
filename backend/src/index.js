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

app.get('/', (req, res) => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Visitor Management System API</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f5f5f5; }
    .card { background: #fff; border-radius: 12px; padding: 2.5rem 3rem; box-shadow: 0 4px 24px rgba(0,0,0,0.08); text-align: center; max-width: 480px; }
    h1 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #111; }
    p { color: #555; margin: 0.4rem 0; }
    a { display: inline-block; margin-top: 1.2rem; padding: 0.6rem 1.4rem; background: #2563eb; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 500; }
    a:hover { background: #1d4ed8; }
    footer { margin-top: 2rem; font-size: 0.8rem; color: #999; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Visitor Management System API</h1>
    <p>Backend service for residential society visitor management.</p>
    <a href="${baseUrl}/api-docs">View API Docs</a>
    <footer>Made with &#10084;&#65039; by Manya Shukla &copy; 2026</footer>
  </div>
</body>
</html>`);
});

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
    const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
    console.log(`API running on ${baseUrl}`);
    console.log(`Swagger UI: ${baseUrl}/api-docs`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
