@echo off
setlocal
cd /d "%~dp0"
set "GECKOGENETICS_NODE=node"
where node >nul 2>&1
if errorlevel 1 (
  if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" (
    set "GECKOGENETICS_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  ) else (
    echo Node.js is required. Install Node.js 24 LTS from https://nodejs.org/ and try again.
    pause
    exit /b 1
  )
)
if /I "%~1"=="--no-open" (
  "%GECKOGENETICS_NODE%" "%~dp0scripts\start-preview.mjs"
) else (
  "%GECKOGENETICS_NODE%" "%~dp0scripts\start-preview.mjs" --open
)
if errorlevel 1 pause
