'use strict';

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const dayjs = require('dayjs');

enumLocaleFallback();

const { getStorageDir, sanitizeFilename } = require('../utils/file');

function formatCurrencyBRL(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num);
}

function enumLocaleFallback() {
  try {
    // noop, ensures Intl exists
    new Intl.NumberFormat('pt-BR').format(1);
  } catch (_e) {
    // fallback not required in Node 20+
  }
}

async function generateOrcamentoPdf({ nome, email, descricao, preco, data }) {
  return new Promise((resolve, reject) => {
    try {
  const storageDir = path.join(getStorageDir());

  // Garantir que o diretório de armazenamento exista antes de escrever
  const { ensureDirectories } = require('../utils/file');
  ensureDirectories([storageDir]);

      // Use only first two names to avoid long/personal filenames
      const firstTwo = String(nome || 'cliente')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .join(' ');
      const safeName = sanitizeFilename(firstTwo || 'cliente');
      const timestamp = dayjs().format('YYYYMMDD_HHmmss');
      const fileName = `orcamento_${timestamp}_${safeName}.pdf`;
      const filePath = path.join(storageDir, fileName);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Cores
      const primary = '#0ea5e9'; // cyan-500
      const dark = '#0f172a'; // slate-900
      const muted = '#64748b'; // slate-500

  // Cabeçalho estilizado com logo e nome da empresa (branding centralizado)
  const company = require('../config/company');
  doc.rect(0, 0, doc.page.width, 90).fill(primary);
  doc.fillColor('white').fontSize(22).font('Helvetica-Bold');
  doc.text(company.NAME, 50, 30);
  // Logo simples (círculo) - fallback se não houver imagem externa
  doc.circle(doc.page.width - 70, 45, 20).fill('white').stroke(primary);
  doc.fillColor(primary).fontSize(14).font('Helvetica-Bold');
  doc.text(company.NAME.charAt(0), doc.page.width - 77, 36, { width: 14, align: 'center' });
  doc.fillColor('white').font('Helvetica');
  doc.fontSize(10).text(company.TAGLINE, 50, 60);

      // Título Orçamento
      doc.moveDown(2);
      doc.fillColor(dark).fontSize(20).font('Helvetica-Bold');
      doc.text('Orçamento', { align: 'left' });

      // Dados do cliente
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').fillColor(muted);
      doc.text(`Cliente: `, { continued: true }).fillColor(dark).text(nome || '-');
      doc.fillColor(muted).text(`E-mail: `, { continued: true }).fillColor(dark).text(email || '-');

      // Linha
      doc.moveDown(0.5);
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke();

      // Descrição
      doc.moveDown(1);
      doc.fillColor(dark).font('Helvetica-Bold').text('Descrição do serviço/produto');
      doc.moveDown(0.3);
      doc.font('Helvetica').fillColor('#111827').text(descricao || '-');

      // Preço e Data
      doc.moveDown(1);
      const boxY = doc.y;
      const colWidth = (doc.page.width - 100 - 20) / 2;
      const price = formatCurrencyBRL(preco);
      const dateStr = data ? dayjs(data).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY');

      // Caixa do Preço
      doc.roundedRect(50, boxY, colWidth, 70, 8).fill('#f8fafc');
      doc.fillColor(muted).font('Helvetica').fontSize(12).text('Valor', 65, boxY + 12);
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(18).text(price, 65, boxY + 32);

      // Caixa da Data
      doc.roundedRect(50 + colWidth + 20, boxY, colWidth, 70, 8).fill('#f8fafc');
      doc.fillColor(muted).font('Helvetica').fontSize(12).text('Data', 65 + colWidth + 20, boxY + 12);
      doc.fillColor(dark).font('Helvetica-Bold').fontSize(18).text(dateStr, 65 + colWidth + 20, boxY + 32);

      doc.moveDown(6);

      // Rodapé com informações da empresa
      const footerY = doc.page.height - 80;
      const companyInfo = require('../config/company');
      doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke();
      doc.fillColor(muted).fontSize(10).text(companyInfo.FOOTER, 50, footerY + 10, {
        align: 'center',
        width: doc.page.width - 100,
      });

      doc.end();

      stream.on('finish', () => resolve({ filePath, fileName }));
      stream.on('error', (e) => reject(e));
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { generateOrcamentoPdf };
