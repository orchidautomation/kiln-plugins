# Load environment variables for Windows
# PowerShell version of load-env.sh

$ProjectDir = if ($env:CLAUDE_PROJECT_DIR) { $env:CLAUDE_PROJECT_DIR } else { Get-Location }
$EnvFile = Join-Path $ProjectDir ".env"

if (Test-Path $EnvFile) {
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }

    if ($env:FATHOM_API_KEY) {
        if ($env:CLAUDE_ENV_FILE) {
            Add-Content -Path $env:CLAUDE_ENV_FILE -Value "`$env:FATHOM_API_KEY = `"$env:FATHOM_API_KEY`""
        }
        Write-Host "Environment loaded (FATHOM_API_KEY set)"
    } else {
        Write-Host "Environment loaded"
    }
} else {
    Write-Host "Warning: .env not found at $EnvFile"
}

exit 0
