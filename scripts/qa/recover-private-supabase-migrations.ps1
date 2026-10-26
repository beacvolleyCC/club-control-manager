# Club Control: recovery of EXISTING, recorded Supabase migration SQL.
# READ-ONLY database access via 'supabase migration fetch --linked'.
# Files remain under the private local user folder; never commit raw SQL automatically.
param([switch]$SelfTest,[string]$PrivateDirectory='')
Set-StrictMode -Version Latest
$ErrorActionPreference='Stop'
$RepoRoot=[System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if([string]::IsNullOrWhiteSpace($PrivateDirectory)){
  $base=if($env:LOCALAPPDATA){$env:LOCALAPPDATA}else{Join-Path $HOME '.local'}
  $PrivateDirectory=Join-Path $base 'ClubControl\PrivateSchema'
}
$PrivateDirectory=[System.IO.Path]::GetFullPath($PrivateDirectory)
$repoPrefix=$RepoRoot.TrimEnd([char[]]@('\','/'))+[System.IO.Path]::DirectorySeparatorChar
if($PrivateDirectory.Equals($RepoRoot,[StringComparison]::OrdinalIgnoreCase) -or
   $PrivateDirectory.StartsWith($repoPrefix,[StringComparison]::OrdinalIgnoreCase)){
  throw 'Refusing to recover migration SQL inside the Git repository.'
}
$metadataPath=Join-Path $RepoRoot 'data/qa/supabase-migration-history-20261026.json'
$metadata=Get-Content -LiteralPath $metadataPath -Raw | ConvertFrom-Json
$expected=@($metadata.migrations | ForEach-Object { [string]$_.version } | Sort-Object)
if($expected.Count -ne 31 -or @($expected | Select-Object -Unique).Count -ne 31){
 throw 'Migration metadata preflight failed: expected 31 unique versions.'
}
if($SelfTest){
  if($expected[0] -ne '20261010154944' -or $expected[-1] -ne '20261021113057'){
    throw 'Migration metadata revision mismatch.'
  }
  Write-Output 'PASS: only local metadata reviewed, no Supabase/database tools invoked.'
  return
}
if(-not(Get-Command supabase -ErrorAction SilentlyContinue)){
 throw 'Supabase CLI is required; run supabase login on your own device.'
}
$workspace=Join-Path $PrivateDirectory '_supabase_cli_workspace'
New-Item -ItemType Directory -Path $workspace -Force | Out-Null
Push-Location $workspace
try{
  if(-not(Test-Path 'supabase/config.toml')){
    & supabase init --yes
    if($LASTEXITCODE -ne 0){throw 'Supabase CLI workspace init failed'}
  }
  & supabase link --project-ref snqsxlyhontaepembaic
  if($LASTEXITCODE -ne 0){throw 'Supabase project link failed'}
  # This fetches existing migration SQL FROM the remote history to private local files.
  # No db push / db pull / reset / repair / DDL is executed.
  & supabase migration fetch --linked
  if($LASTEXITCODE -ne 0){throw 'Remote migration SQL fetch failed'}
  $files=@(Get-ChildItem -Path 'supabase/migrations' -Filter '*.sql' -File)
  $actual=@($files | ForEach-Object { if($_.Name -match '^(\d{14})_'){ $Matches[1] }else{ throw 'Unexpected fetched filename' } } | Sort-Object)
  if($actual.Count -ne $expected.Count){throw "Expected $($expected.Count) SQL files, got $($actual.Count)."}
  for($i=0;$i -lt $expected.Count;$i++){
    if($actual[$i] -ne $expected[$i]){throw "Migration version mismatch at item $i"}
  }
  if(@($files | Where-Object {$_.Length -eq 0}).Count -gt 0){throw 'At least one fetched migration file is empty'}
  Write-Output "PASS: $($actual.Count) remote migration SQL files recovered in PRIVATE workspace."
  Write-Output "Local: $(Join-Path $workspace 'supabase/migrations')"
  Write-Output 'Review every SQL for literals, seed data or secrets before any Git commit or staging replay.'
}catch{
  throw
}finally{Pop-Location}
