@echo off
title Digital Vault - GitHub One-Click Auto Push
echo ========================================================
echo   DIGITAL VAULT - PUSHING CODE TO GITHUB
echo   Repo: https://github.com/digitalvalut2026-cpu/digitalvalut
echo ========================================================

set "PATH=%LOCALAPPDATA%\NodeJS;%LOCALAPPDATA%\MinGit\cmd;%PATH%"

echo [1/3] Checking Git Status...
git status -s

echo [2/3] Staging and Committing all updates...
git add .
git commit -m "update: automated sync" 2>nul

echo [3/3] Pushing to GitHub (main branch)...
git push -u origin main --force

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ----------------------------------------------------
    echo [NOTE] If GitHub prompts for authentication:
    echo 1. Username: digitalvalut2026-cpu
    echo 2. Password: Enter your GitHub Personal Access Token (PAT)
    echo    (Get a token from: https://github.com/settings/tokens)
    echo ----------------------------------------------------
    pause
) else (
    echo.
    echo ====================================================
    echo SUCCESS! Project successfully pushed to GitHub!
    echo ====================================================
    timeout /t 5
)
