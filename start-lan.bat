@echo off
setlocal EnableExtensions EnableDelayedExpansion
title AulaCIM-10 - Servidor Red Local (FHSJD DAS 26/27)
cls

echo ====================================================================
echo   AulaCIM-10 - FHSJD (DAS 26/27) - Servidor de Aula Local (LAN)
echo   Codificacion clinica CIM-10 - MEAP y seguimiento por niveles
echo ====================================================================
echo.

:: 1. Priorizar runtime portable de Node.js en .\runtime\node si existe
if exist "runtime\node\node.exe" (
    set "PATH=%~dp0runtime\node;%PATH%"
    set "NODE_CMD=%~dp0runtime\node\node.exe"
    echo [INFO] Utilizando runtime portable de Node.js integrado en runtime\node\
) else (
    set "NODE_CMD=node"
    where node >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] Node.js no esta instalado ni se encuentra en runtime\node\node.exe.
        echo Por favor, instala Node.js LTS (v18, v20 o v22+) desde https://nodejs.org
        pause
        exit /b 1
    )
)

:: 2. Verificar dependencias
if not exist "node_modules\" (
    echo [INFO] Primera ejecucion detectada. Instalando dependencias necesarias...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Fallo la instalacion de paquetes npm.
        pause
        exit /b 1
    )
)

:: 3. Compilar si no existe .next
if not exist ".next\" (
    echo [INFO] Compilando la aplicacion para produccion...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Fallo la compilacion de produccion.
        pause
        exit /b 1
    )
)

:: 4. Deteccion de puerto TCP libre a partir del 3000
set TARGET_PORT=3000
for /L %%P in (3000,1,3099) do (
    netstat -ano -p tcp | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
    if errorlevel 1 (
        set TARGET_PORT=%%P
        goto :PORT_FOUND
    )
)

:PORT_FOUND

:: 5. Deteccion de IPv4 de red de area local
set LAN_IP=127.0.0.1
for /f "tokens=4" %%a in ('route print 0.0.0.0 ^| findstr "0.0.0.0" ^| findstr /v "127.0.0.1" 2^>nul') do (
    if not "%%a"=="" (
        set LAN_IP=%%a
        goto :IP_FOUND
    )
)

:IP_FOUND
if "%LAN_IP%"=="127.0.0.1" (
    for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /c:"IPv4" 2^>nul') do (
        for /f "tokens=1" %%j in ("%%i") do (
            if not "%%j"=="" (
                set LAN_IP=%%j
                goto :IP_RESOLVED
            )
        )
    )
)

:IP_RESOLVED

:: Deteccion de resolucion y factor de escala de pantalla
for /f "tokens=1,2" %%A in ('powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $s=[System.Windows.Forms.Screen]::PrimaryScreen.Bounds; Write-Output ($s.Width.ToString() + ' ' + $s.Height.ToString())" 2^>nul') do (
    set "DISP_W=%%A"
    set "DISP_H=%%B"
)

echo.
echo ====================================================================
echo   SERVIDOR LAN LISTO - PUERTO SELECCIONADO: %TARGET_PORT%
echo --------------------------------------------------------------------
echo   [PC Docente / Local]: http://localhost:%TARGET_PORT%
echo   [Alumnos en el Aula]: http://%LAN_IP%:%TARGET_PORT%
if defined DISP_W (
echo   [Pantalla Principal]: %DISP_W%x%DISP_H% (Escala adaptativa fluida)
)
echo.
echo   Para detener el servidor presiona Ctrl + C
echo ====================================================================
echo.

if exist "node_modules\next\dist\bin\next" (
    "%NODE_CMD%" node_modules\next\dist\bin\next start -H 0.0.0.0 -p %TARGET_PORT%
) else (
    npx next start -H 0.0.0.0 -p %TARGET_PORT%
)
pause
