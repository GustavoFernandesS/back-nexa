'use strict';

const { generateOrcamentoPdf } = require('../services/pdf.service');
const { sendOrcamentoEmail } = require('../services/email.service');

async function criarOrcamentoController(req, res, next) {
  try {
    const { nome, email, descricao, preco, data } = req.body;

    // 1) Gera PDF e salva localmente
    const { filePath, fileName } = await generateOrcamentoPdf({
      nome,
      email,
      descricao,
      preco,
      data,
    });

    // 2) Tentar enviar e-mail com o PDF em anexo. Em caso de falha no envio
    // retornamos sucesso na geração do arquivo (201) e informamos que
    // o envio falhou — assim o frontend não mostra erro quando o PDF existir.
    let emailResult = null;
    try {
      emailResult = await sendOrcamentoEmail({
        nome,
        email,
        descricao,
        preco,
        data,
        attachmentPath: filePath,
        attachmentName: fileName,
      });
    } catch (emailErr) {
      // Logar erro, mas não falhar a operação inteira
      console.error('Falha ao enviar e-mail do orçamento:', emailErr);
    }

    // 3) Resposta com informações do arquivo
    // Prefer using the configured FRONTEND_URL (set in environment)
    // for generating public file URLs. Fallback to request protocol/host.
    const configuredBase = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${configuredBase.replace(/\/$/, '')}/storage/orcamentos/${fileName}`;
    const message = emailResult
      ? 'Orçamento gerado e enviado com sucesso!'
      : 'Orçamento gerado com sucesso, mas falha ao enviar por e-mail.';

    return res.status(201).json({
      message,
      fileName,
      storagePath: filePath,
      fileUrl,
      emailPreview: emailResult ? emailResult.previewUrl : undefined,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { criarOrcamentoController };
