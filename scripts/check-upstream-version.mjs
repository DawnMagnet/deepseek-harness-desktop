import fs from 'node:fs';
import https from 'node:https';

const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const current = manifest.dependencies['@deepseek-ai/dsh'];
const expectedArg = process.argv.find(arg => arg.startsWith('--expected='));
const expected = expectedArg?.slice('--expected='.length) ?? process.argv[process.argv.indexOf('--expected') + 1];
const latest = await new Promise((resolve, reject) => {
  https.get('https://registry.npmjs.org/@deepseek-ai%2fdsh/latest', (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => resolve(JSON.parse(body).version));
  }).on('error', reject);
});

console.log(`Upstream @deepseek-ai/dsh: ${current} (latest: ${latest})`);
if (expected) {
  const tagVersion = expected.replace(/^dsh-v/, '').replace(/^v/, '');
  if (current !== tagVersion) {
    console.error(`Manifest version ${current} does not match release tag ${expected}.`);
    process.exit(1);
  }
}
if (process.argv.includes('--strict') && current !== latest) {
  console.error('Dependency is not aligned with the latest upstream npm release.');
  process.exit(1);
}
