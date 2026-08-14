import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const runtime = join(projectRoot, 'src-tauri', 'runtime-bundle')
const packageFile = join(projectRoot, 'package.json')
const launcher = join(projectRoot, 'src-tauri', 'launcher.cjs')

const run = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' })
  child.on('error', reject)
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command} exited with ${code}`)))
})

await rm(runtime, { recursive: true, force: true })
await mkdir(runtime, { recursive: true })
const manifest = JSON.parse(await readFile(packageFile, 'utf8'))
await writeFile(join(runtime, 'package.json'), JSON.stringify({
  name: `${manifest.name}-runtime`,
  private: true,
  dependencies: manifest.dependencies
}, null, 2) + '\n')

// The setup-node runner already provides a platform-native Node binary. Reusing
// it avoids shipping three downloaded archives and keeps the bundle reproducible.
const nodeName = process.platform === 'win32' ? 'node.exe' : 'node'
await cp(process.execPath, join(runtime, nodeName))
await cp(launcher, join(runtime, 'launcher.cjs'))
await run('npm', ['install', '--omit=dev', '--no-audit', '--no-fund', '--ignore-scripts'], runtime)
await run('npm', ['rebuild', '--omit=dev', '--no-audit', '--no-fund'], runtime)
await rm(join(runtime, '.npm'), { recursive: true, force: true })
await rm(join(runtime, 'node_modules', '.cache'), { recursive: true, force: true })
