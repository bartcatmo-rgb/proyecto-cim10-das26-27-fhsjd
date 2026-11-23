# AulaCIM-10 · FHSJD (DAS 26/27)

> **Codificación clínica CIM-10 · MEAP, ámbitos asistenciales y seguimiento por niveles**  
> Plataforma docente oficial para Ciclos Formativos de Grado Superior en **Documentación y Administración Sanitarias (Promoción 2026/2027)**.  
> Fundación Hospital San Juan de Dios (FHSJD).

---

## 1. Identidad y Objetivos de la Aplicación

- **Título oficial**: `AulaCIM-10 · FHSJD (DAS 26/27)`
- **Subtítulo**: `Codificación clínica CIM-10 · MEAP, ámbitos asistenciales y seguimiento por niveles`
- **Repositorio de destino**: `proyecto-cim10-das26-27-fhsjd`
- **Enfoque pedagógico**: Práctica de codificación clínica según el modelo **MEAP** (*Modelo de Examen de Ámbitos Profesionales*), dividido en los 7 ámbitos asistenciales reales de la práctica hospitalaria y ambulatoria:
  1. `Atención Primaria y Comunitaria`: Códigos Z, motivos de consulta, síntomas inespecíficos y cronicidad.
  2. `Urgencias Hospitalarias`: Motivo de urgencia como diagnóstico principal, traumatismos, causas externas (V00-Y99) y 7º carácter.
  3. `Especializada Médica y Hospitalización`: Criterio estricto de Diagnóstico Principal tras estudio vs. Secundarios, comorbilidades y manifestaciones.
  4. `Especializada Quirúrgica y Obstetricia`: Lateralidad anatómica, complicaciones de procedimientos quirúrgicos (T80-T88) y codificación obstétrica.
  5. `Laboratorio y Anatomía Patológica`: Morfología/comportamiento de neoplasias (C00-D49) y microorganismos causales (B95-B97).
  6. `Salud Mental y Neuropsiquiatría`: Capítulo 5 (F01-F99), trastornos por uso de sustancias (regla de no duplicidad abuso/dependencia).
  7. `Simulacro Integral MEAP`: Casos clínicos cruzados de alta complejidad hospitalaria.

---

## 2. Niveles Progresivos por Ámbito Asistencial

Cada disciplina cuenta con **5 niveles formativos progresivos**:
- **Nivel 1: Principiante**: Estructura general, capítulos y categorías de 3 caracteres (Umbral desbloqueo: $\ge 80\%$).
- **Nivel 2: Básico**: Subcategorías de 4 a 5 caracteres, localización anatómica y lateralidad simple (Umbral: $\ge 80\%$).
- **Nivel 3: Intermedio**: Notas normativas de Inclusión, Excluye 1 (mutuamente excluyentes) y Excluye 2 (Umbral: $\ge 85\%$).
- **Nivel 4: Avanzado**: Códigos combinados, etiología/manifestación, causa externa y 7º carácter (Umbral: $\ge 85\%$).
- **Nivel 5: Experto**: Informes de alta hospitalaria complejos: Selección de Diagnóstico Principal vs. Secundarios (Umbral: $\ge 85\%$).

---

## 3. Resolución Razonada en 4 Bloques y Síntesis de Errores

Cada caso clínico incluye su **Resolución Razonada** estructurada en 4 bloques:
1. `clinical_analysis`: Lectura clínica del caso y jerarquía diagnóstica según el ámbito asistencial.
2. `cim10_path`: Ruta en el catálogo CIM-10 (capítulo, categoría, subcategoría y notas/7º carácter).
3. `rule_check`: Verificación normativa (`Excluye 1`, `Excluye 2`, `Incluye`, etiología/manifestación y Diagnóstico Principal).
4. `distractor_explanations`: Análisis de cada distractor explicando exactamente por qué es incorrecto.

Los alumnos disponen de un **Filtro de Fallos** y del botón **Generar Test de Repaso de Errores**, que crea sesiones de examen enfocadas exclusivamente en sus preguntas erradas anteriormente.

---

## 4. Arquitectura Técnica y Persistencia Garantizada

- **Stack**: Next.js 15 (App Router) + TypeScript Estricto + Tailwind CSS.
- **Base de Datos Persistente Local**: SQLite nativo (`better-sqlite3`) configurado con:
  - `PRAGMA journal_mode = WAL;` (Write-Ahead Logging para concurrencia masiva en aula).
  - `PRAGMA foreign_keys = ON;` (Integridad referencial en cascada).
  - `PRAGMA synchronous = FULL;` (Cero corrupción o pérdida de datos ante cortes eléctricos).
  - Ubicación: `./data/cim10_centro.db` (fuera de `.next`, excluida de Git).
- **Inicialización Estrictamente Idempotente (`initDb()`)**: Crea las tablas e índices si no existen y precarga los códigos y casos semilla **únicamente si las tablas tienen 0 registros**. Jamás borra ni sobrescribe usuarios o progresos existentes al reiniciar.
- **Transacciones Atómicas**: El guardado de intentos (`test_attempts`), detalle de respuestas (`attempt_details`) y actualización acumulada de nivel (`discipline_progress`) se ejecuta en una única transacción `db.transaction()`.
- **Copia de Seguridad y Portabilidad**: En `/admin` se dispone de exportación e importación completa en formato JSON para transferencias seguras entre aulas.

---

## 5. Ciberseguridad y Privacidad (Estándar CISO)

- **Zero PII en Repositorio**: Ningún DNI, email, teléfono ni nombre de alumno real en código, commits o semillas (solo datos ficticios normalizados).
- **Enmascaramiento de Documentos**: Los DNIs se enmascaran (`****5678Z`) en listados públicos y perfiles; el DNI completo solo es accesible en la ficha individual bajo sesión verificada de `admin`.
- **Validación Oficial de DNI/NIE**: Comprobación estricta del dígito de control español con el algoritmo oficial ($\text{módulo } 23 \to \text{TRWAGMYFPDXBNJZSQVHLCKE}$) y prefijos X/Y/Z para NIE.
- **Criptografía Robusta**:
  - Contraseñas con `crypto.scryptSync` + salt aleatorio de 16 bytes único por usuario y comparación segura con `crypto.timingSafeEqual`.
  - Cookies de sesión `HttpOnly`, `SameSite=Lax` firmadas con HMAC-SHA256 (`SESSION_SECRET` generado automáticamente o mediante variable de entorno).
- **Control de Roles**: Verificación obligatoria de rol (`student` vs. `admin`) en cada ruta de servidor. Bloqueo total de escalada de privilegios en el endpoint de registro.
- **Rate Limiting**: Limitador de tasa en memoria por IP para absorber ráfagas en el aula y mitigar fuerza bruta.
- **Cabeceras HTTP de Seguridad**: CSP estricta, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` y `Permissions-Policy`.

---

## 6. Usuarios de Prueba (Semilla Inicial)

| Rol | Usuario | Contraseña | DNI Ficticio | Finalidad |
| :--- | :--- | :--- | :--- | :--- |
| **Alumno** | `alumno` | `Alumno2026!` | `12345678Z` | Pruebas de estudiante, realización de tests y revisión razonada |
| **Profesor** | `profesor` | `Profesor2026!` | `00000000T` | Gestión de aula, métricas de grupo, reportes y backups |

*(El alumno puede registrar su propia ficha desde la interfaz con su DNI/NIE real o el profesor puede importarlas).*

---

## 7. Instrucciones de Despliegue y Ejecución

### Opción A: Despliegue en Red Local del Instituto (LAN / Pendrive USB)

1. Conecta el pendrive USB con el proyecto portable en el equipo que actuará de servidor en el aula.
2. Haz doble clic en `start-lan.bat` (en Windows) o ejecuta `./start-lan.sh` (en Linux/macOS).
3. El script comprobará Node.js, compilará la versión de producción si es necesario y abrirá el servidor en `0.0.0.0:3000`.
4. **Acceso al aula**:
   - En el propio ordenador servidor: `http://localhost:3000`
   - Desde los ordenadores de los alumnos en la misma red Wi-Fi o cableada del aula: `http://[IP_DEL_SERVIDOR]:3000` (ejemplo: `http://192.168.1.50:3000`).

### Opción B: Despliegue en Vercel (Demo y Acceso Remoto)

1. El repositorio está preparado con configuración limpia y lista para conectar a Vercel.
2. En el panel de Vercel, vincula el repositorio `proyecto-cim10-das26-27-fhsjd`.
3. Variables de entorno recomendadas en Vercel:
   - `SESSION_SECRET`: Cadena aleatoria de al menos 32 caracteres (hex/base64).
   - `SQLITE_DB_PATH`: `/tmp/cim10_centro.db` (para entornos serverless efímeros).
4. El panel de `/admin` detecta automáticamente si se ejecuta en entorno serverless y mantiene activos los botones de **Exportar / Restaurar Copia de Seguridad JSON** para no perder información entre sesiones.

---

## 8. Verificación y Calidad de Código

- Comprobación estática de tipos TypeScript:
  ```bash
  npx tsc --noEmit
  ```
- Compilación de producción Next.js:
  ```bash
  npm run build
  ```
- Arranque de producción:
  ```bash
  npm run start:lan
  ```
