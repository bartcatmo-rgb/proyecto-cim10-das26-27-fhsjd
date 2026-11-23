# Deterministic Standalone Portable Packaging Script for Classroom / College PCs
# Generates: C:\Users\Bart\Desktop\AulaCIM-10_DAS26-27_FHSJD_COLEGIO_PORTABLE.zip
$ErrorActionPreference = 'Stop'

$src = "C:\Users\Bart\Desktop\proyecto-cim10-das26-27-fhsjd"
$destZip = "C:\Users\Bart\Desktop\AulaCIM-10_DAS26-27_FHSJD_COLEGIO_PORTABLE.zip"
$stageDir = Join-Path $env:TEMP "AulaCIM-10_ColegioStage_$(Get-Random)"

try {
    Write-Host "Creating clean staging directory: $stageDir..."
    New-Item -ItemType Directory -Path $stageDir -Force | Out-Null

    # Exclusions for robocopy (Include node_modules, .next and runtime\node)
    $excludeDirs = @('.git', 'data')
    $excludeFiles = @('.session_secret*', 'seed-users.local.json', '*.local.json', '*.db*', '*.zip', 'build-standalone-zip.ps1', 'package-portable.ps1', 'tsconfig.tsbuildinfo', '.env*')

    Write-Host "Copying project files, dependencies and build with robocopy..."
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

    # Verify critical components exist in stage before compressing
    $crit1 = Test-Path (Join-Path $stageDir "runtime\node\node.exe")
    $crit2 = Test-Path (Join-Path $stageDir "node_modules\next\dist\bin\next")
    $crit3 = Test-Path (Join-Path $stageDir ".next\BUILD_ID")

    if (-not ($crit1 -and $crit2 -and $crit3)) {
        throw "Validation failed in staging directory. Missing components: runtime\node\node.exe: $crit1, next bin: $crit2, BUILD_ID: $crit3"
    }

    # Remove pre-existing destination zip
    if (Test-Path $destZip) {
        Write-Host "Removing existing zip: $destZip..."
        Remove-Item $destZip -Force
    }

    Write-Host "Compressing to $destZip using System.IO.Compression.ZipFile..."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::CreateFromDirectory($stageDir, $destZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    if (Test-Path $destZip) {
        $zipItem = Get-Item $destZip
        Write-Host "STANDALONE_COLEGIO_ZIP_COMPLETED_SUCCESS"
        Write-Host "Path: $($zipItem.FullName)"
        Write-Host "LengthBytes: $($zipItem.Length)"
        Write-Host "LengthMB: $([Math]::Round($zipItem.Length / 1MB, 2)) MB"
        Write-Host "LastWriteTime: $($zipItem.LastWriteTime)"
    } else {
        throw "Failed to create standalone destination zip: $destZip"
    }
}
finally {
    if (Test-Path $stageDir) {
        Write-Host "Cleaning up staging directory: $stageDir..."
        Remove-Item -Path $stageDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}
