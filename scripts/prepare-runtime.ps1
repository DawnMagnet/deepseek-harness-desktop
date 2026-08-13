$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Join-Path $projectRoot 'src-tauri\runtime'
$runtime = Join-Path $projectRoot 'src-tauri\runtime-bundle'
$nodeSource = Join-Path $source 'node.exe'

New-Item -ItemType Directory -Force -Path $source | Out-Null
if (-not (Test-Path -LiteralPath $nodeSource)) {
  $nodeVersion = 'v22.23.1'
  $zip = Join-Path $env:TEMP "node-$nodeVersion-win-x64.zip"
  $extract = Join-Path $env:TEMP "deepseek-node-$nodeVersion"
  Invoke-WebRequest "https://npmmirror.com/mirrors/node/$nodeVersion/node-$nodeVersion-win-x64.zip" -OutFile $zip
  Expand-Archive $zip -DestinationPath $extract -Force
  Copy-Item (Join-Path $extract "node-$nodeVersion-win-x64\node.exe") $nodeSource -Force
}

if (Test-Path -LiteralPath $runtime) { Remove-Item -LiteralPath $runtime -Recurse -Force }
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
Copy-Item (Join-Path $projectRoot 'package.json') (Join-Path $runtime 'package.json') -Force

# pnpm remains the project package manager. npm is intentionally used only here
# to materialize a flat runtime tree, because NSIS cannot reliably read the
# long junction paths produced by pnpm's virtual store on Windows.
Push-Location $runtime
npm install --omit=dev --no-audit --no-fund --registry=https://registry.npmmirror.com
if ($LASTEXITCODE -ne 0) { throw "npm runtime install failed with exit code $LASTEXITCODE" }
Pop-Location

Copy-Item $nodeSource (Join-Path $runtime 'node.exe') -Force
Copy-Item (Join-Path $projectRoot 'src-tauri\launcher.cjs') (Join-Path $runtime 'launcher.cjs') -Force
