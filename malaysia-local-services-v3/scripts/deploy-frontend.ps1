# Builds and deploys the website to Cloudflare Pages (needs: npx wrangler login done once).
$root = Split-Path -Parent $PSScriptRoot
Set-Location "$root\frontend"
npm install
npm run build
npx wrangler pages deploy dist --project-name malaysia-local-services
