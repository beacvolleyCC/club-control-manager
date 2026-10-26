# CC Manager TEST: export ONLY vetted public PWA runtime files into a NEW separate Git repo.
param([Parameter(Mandatory=$true)][string]$Destination)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$source=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$target=[IO.Path]::GetFullPath($Destination)
$sep=[IO.Path]::DirectorySeparatorChar
if($target.Equals($source,[StringComparison]::OrdinalIgnoreCase) -or
   $target.StartsWith($source.TrimEnd([char[]]@('/','\'))+$sep,[StringComparison]::OrdinalIgnoreCase)){
  throw 'Target directory cannot be inside the original Manager repository'
}
if(Test-Path -LiteralPath $target){
  $existing=@(Get-ChildItem -LiteralPath $target -Force | Where-Object {$_.Name -ne '.git'})
  if($existing.Count){throw 'Target must be empty except for the .git directory; protect against stale or private files'}
}else{New-Item -ItemType Directory -Path $target -Force | Out-Null}
$files=@(
 'index.html','config.js','app.js','sw.js','manifest.webmanifest',
 'styles.css','scoreboard.css','scoreboard.js',
 'volleyball-core.js','volleyball-ui.js','volleyball.css','competition-context-catalog.js',
 'tests/manager-test-pwa-safety-20261026.test.cjs',
 '.github/workflows/cc-manager-test-pages.yml'
)
foreach($relative in $files){
  $in=Join-Path $source $relative
  if(-not(Test-Path -LiteralPath $in -PathType Leaf)){throw "Missing whitelisted runtime file: $relative"}
  $to=Join-Path $target $relative
  New-Item -ItemType Directory -Path (Split-Path -Parent $to) -Force | Out-Null
  Copy-Item -LiteralPath $in -Destination $to -Force
}
foreach($directory in @('assets','icons')){
 $from=Join-Path $source $directory
 if(-not(Test-Path $from -PathType Container)){throw "Missing $directory"}
 Copy-Item -LiteralPath $from -Destination (Join-Path $target $directory) -Recurse -Force
}
Set-Content -LiteralPath (Join-Path $target 'README.md') -Encoding UTF8 -Value @'
# CC MANAGER TEST
Isolated demo PWA for the BEAC Club Control manager. Not a live client.
No production database credentials. Dedicated Supabase TEST integration comes only after staging validation.
'@
Write-Output 'PASS: allowlisted Manager TEST static deployment prepared; no original .git, raw protocol archive, historical player data or SQL migrations copied.'
Write-Output $target
