// Fails if the admin UI's icon picker and the embed script's icon library have drifted apart.
//   node scripts/check-icon-sync.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const marker = 'export const ICON_LIBRARY';

function library(file) {
  const text = readFileSync(join(root, file), 'utf8').replace(/\r\n/g, '\n');
  const at = text.indexOf(marker);
  if (at < 0) throw new Error(`${file} has no ICON_LIBRARY`);
  return text.slice(at).trim();
}

const backend = library('backend/src/runtime/icons.ts');
const frontend = library('frontend/src/utils/iconLibrary.ts');

if (backend !== frontend) {
  console.error('ICON_LIBRARY differs between backend/src/runtime/icons.ts and frontend/src/utils/iconLibrary.ts');
  process.exit(1);
}
console.log('Icon libraries match.');
