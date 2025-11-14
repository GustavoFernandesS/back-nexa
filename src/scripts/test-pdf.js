'use strict';

const path = require('path');
const { generateOrcamentoPdf } = require('../services/pdf.service');

async function run() {
  try {
    const result = await generateOrcamentoPdf({
      nome: 'Teste Geracao',
      email: 'teste@example.com',
      descricao: 'Geração de PDF de teste',
      preco: 123.45,
      data: '2025-11-13',
    });
    console.log('Gerado:', result);
  } catch (e) {
    console.error('Erro ao gerar PDF:', e);
    process.exit(1);
  }
}

run();
