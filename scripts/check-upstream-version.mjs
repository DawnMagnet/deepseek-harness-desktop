import fs from 'node:fs';
import https from 'node:https';

const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const current = manifest.dependencies['@deepseek-ai/dsh'];
const latest = await new Promise((resolve, reject) => {
  https.get('https://registry.npmjs.org/@deepseek-ai%2fdsh/latest', (res) => {
    let body = '';
    res.on('data', (chunk) => { body += chunk; });
    res.on('end', () => resolve(JSON.parse(body).version));
  }).on('error', reject);
});

console.log(`Upstream @deepseek-ai/dsh: ${current} (latest: ${latest})`);
if (process.argv.includes('--strict') && current !== latest) {
  console.error('Dependency is not aligned with the latest upstream npm release.');
  process.exit(1);
}
