# Club Control private schema export — Windows PowerShell 7
# The only remote operation in this script is the SCHEMA-ONLY Supabase CLI db dump.
# Never puts the dump or database credentials in GitHub, CI, or the chat.
param(
  [switch]$SelfTest,
  [string]$PrivateDirectory = '',
  [string]$ProjectRef = 'snqsxlyhontaepembaic'
)
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$RepoRoot=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if([string]::IsNullOrWhiteSpace($PrivateDirectory)){
  $base=if($env:LOCALAPPDATA){$env:LOCALAPPDATA}else{Join-Path $HOME '.local'}
  $PrivateDirectory=Join-Path $base 'ClubControl\PrivateSchema'
}
$PrivateDirectory=[System.IO.Path]::GetFullPath($PrivateDirectory)
function Assert-OutsideRepo([string]$Candidate){
  $repoPrefix=$RepoRoot.TrimEnd([char[]]@('\','/'))+[System.IO.Path]::DirectorySeparatorChar
  $value=[System.IO.Path]::GetFullPath($Candidate)
  if($value.Equals($RepoRoot,[StringComparison]::OrdinalIgnoreCase) -or
     $value.StartsWith($repoPrefix,[StringComparison]::OrdinalIgnoreCase)){
    throw 'Refusing to store schema inside the Git repository.'
  }
}
Assert-OutsideRepo $PrivateDirectory
if($SelfTest){
  $blocked=$false
  try { Assert-OutsideRepo $RepoRoot } catch { $blocked=$true }
  if(-not $blocked){throw 'Safety test failed: repository path was allowed'}
  if($ProjectRef -ne 'snqsxlyhontaepembaic'){throw 'Unexpected project reference'}
  Write-Output 'PASS: output path isolated, test ran with no database or Docker calls.'
  return
}
if($ProjectRef -ne 'snqsxlyhontaepembaic'){
  throw 'This reviewed export tool only supports the known Club Control project.'
}
foreach($binary in @('supabase','docker')){
  if(-not (Get-Command $binary -ErrorAction SilentlyContinue)){
    throw "$binary is required; install/configure it before running this local export."
  }
}
& docker info --format '{{.ServerVersion}}' | Out-Null
if($LASTEXITCODE -ne 0){throw 'Docker engine is not running'}
$workspace=Join-Path $PrivateDirectory '_supabase_cli_workspace'
$outDir=Join-Path $PrivateDirectory 'snapshots'
New-Item -ItemType Directory -Path $workspace,$outDir -Force | Out-Null
$stamp=Get-Date -Format 'yyyyMMdd_HHmmss'
$suffix=[guid]::NewGuid().ToString('N').Substring(0,8)
$output=Join-Path $outDir "cc_schema_only_${stamp}_${suffix}.sql"
$manifest=Join-Path $outDir "cc_schema_only_${stamp}_${suffix}.json"
Push-Location $workspace
try{
  if(-not (Test-Path 'supabase/config.toml')){
    & supabase init --yes
    if($LASTEXITCODE -ne 0){throw 'Supabase CLI local workspace init failed'}
  }
  # Login via 'supabase login' on your OWN device first.
  # No DB password/URL/JWT/PAT is embedded in this script or shown as a CLI flag.
  & supabase link --project-ref $ProjectRef
  if($LASTEXITCODE -ne 0){throw 'Supabase link failed. Do not send credentials to chat.'}
  # Safe API: no db pull/push/reset, migration repair, --data-only, or --role-only.
  & supabase db dump --linked --schema public,private --file $output
  if($LASTEXITCODE -ne 0){throw 'Supabase schema-only dump failed'}
  if(-not(Test-Path $output)){throw 'Schema-only file was not created'}
  $item=Get-Item $output
  if($item.Length -lt 1000){throw 'Unexpectedly small schema-only export'}
  $hash=(Get-FileHash -Path $output -Algorithm SHA256).Hash
  [ordered]@{
    project_ref=$ProjectRef
    schemas=@('public','private')
    data_included=$false
    roles_included=$false
    source_command='supabase db dump --linked --schema public,private --file <private-local-path>'
    captured_utc=(Get-Date).ToUniversalTime().ToString('o')
    bytes=$item.Length
    sha256=$hash
  } | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $manifest -Encoding UTF8
  Write-Output "PRIVATE export saved outside the repository. Size: $($item.Length) bytes; SHA256: $hash"
  Write-Output "Schema: $output"
  Write-Output "Manifest: $manifest"
  Write-Output 'REVIEW functions for embedded constants before sharing or committing; schema is not a data backup.'
}catch{
  if(Test-Path $output){Remove-Item -LiteralPath $output -Force}
  if(Test-Path $manifest){Remove-Item -LiteralPath $manifest -Force}
  throw
}finally{Pop-Location}
