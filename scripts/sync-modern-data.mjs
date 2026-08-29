#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(root, 'src', 'data');
const modernDir = path.join(root, 'modern', 'src', 'data');

await fs.mkdir(modernDir, { recursive: true });

for (const entry of await fs.readdir(sourceDir, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.ts') || entry.name === 'i18n.ts') continue;
  await fs.copyFile(path.join(sourceDir, entry.name), path.join(modernDir, entry.name));
}

console.log('Shared research data copied to the modern design.');
