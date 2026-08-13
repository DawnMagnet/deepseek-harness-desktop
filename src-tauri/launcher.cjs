const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const root = __dirname;
const pkg = path.join(root, 'node_modules', '@deepseek-ai', 'dsh', 'package.json');
const manifest = JSON.parse(fs.readFileSync(pkg, 'utf8'));
const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin.dsh;
const entry = path.resolve(path.dirname(pkg), bin);
const child = spawn(process.execPath, [entry, 'web'], {
  cwd: root,
  env: { ...process.env, PORT: '3080' },
  stdio: 'inherit'
});
child.on('exit', code => process.exit(code ?? 0));
process.on('SIGTERM', () => child.kill());
