$url = "https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.41.4-stable.zip"
$zipPath = "$env:USERPROFILE\flutter.zip"
$destPath = "$env:USERPROFILE"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Downloading Flutter SDK (1.2 GB)..." -ForegroundColor Yellow
Write-Host "This will take a while depending on your internet speed." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# Download using BitsTransfer for reliability with large files, with a visible progress bar
Import-Module BitsTransfer
Start-BitsTransfer -Source $url -Destination $zipPath

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "Extracting Flutter using PowerShell..." -ForegroundColor Yellow
Write-Host "This is unzipping 30,000+ files, please wait ~5 minutes..." -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

# Robust extraction that handles deep paths better than tar.exe
Expand-Archive -Path $zipPath -DestinationPath $destPath -Force

Write-Host "`nCleaning up zip file..." -ForegroundColor Cyan
Remove-Item $zipPath -Force

Write-Host "`nAdding Flutter to your User PATH..." -ForegroundColor Cyan
$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($userPath -notmatch "$env:USERPROFILE\\flutter\\bin") {
    [Environment]::SetEnvironmentVariable('Path', "$userPath;$env:USERPROFILE\flutter\bin", 'User')
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "ALL DONE! Flutter is now perfectly installed." -ForegroundColor Green
Write-Host "`nIMPORTANT NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Close ALL open VS Code windows so the new PATH takes effect." -ForegroundColor White
Write-Host "2. Re-open VS Code and our chat." -ForegroundColor White
Write-Host "3. Reply back to me saying 'Done!'" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green

Read-Host "Press Enter to exit"
