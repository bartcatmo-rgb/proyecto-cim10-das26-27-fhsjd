@echo off
setlocal EnableExtensions EnableDelayedExpansion
title AulaCIM-10 - Arranque Local Autónomo (FHSJD DAS 26/27)
cls

echo ====================================================================
echo   AulaCIM-10 - FHSJD (DAS 26/27) - Arranque Local Portable
echo   Codificacion Clinica CIM-10 - MEAP (Offline / Autocontenido)
echo ====================================================================
echo.

:: 1. Priorizar runtime portable de Node.js en .\runtime\node si existe
if exist "%~dp0runtime\node\node.exe" (
    set "PATH=%~dp0runtime\node;%PATH%"
    set "NODE_CMD=%~dp0runtime\node\node.exe"
    echo [OK] Runtime portable de Node.js detectado en runtime\node\
) else (
    set "NODE_CMD=node"
    where node >nul 2>nul
    if errorlevel 1 (
        echo [ERROR] No se encontro runtime de Node.js en runtime\node\node.exe ni en el sistema.
        echo Por favor, descomprime el paquete completo con su carpeta runtime integrada.
        pause
        exit /b 1
    )
)

:: 2. Asegurar carpeta data local
if not exist "%~dp0data\" (
    mkdir "%~dp0data"
)

:: 3. Generar automaticamente secretos criptograficos locales si no existen
if not exist "%~dp0.session_secret" (
    echo [INFO] Inicializando secretos criptograficos locales seguros (AES-256 / HMAC)...
    "%NODE_CMD%" -e "const c=require('crypto'); const fs=require('fs'); fs.writeFileSync('.session_secret', c.randomBytes(64).toString('hex'));"
)

:: 4. Buscar puerto TCP libre a partir del 3000
set TARGET_PORT=3000
for /L %%P in (3000,1,3099) do (
    netstat -ano -p tcp | findstr /R /C:":%%P .*LISTENING" >nul 2>nul
    if errorlevel 1 (
        set TARGET_PORT=%%P
        goto :PORT_READY
    )
)

:PORT_READY
echo [OK] Puerto asignado: %TARGET_PORT%
echo.
echo ====================================================================
echo   INICIANDO AULACIM-10 EN: http://localhost:%TARGET_PORT%
echo --------------------------------------------------------------------
echo   Para cerrar la aplicacion, cierra esta ventana o presiona Ctrl + C
echo ====================================================================
echo.

:: Abrir navegador automaticamente tras 2 segundos
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:%TARGET_PORT%"

:: Iniciar Next.js
if exist "%~dp0node_modules\next\dist\bin\next" (
    "%NODE_CMD%" "%~dp0node_modules\next\dist\bin\next" start -p %TARGET_PORT%
) else (
    npx next start -p %TARGET_PORT%
)
