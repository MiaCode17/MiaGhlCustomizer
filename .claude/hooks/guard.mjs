// Hook for Edit/Write tool calls. Reads the hook JSON from stdin.
// PreToolUse: block edits to .env files. PostToolUse: run the matching typecheck.
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const input = JSON.parse(readFileSync(0, 'utf8') || '{}');
const file = String(input.tool_input?.file_path ?? '').replace(/\\/g, '/');
const event = input.hook_event_name;

if (event === 'PreToolUse') {
  if (/(^|\/)\.env(\.[^/]*)?$/.test(file) && !file.endsWith('.env.example')) {
    console.error('Blocked: .env files hold secrets. Edit them yourself, or use .env.example.');
    process.exit(2);
  }
  process.exit(0);
}

if (event === 'PostToolUse') {
  const dir = file.includes('/backend/src/') ? 'backend' : file.includes('/frontend/src/') ? 'frontend' : null;
  if (!dir || !/\.(ts|tsx)$/.test(file)) process.exit(0);
  try {
    execSync('npm run typecheck', { cwd: new URL(`../../${dir}`, import.meta.url), stdio: 'pipe', timeout: 110000 });
  } catch (e) {
    console.error(`Typecheck failed in ${dir}/:\n${e.stdout ?? ''}${e.stderr ?? ''}`.slice(0, 4000));
    process.exit(2);
  }
}
