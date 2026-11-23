#!/usr/bin/env bash
# ====================================================================
#   AulaCIM-10 · FHSJD (DAS 26/27) - Servidor de Aula Local (LAN)
#   Codificación clínica CIM-10 · MEAP y seguimiento por niveles
# ====================================================================

set -e

echo "===================================================================="
echo "  AulaCIM-10 · FHSJD (DAS 26/27) - Servidor de Aula Local (LAN)"
echo "===================================================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado en este sistema."
    echo "Por favor instala Node.js (v18+) para continuar."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Instalando dependencias de la aplicación..."
    npm install
fi

if [ ! -d ".next" ]; then
    echo "[INFO] Compilando la aplicación para producción..."
    npm run build
fi

# Detección de puerto libre (3000..3099)
TARGET_PORT=3000
for port in $(seq 3000 3099); do
    if ! (ss -tuln 2>/dev/null || netstat -tuln 2>/dev/null || lsof -i :"$port" 2>/dev/null) | grep -q ":$port "; then
        TARGET_PORT=$port
        break
    fi
done

LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip route get 1.1.1.1 2>/dev/null | awk '{print $7}' || echo "127.0.0.1")

echo ""
echo "===================================================================="
echo "  SERVIDOR LAN LISTO - PUERTO SELECCIONADO: ${TARGET_PORT}"
echo "--------------------------------------------------------------------"
echo "  [PC Docente / Local]: http://localhost:${TARGET_PORT}"
echo "  [Alumnos en el Aula]: http://${LAN_IP}:${TARGET_PORT}"
echo ""
echo "  Presiona Ctrl + C para detener el servidor."
echo "===================================================================="
echo ""

npx next start -H 0.0.0.0 -p "${TARGET_PORT}"
