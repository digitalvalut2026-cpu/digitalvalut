@echo off
title Digital Vault - Storefront Launcher
echo Starting Digital Vault Local Web Server...

powershell -Command "if (-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 5173 -InformationLevel Quiet)) { Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -WindowStyle Hidden -File .\server.ps1' }"

timeout /t 1 /nobreak >nul
echo Opening Digital Vault Storefront in browser: http://localhost:5173/index.html
start http://localhost:5173/index.html
exit
