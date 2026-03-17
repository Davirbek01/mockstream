@echo off
set "URL=https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.41.4-stable.zip"
set "ZIPPATH=%USERPROFILE%\flutter.zip"
set "DESTPATH=%USERPROFILE%"

echo ========================================================
echo Downloading Flutter SDK (1.2 GB)...
echo This will take a while depending on your internet speed.
echo ========================================================
curl.exe -L -o "%ZIPPATH%" "%URL%"

echo.
echo ========================================================
echo Extracting Flutter using tar...
echo This also takes a minute or two...
echo ========================================================
tar.exe -xf "%ZIPPATH%" -C "%DESTPATH%"

echo.
echo Cleaning up zip file...
del "%ZIPPATH%"

echo.
echo Adding Flutter to your User PATH...
powershell -Command "$userPath = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($userPath -notlike '*%USERPROFILE%\flutter\bin*') { [Environment]::SetEnvironmentVariable('Path', $userPath + ';%USERPROFILE%\flutter\bin', 'User') }"

echo.
echo ========================================================
echo ALL DONE! Flutter is now installed at: %USERPROFILE%\flutter\bin
echo. 
echo IMPORTANT NEXT STEPS:
echo 1. Close ALL open windows and restart your computer (or just VS Code/Terminal) so the PATH takes effect.
echo 2. Open a new terminal inside the 'mock_stream_mobile_app' folder.
echo 3. Run:  flutter create .
echo ========================================================
pause
