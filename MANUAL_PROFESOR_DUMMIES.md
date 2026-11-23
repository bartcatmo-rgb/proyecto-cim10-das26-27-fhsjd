# Manual del Docente (Para Dummies)
## AulaCIM-10 · FHSJD (DAS 26/27)
### Plataforma de Codificación Clínica y Evaluación Continua

Bienvenido a la guía rápida para profesores y tutores del ciclo de Documentación y Administración Sanitarias (DAS). Este manual explica cómo utilizar la plataforma de forma ágil sin conocimientos técnicos.

---

### 1. Acceso Inicial al Aula
1. Abre tu navegador web (Google Chrome o Microsoft Edge recomendado).
2. Entra en `http://localhost:3000` (o la IP de red local indicada en el aula).
3. Pulsa en **Iniciar Sesión**.
4. Introduce las credenciales docentes oficiales:
   - **Usuario**: `admin`
   - **Contraseña**: La clave administrativa establecida durante el despliegue.

---

### 2. Gestión de Alumnos por Curso Académico
Desde el panel superior pulsa en **/admin** y entra en la pestaña **Alumnos por Curso**:
1. **Seleccionar Curso**: Por defecto el curso activo es `DAS-26-27`. Puedes consultar alumnos de cursos pasados o crear una nueva promoción (ej. `DAS-27-28`).
2. **Matricular Alumno**: Completa el formulario con Nombre completo, Usuario, DNI/NIE oficial (validado con el algoritmo oficial de módulo 23) y Correo.
3. **Dar de Baja / Reactivar Alumno**:
   - Pulsa el botón **Dar de baja** junto al alumno.
   - **CERO PÉRDIDA DE DATOS**: El alumno queda marcado como inactivo para no poder acceder, pero **jamás se borran** sus exámenes, intentos, notas ni trazabilidad histórica.
   - Puedes reactivarlo con un solo clic pulsando **Reactivar**.

---

### 3. Crear Casos Clínicos por Dictado de Voz o Asistente IA
En **/admin**, ve a la pestaña **Asistente de Voz / IA**:
1. **Pulsar el Micrófono**: Activa el micrófono del navegador.
2. **Dictar el Caso Clínico**: Habla de forma natural describiendo el cuadro. Por ejemplo:
   > *"Paciente varón de 58 años que acude a urgencias por dolor precordial opresivo irradiado a brazo izquierdo de 2 horas de evolución con elevación del ST en cara inferior."*
3. **Ver Transcripción en Vivo**: El texto aparece inmediatamente en la pantalla. Puedes retocar cualquier término médico.
4. **Auto-Implementación Inmediata**: Pulsa el botón **Generar e Implementar Casos**.
   - El sistema deduce el ámbito asistencial (Urgencias), la dificultad y genera las 4 opciones con su código CIM-10 exacto.
   - Construye la **Resolución Razonada de 4 Bloques** (Análisis Clínico, Ruta CIM-10, Verificación Normativa y Análisis de Distractores).
   - Lo guarda en el repertorio SQLite y lo incorpora al banco de preguntas al instante sin reiniciar el servidor.

---

### 4. Convocatoria y Control de Pruebas
En la pestaña **Configurador de Pruebas**, dispones de 5 modalidades:
- **Casos MEAP Estándar**: Selección del diagnóstico principal y codificación paso a paso.
- **Codificación Inversa (Detección de Errores)**: El caso presenta un código previamente asignado con un error (ej. lateralidad, omisión o 7º carácter). El alumno debe auditarlo y sustituirlo por el código correcto.
- **Rondas Tipo Kahoot (10 a 20 Preguntas)**: Ronda interactiva a contrarreloj con podio de 1º, 2º y 3º puesto al finalizar.
- **Examen Adaptativo IA**: Ajusta el nivel automáticamente según las debilidades del alumno.
- **Repaso Guiado**: Enfocado en los errores históricos del estudiante.

#### Estados de la Prueba:
- **Preparada (prepared)**: Lista para ser lanzada cuando empiece la sesión.
- **En Vivo (live)**: Visible y accesible para los alumnos en tiempo real.
- **Cerrada (closed)**: Concluida. Ya no admite nuevos envíos.

#### Enlace Directo para el Aula:
Cada prueba dispone de un código alfanumérico (ejemplo: `C10-URG1`, `VOZ-4812`). Copia y comparte a los alumnos el enlace:
`http://[IP-AULA]:3000/prueba/C10-URG1`

---

### 5. Proyectar la Pizarra Digital de Aula (/pizarra)
En el ordenador conectado al proyector o pantalla de clase:
1. Abre la ruta `/pizarra`.
2. Pulsa el botón de **Pantalla Completa**.
3. La pizarra proyecta:
   - Dirección IP y puerto para que los alumnos se conecten desde sus pupitres.
   - Nombre de la prueba activa y disciplina.
   - Reloj gigante con cuenta atrás.
   - **Avisos de Aula Escalados (15, 10, 5 y 2 minutos)** con alertas visuales destacadas y chimes sonoros automáticos para marcar los tiempos de entrega.

---

### 6. Auditoría y Seguimiento de Calificaciones
1. En **/admin** &rarr; **Repositorio Histórico**:
   - Filtra por Curso, Disciplina asistencial, Alumno o Rango de Fechas.
   - Consulta medias de calificación, porcentaje de aptos y categorías de error más frecuentes.
2. Los alumnos pueden acceder en cualquier momento a **/examenes-realizados** para repasar sus pruebas entregadas y estudiar las justificaciones razonadas.

---

### 7. Salvaguarda y Copia de Seguridad
Antes de apagar el equipo o retirar el pendrive:
1. Accede a **/admin** &rarr; **Persistencia y Backups**.
2. Pulsa en **Descargar Copia JSON** o copia el archivo de base de datos `./data/cim10_centro.db`.
3. Guárdalo en tu pendrive. Las notas quedarán preservadas con garantía total.

---

### 8. Blindaje de Estaciones de Aula y Modo Examen
Durante la realización de exámenes oficiales, la plataforma implementa una doble capa de defensa:

#### A) Capa Web (Defensas en el Navegador de los Alumnos):
- **Bloqueo de copia**: Se inhabilita la selección de texto (`select-none`), el clic derecho y las combinaciones de teclas como `Ctrl+C`, `Ctrl+S`, `Ctrl+U`, `Ctrl+P` y `F12`.
- **Detección de cambio de pestaña / pérdida de foco**: Si el alumno minimiza la ventana, abre otra pestaña o sale del navegador, el sistema muestra un aviso de integridad y registra la incidencia con marca de tiempo en la tabla de auditoría docente `security_audit_logs`.
- **Integridad de preguntas**: Las respuestas correctas (`correctOptionId`) y las resoluciones razonadas se omiten estrictamente del código enviado al cliente hasta que el examen es entregado y calificado por el servidor.

#### B) Capa de Sistema Operativo (Script PowerShell del Docente `exam-lockdown.ps1`):
> **¿Por qué el navegador no es suficiente por sí solo?**  
> Por diseño y directivas de seguridad estándar (sandboxing web), un navegador web **jamás puede impedir a nivel de hardware la inserción física de un pendrive USB ni bloquear herramientas de captura de pantalla nativas de Windows** (como la Herramienta Recortes / Snipping Tool o atajos del sistema como `Win+G` / GameDVR). El navegador opera en espacio de usuario restringido y no tiene acceso al kernel ni a los controladores de dispositivos.

Por este motivo, para convocatorias oficiales donde se desee impedir físicamente la copia o extracción de exámenes, el profesor dispone en la carpeta `scripts/` del script de blindaje:
1. **Activar Blindaje antes del Examen**:
   Abre PowerShell como Administrador en el PC del aula y ejecuta:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\exam-lockdown.ps1 -Action Lock
   ```
   - Inhabilita la conexión de **nuevos dispositivos de almacenamiento USB** (`USBSTOR = 4`).
   - **Salvaguarda Garantizada**: Comprueba la letra de la unidad en ejecución y garantiza que el pendrive docente o servidor en funcionamiento nunca se desmonte ni se bloquee.
   - Bloquea directivas de captura de pantalla de Windows (`LetAppsCaptureScreen` y GameDVR).
2. **Restablecer el Aula al Finalizar el Examen**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\exam-lockdown.ps1 -Action Unlock
   ```
   Restaura la inserción de pendrives y las funciones normales del aula en 1 segundo.

