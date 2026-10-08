# Starts backend and website in 2 new windows, then opens the browser.
$root = Split-Path -Parent $PSScriptRoot
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\worker'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\frontend'; npm run dev"
Start-Sleep -Seconds 8
Start-Process "http://localhost:5173"
