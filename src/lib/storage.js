'use server';

import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function ensureDataFile(fileName) {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf8');
  }
  return filePath;
}

export async function appendJsonRecord(fileName, record) {
  const filePath = ensureDataFile(fileName);
  const nowIso = new Date().toISOString();
  const enriched = { ...record, createdAt: nowIso };
  const content = fs.readFileSync(filePath, 'utf8');
  let arr = [];
  try {
    arr = JSON.parse(content || '[]');
  } catch {
    arr = [];
  }
  arr.push(enriched);
  fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
  return enriched;
}


