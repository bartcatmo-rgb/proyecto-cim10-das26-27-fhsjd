<#
.SYNOPSIS
  Script de Blindaje de Estación de Aula y Control USB para Exámenes
  AulaCIM-10 · FHSJD (DAS 26/27)

.DESCRIPTION
  Permite al docente bloquear o desbloquear la inserción de nuevos dispositivos USB
  y herramientas de captura de pantalla en las estaciones del aula durante exámenes oficiales.
  Incorpora salvaguarda estricta para no desmontar ni alterar la unidad USB donde reside el proyecto.

.PARAMETER Action
  Lock   - Bloquea inserción de nuevos USBs y herramientas de captura (SnippingTool, GameDVR).
  Unlock - Restablece la configuración estándar del sistema operativo.
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory=$false, Position=0)]
    [ValidateSet("Lock", "Unlock")]
    [string]$Action = "Lock"
)

# 1. Comprobación de elevación de privilegios de Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "==========================================================================" -ForegroundColor Red
    Write-Host " [!] ERROR: SE REQUIEREN PRIVILEGIOS DE ADMINISTRADOR" -ForegroundColor Red
    Write-Host " Este script interactúa con directivas del registro de Windows (HKLM)." -ForegroundColor Yellow
    Write-Host " Haz clic derecho sobre PowerShell y selecciona 'Ejecutar como Administrador'." -ForegroundColor Yellow
    Write-Host "==========================================================================" -ForegroundColor Red
    exit 1
}

# 2. Salvaguarda crítica de la unidad de ejecución (USB / Servidor local)
$scriptDrive = (Get-Item $PSScriptRoot).PSDrive.Root
Write-Host "--- AulaCIM-10 · FHSJD · Blindaje de Aula para Examen ---" -ForegroundColor Cyan
Write-Host "[i] Unidad de ejecución del proyecto detectada: $scriptDrive" -ForegroundColor Gray
Write-Host "[i] Salvaguarda activa: La unidad $scriptDrive permanece montada e inalterada." -ForegroundColor Green

if ($Action -eq "Lock") {
    Write-Host "`n[>>>] APLICANDO MODO EXAMEN EN AULA (LOCK)..." -ForegroundColor Yellow

    # A) Inhabilitar nuevos dispositivos de almacenamiento USB (USBSTOR)
    # Start=4 inhabilita nuevos dispositivos sin expulsar el USB actual montado.
    try {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\USBSTOR" -Name "Start" -Value 4 -ErrorAction Stop
        Write-Host "  [OK] Inserción de nuevos dispositivos USB de almacenamiento: BLOQUEADA (USBSTOR=4)." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Advertencia al modificar USBSTOR: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    # B) Inhabilitar Herramientas de Captura y GameDVR
    try {
        $appPrivacyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppPrivacy"
        if (-not (Test-Path $appPrivacyPath)) {
            New-Item -Path $appPrivacyPath -Force | Out-Null
        }
        Set-ItemProperty -Path $appPrivacyPath -Name "LetAppsCaptureScreen" -Value 2 -Type DWord -Force
        Write-Host "  [OK] Directiva de Captura de Pantalla por Aplicaciones: BLOQUEADA." -ForegroundColor Green

        $gameDvrPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"
        if (-not (Test-Path $gameDvrPath)) {
            New-Item -Path $gameDvrPath -Force | Out-Null
        }
        Set-ItemProperty -Path $gameDvrPath -Name "AllowGameDVR" -Value 0 -Type DWord -Force
        Write-Host "  [OK] Grabación y captura de pantalla GameDVR: DESACTIVADA." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Advertencia al configurar directivas de captura: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    Write-Host "`n==========================================================================" -ForegroundColor Green
    Write-Host " [✓] ESTACIÓN BLINDADA CON ÉXITO PARA MODO EXAMEN." -ForegroundColor Green
    Write-Host " Alumnos no podrán conectar pendrives para copiar exámenes ni usar capturas." -ForegroundColor White
    Write-Host " Para restaurar la estación al finalizar el examen, ejecuta:" -ForegroundColor Cyan
    Write-Host " powershell -ExecutionPolicy Bypass -File .\scripts\exam-lockdown.ps1 -Action Unlock" -ForegroundColor Cyan
    Write-Host "==========================================================================" -ForegroundColor Green
}
elseif ($Action -eq "Unlock") {
    Write-Host "`n[<<<] RESTAURANDO MODO NORMAL DE AULA (UNLOCK)..." -ForegroundColor Yellow

    # A) Habilitar almacenamiento masivo USB
    try {
        Set-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Services\USBSTOR" -Name "Start" -Value 3 -ErrorAction Stop
        Write-Host "  [OK] Almacenamiento USB: HABILITADO (USBSTOR=3 - Automático/Bajo demanda)." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Advertencia al restaurar USBSTOR: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    # B) Restaurar herramientas de captura y GameDVR
    try {
        $appPrivacyPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\AppPrivacy"
        if (Test-Path $appPrivacyPath) {
            Remove-ItemProperty -Path $appPrivacyPath -Name "LetAppsCaptureScreen" -ErrorAction SilentlyContinue
        }
        $gameDvrPath = "HKLM:\SOFTWARE\Policies\Microsoft\Windows\GameDVR"
        if (Test-Path $gameDvrPath) {
            Remove-ItemProperty -Path $gameDvrPath -Name "AllowGameDVR" -ErrorAction SilentlyContinue
        }
        Write-Host "  [OK] Directivas de captura y GameDVR: RESTAURADAS a valores predeterminados." -ForegroundColor Green
    } catch {
        Write-Host "  [!] Advertencia al restaurar directivas: $($_.Exception.Message)" -ForegroundColor DarkYellow
    }

    Write-Host "`n==========================================================================" -ForegroundColor Green
    Write-Host " [✓] ESTACIÓN RESTAURADA A SU ESTADO NORMAL DE TRABAJO." -ForegroundColor Green
    Write-Host "==========================================================================" -ForegroundColor Green
}
