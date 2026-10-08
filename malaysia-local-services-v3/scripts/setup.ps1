# One-time setup: installs everything and creates the local database + test passwords.
$root = Split-Path -Parent $PSScriptRoot
Set-Location "$root\worker"
npm install
npm run db:local
if (-not (Test-Path ".dev.vars")) {
  "ADMIN_PASSWORD=test123`nJWT_SECRET=local-secret-local-secret-local-secret" | Out-File -Encoding ascii .dev.vars
}
Set-Location "$root\frontend"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm install
Write-Host "SETUP DONE. Next: scripts\run-local.ps1" -ForegroundColor Green
