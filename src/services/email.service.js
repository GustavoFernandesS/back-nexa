'use strict';

const nodemailer = require('nodemailer');

async function createTransport() {
  // Em produção, exija variáveis SMTP configuradas
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP não configurado em produção. Defina SMTP_HOST, SMTP_USER e SMTP_PASS.');
    }
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Ambiente de desenvolvimento: usar conta de teste Ethereal
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendOrcamentoEmail({ nome, email, descricao, preco, data, attachmentPath, attachmentName }) {
  const transport = await createTransport();

  const fs = require('fs');
  const company = require('../config/company');
  const from = process.env.FROM_EMAIL || `${company.NAME} <${company.EMAIL}>`;

  const subject = `Seu orçamento - ${company.NAME}`;
  const html = `
    <p>Olá <strong>${nome}</strong>,</p>
    <p>Segue em anexo o seu orçamento solicitado pela ${company.NAME}.</p>
    <p><strong>Resumo:</strong></p>
    <ul>
      <li>Descrição: ${descricao}</li>
      <li>Valor: ${preco}</li>
      <li>Data: ${data || '—'}</li>
    </ul>
    <p>Qualquer dúvida, estamos à disposição.</p>
    <p>Atenciosamente,<br/>${company.NAME}</p>
  `;

  // Verificar anexo
  const attachments = [];
  if (attachmentPath) {
    if (!fs.existsSync(attachmentPath)) {
      throw new Error(`Arquivo de anexo não encontrado: ${attachmentPath}`);
    }
    attachments.push({
      filename: attachmentName || 'orcamento.pdf',
      path: attachmentPath,
      contentType: 'application/pdf',
    });
  }

  try {
    const info = await transport.sendMail({
      from,
      to: email,
      subject,
      html,
      attachments,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    return { info, previewUrl };
  } catch (err) {
    err.message = `Erro ao enviar e-mail: ${err.message}`;
    throw err;
  }
}

module.exports = { sendOrcamentoEmail };
