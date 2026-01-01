@echo off
REM Load environment variables for Windows CMD
REM Fallback for systems without PowerShell

set "PROJECT_DIR=%CLAUDE_PROJECT_DIR%"
if "%PROJECT_DIR%"=="" set "PROJECT_DIR=%CD%"

set "ENV_FILE=%PROJECT_DIR%\.env"

if exist "%ENV_FILE%" (
    for /f "usebackq tokens=1,* delims==" %%a in ("%ENV_FILE%") do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
    echo Environment loaded
) else (
    echo Warning: .env not found at %ENV_FILE%
)

exit /b 0
