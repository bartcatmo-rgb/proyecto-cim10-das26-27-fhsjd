# AulaCIM-10 · FHSJD (DAS 26/27)
## Manual Metodológico y Operativo para Profesores y Docentes
**Ciclo Formativo de Grado Superior en Documentación y Administración Sanitarias (DAS)**  
*Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares · Curso 2026/2027*

---

### 1. Rol Docente y Entorno de Trabajo
Como profesor de **AulaCIM-10**, dispones de herramientas avanzadas para diseñar, programar, supervisar y evaluar el aprendizaje de la **Codificación Clínica CIM-10-ES** y materias afines de Documentación Sanitaria.

Puedes acceder a las funciones docentes iniciando sesión con tu cuenta de profesor (p. ej. `docente.fhsjd` / `profesor`) y accediendo a la sección de **Administración y Coordinación Docente**.

---

### 2. Gestión de Temas y Unidades Didácticas
La arquitectura multi-tema te permite estructurar el curso en unidades de aprendizaje independientes:
1. **Creación y Edición de Temas:**
   - Define el título de la unidad, categoría docente (p. ej. *Normativa de Codificación*, *Procedimientos Quirúrgicos*, *Archivos Clínicos*), descripción y orden de presentación.
   - Marca temas como troncales (*Core*) o complementarios, y alterna su visibilidad (*Publicado / Borrador*) según el avance del calendario lectivo.
2. **Generación de Resúmenes:**
   - Incorpora resúmenes ejecutivos con viñetas pedagógicas para que el alumno revise los conceptos clave antes de someterse a evaluación.

---

### 3. Importación y Procesamiento Seguro de Documentos PDF
El sistema permite nutrir los temas directamente a partir de apuntes, guías clínicas oficiales del Ministerio de Sanidad o protocolos hospitalarios en formato PDF:
1. **Validación de Seguridad y Cabecera Mágica:**
   - Por motivos de ciberseguridad, todo archivo cargado es sometido a una inspección de bytes a bajo nivel, verificando la firma mágica `%PDF-`.
   - Se rechazan extensiones anómalas, archivos ejecutables camuflados y PDFs corruptos o que superen los 10 MB recomendados para evitar saturación de memoria.
2. **Extracción y Sanitización de Texto:**
   - El extractor nativo procesa el contenido textual del documento eliminando scripts embebidos, metadatos innecesarios y posibles elementos maliciosos.
   - El texto extraído queda listo para ser analizado por el motor de generación de preguntas.

---

### 4. Generación de Casos Clínicos en 3 Niveles (Sin Dependencia Externa)
Para evitar bloqueos durante las clases o exámenes en caso de caídas de red o falta de recursos de hardware en el aula, AulaCIM-10 implementa una **estrategia de generación en 3 niveles secuenciales**:

```
[ Nivel 1: Ollama Local ] ──(Si no disponible)──> [ Nivel 2: Cloud AI ] ──(Si no disponible)──> [ Nivel 3: Motor Clínico Offline ]
```

1. **Nivel 1 — Ollama Local (IA en el equipo del docente):**
   - Si tienes instalado [Ollama](https://ollama.ai) en tu ordenador de trabajo (`http://localhost:11434`), el sistema detecta automáticamente los modelos locales disponibles (p. ej. `llama3`, `mistral`, `gemma`).
   - Permite generar nuevos casos clínicos y preguntas tipo test de manera 100% privada, sin enviar datos fuera de tu ordenador.
2. **Nivel 2 — Cloud AI (Modelos de lenguaje en la nube):**
   - Si no hay un servidor Ollama local activo y el centro dispone de claves de API institucionales configuradas en el entorno (Gemini, Claude o GPT), el motor recurre a ellas para formular preguntas contextualizadas a partir del texto del PDF importado.
3. **Nivel 3 — Motor Clínico Offline Determinista (Resiliencia Total 100% Garantizada):**
   - **No requiere Ollama, no requiere internet ni consume saldo de APIs.**
   - Utiliza una base de datos de plantillas clínicas validadas por especialistas de codificación sanitaria del FHSJD y el catálogo oficial de códigos CIM-10.
   - Genera automáticamente casos verosímiles por ámbito asistencial, asigna distractores con trampas metodológicas realistas y redacta la justificación razonada en 4 bloques.
   - Asegura que la docencia nunca se detenga, incluso en aulas sin conexión a internet.

---

### 5. Configuración y Lanzamiento del "Examen del Día"
El módulo de gestión de pruebas te permite controlar el ritmo de la sesión lectiva en tiempo real:
1. **Configuración de Parámetros:**
   - Selecciona el ámbito clínico (Urgencias, Quirúrgica, Salud Mental, etc.) o simulacro general.
   - Define el nivel de dificultad (1 a 5), número de preguntas (10, 20 o personalizable) y límite de tiempo (con opción de tiempo ilimitado para prácticas guiadas).
2. **Lanzamiento en Vivo:**
   - Al activar el examen con el botón **"Activar Prueba / En Vivo"**, los alumnos ven aparecer la prueba en sus pantallas sin necesidad de refrescar la página.
   - Puedes proyectar la **Pizarra Digital** en el aula, mostrando el temporizador de cuenta atrás y el estado de la sesión.
3. **Cierre y Calificación Inmediata:**
   - Al finalizar el tiempo o cerrar la prueba manualmente, la plataforma recopila los intentos y genera la matriz de calificaciones de manera automática.

---

### 6. Seguimiento Analítico y Evaluación del Alumnado
Desde la pestaña de analítica y calificaciones:
- **Matriz de Rendimiento Grupal:** Consulta de notas medias, porcentaje de aprobados y distribución de notas por rango.
- **Detección de Fallos Comunes:** Identificación inmediata de los códigos CIM-10 y conceptos que más han confundido a la clase, permitiendo enfocar las explicaciones docentes en las áreas más débiles.
- **Ficha Individual del Estudiante:** Histórico de exámenes realizados por cada alumno, tiempo de dedicación y evolución de sus destrezas de codificación.
- **Exportación de Actas:** Descarga de calificaciones en formato estructurado para su integración en los sistemas de gestión académica del instituto.

---

### 7. Moderación del Chat de Aula y Tablón de Anuncios
- **Tablón de Avisos FHSJD:** Publicación de comunicados fijados que se muestran de manera destacada en la portada de todos los alumnos (fechas de convocatorias, pautas de examen, modificaciones de temario).
- **Canal de Preguntas y Respuestas:** Resolución de dudas públicas en el canal general de la promoción DAS 26/27.
- **Atención Individualizada:** Bandeja de mensajes directos para orientar a alumnos con dificultades específicas o necesidades de adaptación pedagógica.
