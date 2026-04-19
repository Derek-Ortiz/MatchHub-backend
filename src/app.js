const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const routes = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.get('/health', (_, res) =>
  res.json({ 
    status: 'ok', 
    env: env.NODE_ENV, 
    timestamp: new Date().toISOString() 
  })
);

app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;