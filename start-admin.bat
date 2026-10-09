@echo off
title Digital Vault - Admin Console Launcher
echo Starting Digital Vault Local Web Server...

powershell -Command "if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet)) { Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -WindowStyle Hidden -File .\server.ps1' }"

timeout /t 1 /nobreak >nul
echo Opening Admin Console in browser: http://localhost:5173/admin.html
start http://localhost:5173/admin.html
exit
