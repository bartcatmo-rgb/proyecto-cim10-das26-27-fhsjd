# Manual de Despliegue Portable en USB y Red Local (LAN)
## AulaCIM-10 · FHSJD (DAS 26/27)
### Instituto FHSJD · Aulas de Informática y Documentación Sanitaria

Esta guía técnica está diseñada para arrancar la plataforma en los ordenadores del aula utilizando una memoria USB, sin depender de conexión a internet y permitiendo que todos los alumnos del aula se conecten simultáneamente al equipo docente.

---

### Requisitos del Sistema
1. **Memoria USB**: Al menos 1 GB de espacio libre formateada en NTFS o exFAT.
2. **Equipo Docente (Servidor Local)**:
   - Sistema Operativo: Windows 10/11 o Linux.
   - Node.js instalado (v18.x, v20.x o superior) con npm.
3. **Equipos de Alumnos (Clientes)**:
   - Navegador web moderno (Chrome, Edge, Firefox o Safari).
   - Conectados a la misma red local (cableada o Wi-Fi del centro).

---

### Estructura del Paquete Portable
El archivo `AulaCIM-10_DAS26-27_FHSJD_PORTABLE.zip` contiene:
- `src/`: Código fuente de la aplicación en Next.js App Router y TypeScript.
- `data/cim10_centro.db`: Base de datos SQLite persistente con las tablas, catálogo CIM-10 y banco de 100 casos MEAP.
- `start-lan.bat`: Script de inicio rápido en 1 clic para Windows.
- `start-lan.sh`: Script de inicio para entornos Linux/macOS.
- `package.json`, `tsconfig.json`, `tailwind.config.ts`, etc.

---

### Procedimiento de Instalación y Arranque en 3 Pasos

#### Paso 1: Copiar o descomprimir en el equipo del aula
1. Inserta la memoria USB en el ordenador del docente.
2. Copia la carpeta del proyecto al Escritorio (o ejecútalo directamente desde la unidad USB).

#### Paso 2: Ejecutar el script de arranque en red local
- **En Windows**: Haz doble clic sobre el archivo `start-lan.bat`.
- **En Linux / macOS**: Abre un terminal en la carpeta y escribe:
  ```bash
  chmod +x start-lan.sh
  ./start-lan.sh
  ```

El script realiza automáticamente las siguientes acciones:
1. Comprueba si las dependencias están instaladas. Si es el primer arranque, ejecuta `npm install`.
2. Detecta la dirección IP asignada al ordenador en la red del aula (por ejemplo: `192.168.1.50`).
3. Lanza el servidor en modo LAN escuchando en `0.0.0.0:3000`.
4. Muestra un recuadro claro con la URL a compartir con los alumnos.

#### Paso 3: Conexión de los alumnos
1. El docente proyecta la URL o abre en el proyector la **Pizarra Digital**:
   ```
   http://localhost:3000/pizarra
   ```
2. Los alumnos abren su navegador web en sus respectivos ordenadores e introducen la IP indicada:
   ```
   http://192.168.1.50:3000
   ```
3. Los alumnos inician sesión con sus credenciales o su DNI oficial.

---

### Políticas de Persistencia y Cero Pérdida de Datos
- **Motor SQLite WAL**: La base de datos opera en modo `WAL` (`Write-Ahead Logging`) con `PRAGMA synchronous = FULL` y `PRAGMA foreign_keys = ON`, garantizando integridad ante apagones bruscos.
- **Ruta persistente**: La base de datos se aloja en `./data/cim10_centro.db`, fuera del directorio de compilación `.next`. Reiniciar el servidor o reconstruir la aplicación **nunca borra ni sobrescribe** datos de alumnos, intentos ni notas.
- **Backups antes de apagar**:
  - Desde el panel `/admin` &rarr; pestaña *Persistencia y Backups*, pulsa en *Descargar Copia JSON*.
  - También puedes copiar directamente el archivo `data/cim10_centro.db` a una carpeta de respaldo.

---

### Solución de Problemas Frecuentes (Troubleshooting)

#### 1. Los alumnos no pueden cargar la página (`ERR_CONNECTION_TIMED_OUT`):
- Comprueba que el Firewall de Windows del equipo docente no esté bloqueando el puerto 3000. Al iniciar por primera vez, marca la casilla de **Permitir acceso en redes privadas**.
- Asegúrate de que los ordenadores de los alumnos y el del profesor están en la misma subred o VLAN escolar.

#### 2. Avisos de audio silenciados en la pizarra:
- Los navegadores modernos bloquean el audio automático si el usuario no ha interactuado previamente con la página. Haz un clic en cualquier parte de la pizarra o pulsa el botón del altavoz en la barra superior de `/pizarra`.

#### 3. Apagado seguro al finalizar la jornada:
- En la ventana de la consola del servidor, pulsa `Ctrl + C` para detener el servicio de forma limpia.
- Expulsa la memoria USB de forma segura.

---

### Protocolo de Blindaje para Exámenes: Script PowerShell vs. Navegador Web

#### Por qué el navegador no puede bloquear pendrives por sí solo:
Las aplicaciones web se ejecutan en un sandbox seguro de usuario que por especificación no tiene acceso a llamadas de kernel ni a la pila de controladores (`I/O stack`) del sistema operativo. Por tanto, un navegador web no puede:
1. Impedir físicamente que un estudiante inserte un pendrive y copie archivos desde el explorador de Windows.
2. Interceptar pulsaciones globales de atajos del sistema operativo o capturadores externos (Herramienta Recortes, GameDVR, ShareX).

#### Solución Integral AulaCIM-10:
El sistema combina el control a nivel de sistema operativo y defensas en cliente web:
1. **Script de Control de Aula (`scripts/exam-lockdown.ps1`)**:
   - Ejecutado como Administrador con `-Action Lock`.
   - Modifica el servicio de Windows `USBSTOR` estableciendo `Start = 4` (bloquea el reconocimiento de nuevos pendrives).
   - **Salvaguarda Crítica**: Verifica la letra de la unidad en ejecución (el pendrive docente o disco local) para garantizar que la fuente del proyecto permanezca intacta y montada.
   - Desactiva temporalmente las directivas de captura de pantalla de Windows (`LetAppsCaptureScreen` = 2 y `AllowGameDVR` = 0).
   - Se revierte al finalizar la prueba ejecutando `exam-lockdown.ps1 -Action Unlock` (`USBSTOR = 3`).
2. **Defensas Web Activas en el Cliente**:
   - `select-none` en preguntas y respuestas.
   - Inhabilitación de menú contextual (`onContextMenu preventDefault`).
   - Bloqueo de atajos `Ctrl+C`, `Ctrl+S`, `Ctrl+U`, `Ctrl+P`, `F12` e `ImprPant`.
   - Detección de pérdida de foco (`visibilitychange` / `blur`) con alerta y registro en SQLite `security_audit_logs`.
   - Supresión de claves correctas en los payloads antes de la entrega formal.

