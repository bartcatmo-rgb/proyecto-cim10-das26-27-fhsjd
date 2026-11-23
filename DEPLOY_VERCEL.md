# Guía de Despliegue en GitHub y Vercel · AulaCIM-10 · FHSJD (DAS 26/27)

Esta guía documenta la configuración paso a paso para publicar el proyecto **AulaCIM-10 · FHSJD (DAS 26/27)** en **GitHub** y desplegarlo en **Vercel** manteniendo el blindaje de seguridad, sesiones persistentes y carga segura de usuarios sin exponer datos personales (PII) en el repositorio.

---

## 1. Conexión y Subida al Repositorio GitHub

1. Inicializa o verifica el repositorio local:
   ```bash
   git status
   ```
2. Asegúrate de que los archivos locales ignorados sigan excluidos (`.session_secret`, `seed-users.local.json`, `data/*.db*`, `.env*`, etc.).
3. Añade los cambios y realiza el commit inicial o de actualización:
   ```bash
   git add .
   git commit -m "feat: preparar proyecto para despliegue en Vercel con soporte dual SQLite y carga segura"
   ```
4. Conecta tu repositorio remoto en GitHub y haz push:
   ```bash
   git remote add origin https://github.com/tu-usuario/proyecto-cim10-das26-27-fhsjd.git
   git branch -M main
   git push -u origin main
   ```

---

## 2. Configuración del Proyecto en Vercel

1. Entra en tu panel de [Vercel](https://vercel.com) y pulsa **Add New... > Project**.
2. Importa el repositorio `proyecto-cim10-das26-27-fhsjd`.
3. Framework Preset: **Next.js** (detectado automáticamente).
4. Root Directory: `./` (raíz).

---

## 3. Variables de Entorno en Vercel (`Environment Variables`)

Pega las siguientes variables en la sección **Settings > Environment Variables** de tu proyecto en Vercel:

| Variable | Valor Recomendado / Descripción | Requerido |
| :--- | :--- | :---: |
| `SESSION_SECRET` | Cadena aleatoria de al menos 64 caracteres hex (ej. `openssl rand -hex 32`) para firmar cookies sin invalidar sesiones entre invocaciones serverless. | **SÍ** |
| `NEXT_PUBLIC_APP_ENV_LABEL` | `Entorno Educativo · AulaCIM-10 FHSJD` (muestra el banner superior oficial) | Opcional |
| `ADMIN_DEFAULT_PASSWORD` | Contraseña robusta para el usuario `Admin` (evita forzar cambio en primer acceso en la nube). | Opcional |
| `SEED_USERS_JSON` | JSON con la cuenta dual de la alumna y usuarios docentes (sin subir a GitHub). | Opcional (Recomendado) |

### Ejemplo exacto para `SEED_USERS_JSON`:
```json
{
  "daughter": {
    "username": "alicia",
    "password": "TuPasswordRobusto2026!",
    "fullName": "Alicia",
    "dniNie": "48069899Z",
    "email": "alicia.estudiante@centro.local",
    "phone": "600000000",
    "academicGroup": "DAS 26/27 - Grupo A",
    "courseId": "DAS-26-27",
    "canSwitchRole": true,
    "mustChangePassword": false
  }
}
```

---

## 4. Persistencia de Datos en Vercel vs. Modo Aula Local/USB

- **Modo Servidor en Aula / Pendrive USB**:
  - Utiliza SQLite nativo en `./data/cim10_centro.db` en modo `WAL` con transacciones atómicas garantizadas en disco.
- **Modo Serverless en Vercel (Demo / Evaluación Online)**:
  - Si no se define un backend externo, la aplicación se inicializa automáticamente en `/tmp/cim10_centro.db` garantizando que no se produzcan errores de permisos de solo lectura.
  - Las contraseñas actualizadas quedan marcadas con `must_change_password = 0`, evitando bucles de cambio en cada inicio de sesión.
  - Para persistencia serverless distribuida a largo plazo, la arquitectura está preparada para conectarse a SQLite remoto (vía Turso / LibSQL mediante `SQLITE_DB_PATH` o variables compatibles).

---

## 5. Verificación del Despliegue

Una vez completado el despliegue en Vercel:
1. Accede a tu dominio asignado (ej. `https://aulacim10-fhsjd.vercel.app`).
2. Verifica que el banner superior `Entorno Educativo · AulaCIM-10 FHSJD` se muestre correctamente.
3. Inicia sesión con la cuenta de docente (`profesor` / `Profesor2026!`), administrador (`Admin`) o la cuenta dual (`alicia`).
4. Comprueba la navegación fluida y las rutas de simulación y catálogo clínico CIM-10.
