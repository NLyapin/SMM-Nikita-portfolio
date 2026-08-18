Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Запуск локального сервера" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Сервер запускается на http://localhost:3000" -ForegroundColor Green
Write-Host ""
Write-Host "Нажмите Ctrl+C для остановки сервера" -ForegroundColor Yellow
Write-Host ""
python -m http.server 3000

