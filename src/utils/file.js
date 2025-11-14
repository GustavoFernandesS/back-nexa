'use strict';

const fs = require('fs');
const path = require('path');

function getRoot() {
  return path.join(__dirname, '..', '..');
}

function getStorageDir() {
  return path.join(getRoot(), 'storage', 'orcamentos');
}

function ensureDirectories(dirs) {
  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function sanitizeFilename(name) {
  return String(name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
    .slice(0, 50);
}

module.exports = { getStorageDir, ensureDirectories, sanitizeFilename };
