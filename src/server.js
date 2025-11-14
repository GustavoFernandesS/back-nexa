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
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';

app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);
app.use(express.json({ limit: '2mb' }));

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
