# Deploys the Worker (needs: npx wrangler login done once).
$root = Split-Path -Parent $PSScriptRoot
Set-Location "$root\worker"
npx wrangler deploy
