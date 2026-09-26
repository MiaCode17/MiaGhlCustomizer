import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { GHL_SELECTORS } from './ghlSelectors';
import { RUNTIME_FEATURES } from './resolve';

/**
 * Assembles the embeddable customizer script served from /cdn.
 *
 * The browser code lives as plain JS templates in backend/runtime-scripts/
 * (outside src/ so tsc leaves it untouched): core.js is the shared injection
 * library (observer + interval + dedup markers, config fetch, SPA route
 * tracking) and each <feature>.js registers one feature against it. core.js
 * contains the BOOT_PLACEHOLDER line, replaced here with this company's boot
 * config.
 */
export const SCRIPTS_DIR = path.resolve(__dirname, '../../runtime-scripts');

/** Every script-backed feature. `login` has no JSON config; it links /runtime/login-css. */
export const SCRIPT_FEATURES = [...Object.keys(RUNTIME_FEATURES), 'login'];

const BOOT_PLACEHOLDER = 'var BOOT = __MGC_BOOT__;';

const cache = new Map<string, string>();

function readScript(name: string): string {
  const cached = cache.get(name);
  if (cached !== undefined) return cached;
  const source = fs.readFileSync(path.join(SCRIPTS_DIR, `${name}.js`), 'utf8');
  // Re-read on every request in development so script edits show up without a restart.
  if (env.NODE_ENV === 'production') cache.set(name, source);
  return source;
}

export function buildEmbedScript(options: {
  companyId: string;
  apiBase: string;
  features: string[];
}): string {
  const boot = JSON.stringify({
    companyId: options.companyId,
    apiBase: options.apiBase.replace(/\/+$/, ''),
    selectors: GHL_SELECTORS,
  });
  const core = readScript('core').replace(BOOT_PLACEHOLDER, () => `var BOOT = ${boot};`);
  if (core.includes('__MGC_BOOT__')) {
    throw new Error(`core.js must contain exactly one "${BOOT_PLACEHOLDER}" line`);
  }
  const features = options.features.map((f) => `/* ---- ${f} ---- */\n${readScript(f)}`);
  return [
    `/* Customizer embed script — company ${options.companyId} */`,
    core,
    ...features,
    'window.__mgcCustomizer && window.__mgcCustomizer.start();',
  ].join('\n\n');
}
