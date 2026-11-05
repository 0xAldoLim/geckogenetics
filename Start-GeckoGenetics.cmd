@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js is required. Install Node.js 24 LTS from https://nodejs.org/ and try again.
  pause
  exit /b 1
)
node "%~dp0scripts\start-preview.mjs" --open
if errorlevel 1 pause
