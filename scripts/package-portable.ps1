# Deterministic and robust packaging script for AulaCIM-10 Portable
$ErrorActionPreference = 'Stop'

$src = "C:\Users\Bart\Desktop\proyecto-cim10-das26-27-fhsjd"
$destZip = "C:\Users\Bart\Desktop\AulaCIM-10_DAS26-27_FHSJD_PORTABLE.zip"
$stageDir = Join-Path $env:TEMP "AulaCIM-10_Stage_$(Get-Random)"

try {
    Write-Host "Creating clean staging directory: $stageDir..."
    New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

    # Exclusions for robocopy
    $excludeDirs = @('.git', '.next', 'node_modules', 'data')
    $excludeFiles = @('.session_secret*', 'seed-users.local.json', '*.local.json', '*.db*', '*.zip', 'package-portable.ps1', 'tsconfig.tsbuildinfo', '.env*')

    Write-Host "Copying project files with robocopy..."
    $robocopyArgs = @(
        "`"$src`"",
        "`"$stageDir`"",
        "/E",
        "/XD"
    ) + $excludeDirs + @("/XF") + $excludeFiles + @("/R:1", "/W:1", "/NFL", "/NDL", "/NJH", "/NJS")

    & robocopy $robocopyArgs | Out-Null

    # Ensure empty data folder with .gitkeep exists
    $stageData = Join-Path $stageDir "data"
    New-Item -ItemType Directory -Path $stageData -Force | Out-Null
    Set-Content -Path (Join-Path $stageData ".gitkeep") -Value "# Data directory initialized automatically on first startup`r`n"

    # Remove pre-existing destination zip
    if (Test-Path $destZip) {
        Remove-Item $destZip -Force
    }

    Write-Host "Compressing to $destZip using System.IO.Compression.ZipFile..."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($stageDir, $destZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    if (Test-Path $destZip) {
        $zipItem = Get-Item $destZip
        Write-Host "PORTABLE_ZIP_COMPLETED_SUCCESS"
        Write-Host "Path: $($zipItem.FullName)"
        Write-Host "LengthBytes: $($zipItem.Length)"
        Write-Host "LastWriteTime: $($zipItem.LastWriteTime)"
    } else {
        throw "Failed to create destination zip: $destZip"
    }
}
finally {
    if (Test-Path $stageDir) {
        Write-Host "Cleaning up staging directory: $stageDir..."
        Remove-Item -Path $stageDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
