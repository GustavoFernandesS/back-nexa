'use strict';

const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const { ensureDirectories, getStorageDir } = require('./utils/file');
const orcamentoRoutes = require('./routes/orcamento.routes');

const app = express();

const PORT = process.env.PORT || 3000;
// Prefer configured FRONTEND_URL, otherwise default to the Netlify site
// the user provided so CORS works immediately even without setting env vars.
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://nexagf.netlify.app';

app.use(
  cors({
    // Allow requests from the configured FRONTEND_URL. If FRONTEND_URL
    // is not set, default to localhost dev URL.
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === FRONTEND_URL) return callback(null, true);
      return callback(new Error('CORS policy: origin not allowed'));
    },
  }),
);
app.use(express.json({ limit: '2mb' }));

// When behind a proxy (Render, Heroku, etc.) enable trust proxy so
// req.protocol reflects the original scheme (http/https). This helps
// building correct file URLs (https) when the app is behind a load
// balancer or proxy.
app.set('trust proxy', true);

ensureDirectories([getStorageDir()]);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/orcamento', orcamentoRoutes);

// Servir PDFs (usa o mesmo caminho que o utilitário de arquivos para evitar inconsistências)
app.use('/storage/orcamentos', express.static(getStorageDir()));

app.use((err, _req, res, _next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`CORS liberado para: ${FRONTEND_URL}`);
  console.log(`Diretório de armazenamento: ${getStorageDir()}`);
});
