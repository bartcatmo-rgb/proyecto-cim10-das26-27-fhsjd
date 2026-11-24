# AulaCIM-10 · FHSJD (DAS 26/27)
## Manual de Administración, Seguridad y Gobernanza de Datos
**Estándar BancActiu Zero-Trust & Cumplimiento RGPD / LOPDGDD / APDCAT**  
*Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares · Curso 2026/2027*

---

### 1. Perfil de Administración y Responsabilidad
El rol de **Administrador del Sistema** en AulaCIM-10 asume la gestión integral de identidades, la supervisión de la infraestructura defensiva (panel SOC), la configuración de alertas de intrusión en tiempo real y la tutela de los derechos de protección de datos de conformidad con el **RGPD (UE 2016/679)**, la **LOPDGDD (LO 3/2018)** y las directrices de la **Autoridad Catalana de Protección de Datos (APDCAT)**.

---

### 2. Gestión de Cuentas, Privilegios y Roles Duales
1. **Control de Acceso Basado en Roles (RBAC):**
   - **`student` (Estudiante/Alumno):** Acceso limitado al aula virtual, índice multi-tema, exámenes asignados, autoevaluaciones, gráfica de progreso y chat con sus profesores.
   - **`admin` (Docente/Coordinador/Administrador):** Acceso al panel de administración docente, configuración de temas, creación de pruebas y visualización de manuales según perfil.
2. **Capacidad de Rol Dual (`canSwitchRole`):**
   - Para permitir a los coordinadores y auditores experimentar la plataforma con la misma perspectiva visual y funcional que un estudiante, determinados usuarios administradores pueden tener activada la bandera `canSwitchRole`.
   - Cuando está habilitada, el administrador puede alternar su `activeRole` entre `admin` y `student` directamente desde el menú de usuario.
   - **Aislamiento en Servidor:** Las rutas de `/api/admin/*` validan en cada petición que el `activeRole` del token de sesión sea estrictamente `'admin'`. Si un usuario con rol dual navega en modo estudiante e intenta invocar una API administrativa, el servidor bloquea la petición con `403 Forbidden` y registra un evento de `PRIVILEGE_ESCALATION_ATTEMPT` en la telemetría de seguridad.

---

### 3. Centro de Operaciones de Seguridad (Panel SOC y Auditoría)
Ubicado en el panel administrativo bajo la sección **"Seguridad y Amenazas (SOC)"**, este módulo proporciona visibilidad continua sobre la salud operativa y defensiva del sistema:

1. **Captura Automatizada de Eventos (`security_audit_logs`):**
   - `LOGIN_FAILED`: Intentos fallidos de autenticación por credenciales incorrectas.
   - `RATE_LIMIT_BLOCKED`: Peticiones bloqueadas por el limitador de tasa de peticiones (prevención de ataques de fuerza bruta).
   - `UNAUTHORIZED_401`: Accesos no autenticados a rutas o APIs protegidas.
   - `FORBIDDEN_403`: Accesos denegados por discrepancia de rol o privilegios insuficientes.
   - `PRIVILEGE_ESCALATION_ATTEMPT`: Intentos deliberados de invocar endpoints administrativos sin sesión activa de administrador.
   - `IDOR_BLOCKED`: Bloqueo de peticiones sospechosas dirigidas a identificadores de recursos no pertenecientes al usuario.
   - `INVALID_PDF_UPLOAD`: Detección de archivos manipulados o sin la firma mágica `%PDF-`.
   - `RGPD_EXPORT` y `RGPD_ANONYMIZE`: Trazabilidad obligatoria del ejercicio de derechos de datos.
   - `SESSION_REVOKED`: Activación de invalidación global de credenciales.
2. **Principio de Minimización y Cero PII en Logs:**
   - Las direcciones IP se registran exclusivamente en formato hash SHA-256 truncado (`ip_hash`), impidiendo la identificación geográfica directa no autorizada.
   - No se almacenan contraseñas en claro, tokens de sesión íntegros ni datos personales en los detalles del log.

---

### 4. Sistema de Alertas Gratuitas de Intrusión (Sin SMS)
Para garantizar la notificación inmediata ante incidentes sin incurrir en costes mensuales ni requerir pasarelas de pago de SMS, el sistema implementa canales de alerta gratuitos y de alta disponibilidad:

1. **Canal Email (SMTP Gratuito):**
   - Configurable mediante las variables de entorno:
     * `ALERT_EMAIL_FROM`: Dirección remitente institucional (p. ej. `soc@fhsjd.edu.es`).
     * `ALERT_EMAIL_TO`: Buzón de guardia del equipo de seguridad.
     * `ALERT_SMTP_HOST`, `ALERT_SMTP_PORT`, `ALERT_SMTP_USER`, `ALERT_SMTP_PASS`.
   - Utiliza conexión cifrada TLS (puerto 587) compatible con servidores de correo educativos o servicios SMTP gratuitos.
2. **Canal Push Webhook (Telegram / Discord / Slack):**
   - **Telegram Bot API:**
     * `TELEGRAM_BOT_TOKEN`: Token generado gratuitamente a través de `@BotFather`.
     * `TELEGRAM_CHAT_ID`: Identificador del grupo o canal privado del equipo técnico.
   - **Webhook Genérico (Discord / Slack / Teams):**
     * `ALERT_WEBHOOK_URL`: URL del webhook receptor que recibe el payload formateado en markdown con los datos del incidente.
3. **Mecanismo Anti-Spam y Resiliencia:**
   - **Cooldown de 10 minutos:** Si se repite un mismo tipo de ataque (p. ej. un aluvión de `RATE_LIMIT_BLOCKED`), el sistema envía la primera alerta y agrupa las posteriores para no saturar las bandejas del equipo de guardia.
   - **Timeout de 4000 ms:** La llamada de alerta nunca retrasa la respuesta HTTP hacia el usuario ni bloquea la base de datos; si la pasarela externa no responde en 4 segundos, el sistema continúa operando normalmente.

---

### 5. Revocación Global de Sesiones (Kill-Switch Criptográfico)
En caso de detectar una intrusión sospechosa, pérdida de un dispositivo docente o filtración de claves:
- El administrador dispone en el panel SOC del botón **"Revocar Todas las Sesiones Activas"**.
- Al pulsarlo, el sistema incrementa atómicamente el valor de `global_session_version` en la base de datos y registra el evento `SESSION_REVOKED`.
- En la siguiente petición de cualquier usuario (incluidos administradores), el validador de JWT comprueba que la versión del token coincida con la versión global. Si es inferior, la sesión queda destruida instantáneamente y el navegador es redirigido a la pantalla de login.

---

### 6. Cumplimiento de Derechos RGPD / LOPDGDD / APDCAT
1. **Derecho de Portabilidad (Art. 20 RGPD):**
   - Accesible desde la ficha del usuario o a través del endpoint `GET /api/admin/users/[id]/export`.
   - Genera un archivo `.json` estructurado con la información de filiación cifrada en reposo, fecha de matrícula, historial completo de exámenes y progreso acumulado.
2. **Derecho de Supresión y Olvido (Art. 17 RGPD):**
   - Cuando un alumno o tutor legal solicita la baja definitiva, el administrador ejecuta la opción **"Anonimizar Usuario (RGPD)"**.
   - El sistema aplica una disociación irreversible:
     * El nombre completo se reemplaza por `Usuario Anonimizado RGPD`.
     * El DNI/NIE se sustituye por una huella irreversible disociada.
     * El correo electrónico y teléfono se eliminan definitivamente.
     * Los resultados académicos e intentos de examen se desvinculan del titular, preservando las métricas estadísticas agregadas de calidad docente del centro educativo sin vulnerar la privacidad.
