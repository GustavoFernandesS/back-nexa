'use strict';

function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

function isValidDate(text) {
  if (!text) return true; // opcional
  const d = new Date(text);
  return !isNaN(d.getTime());
}

function isValidPrice(preco) {
  const num = Number(preco);
  return !isNaN(num) && num >= 0;
}

function validateOrcamento(req, res, next) {
  const { nome, email, descricao, preco, data } = req.body || {};

  const errors = [];
  if (!nome || String(nome).trim().length < 2) errors.push('Nome é obrigatório.');
  if (!email || !isValidEmail(email)) errors.push('E-mail inválido.');
  if (!descricao || String(descricao).trim().length < 3) errors.push('Descrição é obrigatória.');
  if (!isValidPrice(preco)) errors.push('Preço inválido.');
  if (!isValidDate(data)) errors.push('Data inválida.');

  if (errors.length) return res.status(400).json({ message: 'Erro de validação', errors });
  return next();
}

module.exports = { validateOrcamento };
