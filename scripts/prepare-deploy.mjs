// Assembles deploy/app/ into exactly what gets uploaded to Plesk httpdocs.
// Run via: npm run build:deploy
import { readFileSync, writeFileSync, cpSync, existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const appDir = resolve(root, 'deploy/app');

const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));

// Only what the server actually requires at runtime. The frontend's build-time
// dependencies (vite, react, tailwind...) are already baked into dist/.
const RUNTIME_DEPS = ['express', 'mysql2', 'dotenv'];

const serverPkg = {
  name: 'matrix-solutions-site',
  version: pkg.version,
  private: true,
  // No "type": "module" — the server is compiled to CommonJS so it runs on
  // whatever Node version Plesk provides.
  main: 'index.js',
  scripts: { start: 'node index.js' },
  dependencies: Object.fromEntries(
    RUNTIME_DEPS.map((d) => {
      if (!pkg.dependencies[d]) throw new Error(`Missing runtime dependency: ${d}`);
      return [d, pkg.dependencies[d]];
    })
  ),
};

writeFileSync(resolve(appDir, 'package.json'), JSON.stringify(serverPkg, null, 2) + '\n');

const dist = resolve(root, 'dist');
if (!existsSync(dist)) throw new Error('No dist/ found — run "npm run build" first.');
const target = resolve(appDir, 'dist');
rmSync(target, { recursive: true, force: true });
cpSync(dist, target, { recursive: true });

console.log('\nDeployment package ready: deploy/app/');
console.log('  index.js      server (compiled)');
console.log('  package.json  runtime dependencies');
console.log('  dist/         React build');
console.log('\nUpload the CONTENTS of deploy/app/ to httpdocs, then run NPM Install in Plesk.\n');
