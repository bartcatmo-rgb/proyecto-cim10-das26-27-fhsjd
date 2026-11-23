# Build script for native AulaCIM-10-Launcher.exe using .NET csc.exe compiler
$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectDir = Resolve-Path (Join-Path $scriptDir "..")
$outputExe = Join-Path $projectDir "AulaCIM-10-Launcher.exe"
$sourceFile = Join-Path $scriptDir "launcher-src.cs"

$cscCandidates = @(
    "$env:SystemRoot\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
    "$env:SystemRoot\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)

$cscPath = $null
foreach ($path in $cscCandidates) {
    if (Test-Path $path) {
        $cscPath = $path
        break
    }
}

if (-not $cscPath) {
    throw "No se encontró el compilador csc.exe en el sistema."
}

Write-Host "Compilando AulaCIM-10-Launcher.exe con $cscPath..."
$cmd = "& `"$cscPath`" /target:winexe /out:`"$outputExe`" /r:System.dll,System.Drawing.dll,System.Windows.Forms.dll,System.IO.Compression.dll,System.IO.Compression.FileSystem.dll `"$sourceFile`""
Invoke-Expression $cmd

if (Test-Path $outputExe) {
    $item = Get-Item $outputExe
    Write-Host "LAUNCHER_BUILT_SUCCESS: $($item.FullName) ($($item.Length) bytes)"
} else {
    throw "Error al compilar el ejecutable AulaCIM-10-Launcher.exe"
}
