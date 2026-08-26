Write-Host "=== HoneyChain START — resume from last checkpoint ===" -ForegroundColor Yellow
Set-Location $PSScriptRoot
git pull --rebase 2>$null
Write-Host "[1/4] Postgres" -ForegroundColor Cyan; docker compose -f teamvibranium2026/honeychain/docker-compose.yml up -d postgres; Start-Sleep 2
Write-Host "[2/4] AI" -ForegroundColor Cyan; Start-Job -Name hc-ai -ScriptBlock { Set-Location "$using:PSScriptRoot/teamvibranium2026/honeychain/ai"; python -m uvicorn main:app --port 8001 } | Out-Null
Write-Host "[3/4] API" -ForegroundColor Cyan; Start-Job -Name hc-api -ScriptBlock { Set-Location "$using:PSScriptRoot/teamvibranium2026/honeychain/api"; npm start } | Out-Null
Write-Host "[4/4] WEB" -ForegroundColor Cyan; Start-Job -Name hc-web -ScriptBlock { Set-Location "$using:PSScriptRoot/teamvibranium2026/honeychain/web"; npm run dev } | Out-Null
Start-Sleep 3
Write-Host "`nRun: http://127.0.0.1:5173/ (Home video)  http://127.0.0.1:8080/HoneyChain_SIH26021_PPT_6slides.html (PPT)  http://127.0.0.1:3000/health (API)" -ForegroundColor Green
Get-Job | Format-Table Name, State
Write-Host "Tracker: teamvibranium2026/honeychain/PROGRESS.md  Tech: TECHNICAL.md  Flow: PS1_SIH26021_HoneyChain/14_DETAILED_FLOW_V2.md" -ForegroundColor DarkGray
