# AulaCIM-10 · FHSJD (DAS 26/27)
## Manual de Arquitectura Técnica, Infraestructura y Operaciones IT
**Guía para Administradores de Sistemas, Departamentos de Informática y Responsables de Seguridad**  
*Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares · Curso 2026/2027*

---

### 1. Resumen Ejecutivo de la Arquitectura
**AulaCIM-10** es una aplicación web full-stack de alto rendimiento construida con una arquitectura de dos modalidades complementarias:
1. **Modo Cloud en Producción:** Desplegada en la plataforma Vercel sobre la región soberana europea `cdg1` (París, Francia).
2. **Modo Portable Offline de Aula:** Ejecutable en ordenadores locales de aula o salas de ordenadores sin conexión a internet ni privilegios de administrador.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   AULACIM-10 · STACK TECNOLÓGICO                       │
├────────────────────────────────┬───────────────────────────────────────┤
│ Frontend / UI                  │ Next.js 15 (App Router), React 19,     │
│                                │ Tailwind CSS, Lucide Icons            │
├────────────────────────────────┼───────────────────────────────────────┤
│ Backend / APIs                 │ Route Handlers de Next.js, TypeScript  │
│                                │ estricto, Zod, Crypto nativo de Node  │
├────────────────────────────────┼───────────────────────────────────────┤
│ Base de Datos                  │ SQLite 3 (`better-sqlite3`), modo WAL, │
│                                │ Cifrado de campo AES-256-GCM + HMAC   │
├────────────────────────────────┼───────────────────────────────────────┤
│ Soberanía y Despliegue         │ Vercel UE (`cdg1` París) / Local LAN   │
└────────────────────────────────┴───────────────────────────────────────┘
```

---

### 2. Motor de Base de Datos y Cifrado BancActiu Zero-Trust
Para aunar la máxima velocidad de lectura de catálogos clínicos con un estándar bancario de protección de datos:

1. **Configuración del Motor SQLite (`better-sqlite3`):**
   - **Modo WAL:** `PRAGMA journal_mode = WAL;` (permite lecturas concurrentes sin bloquear escrituras).
   - **Sincronización:** `PRAGMA synchronous = NORMAL;` (equilibrio óptimo entre velocidad y durabilidad contra cortes eléctricos).
   - **Integridad Referencial:** `PRAGMA foreign_keys = ON;` (evita registros huérfanos en cascada).
   - **Caché en Memoria:** `PRAGMA cache_size = -64000;` (64 MB de memoria caché asignada).
2. **Cifrado de Campos Sensibles en Reposo:**
   - Todos los identificadores personales (DNI, NIE, teléfono) se cifran mediante **`AES-256-GCM`**.
   - Cada dato cifrado genera un vector de inicialización (`IV`) único de 12 bytes y una etiqueta de autenticación (`AuthTag`) de 16 bytes que previene cualquier manipulación en reposo.
3. **Índice Ciego Determinista (`Blind Index`):**
   - Para permitir búsquedas rápidas por DNI sin desencriptar toda la tabla ni almacenar el documento en claro, el sistema genera un hash criptográfico mediante **`HMAC-SHA256`** sobre el DNI normalizado usando una sal secreta independiente.
   - De este modo, la consulta `WHERE dni_bindex = ?` se ejecuta de forma instantánea sin exponer el documento real.

---

### 3. Despliegue Cloud en Vercel (Producción)
La versión online (`https://proyecto-cim10-das26-27-fhsjd.vercel.app`) opera como un cluster serverless optimizado:

1. **Variables de Entorno Críticas:**
   ```env
   # Clave maestra para la firma de tokens de sesión JWT
   SESSION_SECRET="<clave_criptografica_aleatoria_minimo_64_caracteres>"

   # Clave simétrica de 256 bits para cifrado de campos de usuario en BD
   DATA_ENCRYPTION_KEY="<hex_32_bytes_para_aes_256_gcm>"

   # Clave secreta para el cálculo de índices ciegos HMAC
   BLIND_INDEX_SECRET="<hex_32_bytes_para_hmac_sha256>"

   # Opcional: Configuración de Alertas Gratuitas de Intrusión (Sin SMS)
   ALERT_EMAIL_FROM="soc-aulacim10@fhsjd.edu.es"
   ALERT_EMAIL_TO="seguridad-informatica@fhsjd.edu.es"
   ALERT_SMTP_HOST="smtp.proveedor-educativo.es"
   ALERT_SMTP_PORT="587"
   ALERT_SMTP_USER="usuario-smtp"
   ALERT_SMTP_PASS="clave-smtp"

   # Opcional: Telegram Bot Push
   TELEGRAM_BOT_TOKEN="<bot_token_telegram>"
   TELEGRAM_CHAT_ID="<chat_id_grupo_it>"
   ```
2. **Gestión de Persistencia en Entorno Serverless:**
   - En Vercel, el sistema de archivos es efímero salvo en `/tmp`.
   - La capa de datos (`src/lib/db/index.ts`) detecta automáticamente el entorno de ejecución (`process.env.VERCEL === '1'`).
   - Si no existe persistencia montada, inicializa la base de datos en `/tmp/aulacim10.db` a partir de las semillas maestras (`seed.ts`, `seed-meap-100.ts`, `seed-reverse-coding.ts`), garantizando que la aplicación responda con `200 OK` en cualquier despliegue de Vercel.
3. **Gobernanza RGPD y Rol de Encargado de Tratamiento:**
   - La infraestructura física se aloja en el centro de datos de Vercel en **París (región `cdg1`, Unión Europea)**.
   - Vercel actúa formalmente como **Encargado del Tratamiento (Art. 28 RGPD)** bajo el Data Processing Addendum (DPA) con Cláusulas Contractuales Tipo.
   - El centro educativo actúa como **Responsable del Tratamiento**, manteniendo la custodia exclusiva de las claves de cifrado.

---

### 4. Despliegue Portable Offline en Aulas (Sin Instalación)
Para aulas de informática de institutos donde los ordenadores no tienen acceso libre a internet, o donde existe software de congelación de disco (p. ej. *Deep Freeze*):

1. **Estructura del Paquete `AulaCIM-10_DAS26-27_FHSJD_COLEGIO_PORTABLE.zip`:**
   - **`runtime/node/node.exe`:** Binario ejecutable de Node.js portable (v24.x/22.x LTS x64) incluido dentro del propio paquete. No requiere que el ordenador tenga Node.js instalado ni permisos de administrador.
   - **`node_modules/`:** Dependencias compiladas previamente con los binarios nativos de `better-sqlite3` para Windows x64.
   - **`.next/`:** Build de producción ya compilado, optimizado para arranque inmediato.
   - **`AulaCIM-10-Launcher.exe`:** Lanzador nativo de Windows compilado en C# / .NET 4.8.
   - **`INICIAR-AULACIM10.bat`:** Script por lotes con autodiagnóstico.
2. **Ciclo de Arranque Autónomo de `INICIAR-AULACIM10.bat`:**
   - Detecta la presencia de `runtime\node\node.exe`.
   - Comprueba si existe el archivo `.session_secret`. Si no existe, genera automáticamente un secreto criptográfico local aleatorio de 64 caracteres.
   - Escanea los puertos a partir del `3000` mediante PowerShell para seleccionar el primer puerto libre (evitando conflictos con otros programas del aula).
   - Inicia el servidor Next.js en segundo plano mediante `node.exe` y abre de forma sincronizada el navegador predeterminado del alumno en `http://localhost:<PUERTO>`.
3. **Modo Red Local de Aula (`start-lan.bat`):**
   - Si se desea ejecutar un único servidor en el PC del profesor y que los alumnos se conecten desde sus puestos:
   - Ejecutar `start-lan.bat`. El script obtiene la dirección IP local del aula (p. ej. `192.168.1.50`) y levanta el servicio escuchando en `0.0.0.0:3000`.
   - Los alumnos abren su navegador y se conectan a `http://192.168.1.50:3000`.

---

### 5. Guía de Auditoría y Verificación de Integridad
Antes de desplegar el paquete en memorias USB o distribuirlo por la red del centro, los técnicos de informática pueden ejecutar:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify-standalone-zip.ps1
```
Este script audita el archivo comprimido confirmando:
- **0 elementos prohibidos:** Verificación estricta de ausencia de archivos de entorno `.env*`, bases de datos con usuarios reales, secretos o claves de sesión.
- **Presencia de los 9 componentes esenciales de arranque.**
