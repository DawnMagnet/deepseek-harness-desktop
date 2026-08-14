import fs from 'node:fs'
import { execFileSync } from 'node:child_process'

const raw = process.argv[2]
if (!raw) throw new Error('usage: node scripts/sync-upstream-version.mjs dsh-vX.Y.Z')
const version = raw.replace(/^dsh-v/, '').replace(/^v/, '')
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`invalid version: ${version}`)

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
packageJson.version = version
packageJson.dependencies['@deepseek-ai/dsh'] = version
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n')

const tauri = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json', 'utf8'))
tauri.version = version
fs.writeFileSync('src-tauri/tauri.conf.json', JSON.stringify(tauri, null, 2) + '\n')

const cargoPath = 'src-tauri/Cargo.toml'
const cargo = fs.readFileSync(cargoPath, 'utf8').replace(
  /(name = "deepseek-harness-desktop"\r?\nversion = ")([^"]+)(")/,
  `$1${version}$3`
)
fs.writeFileSync(cargoPath, cargo)
execFileSync('cargo', ['update', '-p', 'deepseek-harness-desktop'], { cwd: 'src-tauri', stdio: 'inherit' })
console.log(`Synchronized desktop and @deepseek-ai/dsh to ${version}`)
