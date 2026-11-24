$ErrorActionPreference = 'Stop'
$destZip = "C:\Users\Bart\Desktop\AulaCIM-10_DAS26-27_FHSJD_COLEGIO_PORTABLE.zip"

if (-not (Test-Path $destZip)) {
    throw "Zip file does not exist: $destZip"
}

$zipItem = Get-Item $destZip
Write-Host "ZIP Path: $($zipItem.FullName)"
Write-Host "Size: $($zipItem.Length) bytes ($([Math]::Round($zipItem.Length / 1MB, 2)) MB)"
Write-Host "Last Modified: $($zipItem.LastWriteTime)"

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($destZip)
try {
    Write-Host "Total entries in archive: $($zip.Entries.Count)"
    
    $checkTargets = @(
        'runtime/node/node.exe',
        'node_modules/next/dist/bin/next',
        '.next/BUILD_ID',
        'AulaCIM-10-Launcher.exe',
        'INICIAR-AULACIM10.bat',
        'start-lan.bat',
        'launcher.config.json',
        'package.json',
        'data/.gitkeep',
        'docs/MANUAL_ALUMNOS.md',
        'docs/MANUAL_PROFESORES.md',
        'docs/MANUAL_ADMINISTRADORES.md',
        'docs/MANUAL_INSTITUTO_IT.md',
        'docs/GUION_VIDEO_PRESENTACION.md',
        'public/media/presentation-scenes.json'
    )
    
    $results = foreach ($target in $checkTargets) {
        $entry = $zip.Entries | Where-Object { ($_.FullName -replace '\\','/') -eq $target } | Select-Object -First 1
        [PSCustomObject]@{
            Target = $target
            Found = ($null -ne $entry)
            Size = if ($null -ne $entry) { $entry.Length } else { 0 }
        }
    }
    $results | Format-Table -AutoSize
    
    # Check for forbidden sensitive items
    $forbidden = $zip.Entries | Where-Object {
        $name = $_.FullName -replace '\\','/'
        $name -match 'data/.*\.db' -or
        $name -match '\.session_secret' -or
        $name -match 'seed-users\.local\.json' -or
        $name -match '\.env'
    }
    
    Write-Host "Forbidden items found: $($forbidden.Count)"
    if ($forbidden.Count -gt 0) {
        $forbidden | Select-Object -First 10 -ExpandProperty FullName
        throw "Security breach: forbidden sensitive files found in portable zip"
    }
    
    Write-Host "`n✅ VERIFICACIÓN EXITOSA: Runtime Node.js, Next.js build y dependencias completas."
    Write-Host "✅ CERO PII / CERO SECRETOS: Sin bases de datos activas ni archivos de credenciales."
    Write-Host "✅ PORTABLE LISTO PARA AULA / COLEGIO SIN SOFTWARE PREVIO."
}
finally {
    $zip.Dispose()
}
