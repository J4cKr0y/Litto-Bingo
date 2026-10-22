import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, cpSync, rmSync } from 'node:fs';

const core = 'node_modules/@stryker-mutator/core';
const dest = `${core}/node_modules/typescript`;
const scratch = '.stryker-ts-tmp';

try {
  if (!existsSync(`${core}/package.json`)) process.exit(0); // Stryker absent : rien à faire
  if (existsSync(`${dest}/package.json`)) process.exit(0); // déjà en place

  mkdirSync(scratch, { recursive: true });
  execSync(`npm install typescript@6.0.3 --prefix ${scratch} --no-save --no-package-lock --no-audit --no-fund --loglevel=error`, { stdio: 'inherit' });
  mkdirSync(`${core}/node_modules`, { recursive: true });
  cpSync(`${scratch}/node_modules/typescript`, dest, { recursive: true });
  console.log('TypeScript 6.0.3 injecté pour Stryker (le TypeScript du projet reste inchangé).');
} catch (e) {
  console.warn('Injection TS 6 pour Stryker impossible (non bloquant) :', e.message);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}