import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const runtime = join(projectRoot, 'src-tauri', 'runtime-bundle')
const packageFile = join(projectRoot, 'package.json')

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
await run('npm', ['install', '--omit=dev', '--no-audit', '--no-fund', '--ignore-scripts'], runtime)
await run('npm', ['rebuild', '--omit=dev', '--no-audit', '--no-fund'], runtime)
await rm(join(runtime, '.npm'), { recursive: true, force: true })
await rm(join(runtime, 'node_modules', '.cache'), { recursive: true, force: true })

// Keep executable code and native binaries, but omit files that cannot be
// loaded at runtime. This reduces installer size without changing resolution.
const prune = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = join(directory, entry.name)
    if (entry.isDirectory()) {
      if (/^(test|tests|__tests__|docs|examples)$/.test(entry.name)) {
        await rm(target, { recursive: true, force: true })
      } else await prune(target)
    } else if (/\.(map|md|d\.ts)$/.test(entry.name) || /^(README|CHANGELOG|LICENSE)/i.test(entry.name)) {
      await rm(target, { force: true })
    }
  }
}
await prune(join(runtime, 'node_modules'))
