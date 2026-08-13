$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$source = Join-Path $projectRoot 'src-tauri\runtime'
$runtime = Join-Path $PSScriptRoot '..\src-tauri\runtime-bundle'
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
Push-Location $projectRoot
pnpm deploy --prod --legacy --filter . src-tauri\runtime-bundle --registry=https://registry.npmmirror.com
if ($LASTEXITCODE -ne 0) { throw "pnpm deploy failed with exit code $LASTEXITCODE" }
Pop-Location

Copy-Item $nodeSource (Join-Path $runtime 'node.exe') -Force
Copy-Item (Join-Path $projectRoot 'src-tauri\launcher.cjs') (Join-Path $runtime 'launcher.cjs') -Force
