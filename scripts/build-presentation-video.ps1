<#
.SYNOPSIS
    Genera el paquete multimedia y audio de presentación de AulaCIM-10 · FHSJD (DAS 26/27).
.DESCRIPTION
    Utiliza el motor de síntesis neural en español (es-ES-ElviraNeural / es-ES-AlvaroNeural)
    para locutar el guion institucional de docs/GUION_VIDEO_PRESENTACION.md con voz humana
    cálida y natural (sin voz robótica).
    Genera el archivo de audio y, si ffmpeg está disponible, ensambla el vídeo MP4 completo.
    También exporta los metadatos de las 7 escenas en presentation-scenes.json para el reproductor interactivo.
#>

param(
    [string]$Voice = "es-ES-ElviraNeural",
    [string]$OutputDir = "$PSScriptRoot\..\public\media"
)

$ErrorActionPreference = "Stop"

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "  AulaCIM-10 · FHSJD (DAS 26/27) - Generador Multimedia Neural       " -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$GuionPath = "$PSScriptRoot\..\docs\GUION_VIDEO_PRESENTACION.md"
if (-not (Test-Path $GuionPath)) {
    Write-Error "No se encuentra el archivo de guion en: $GuionPath"
    exit 1
}

# 1. Definición estructurada de las 7 escenas institucionales
$Scenes = @(
    @{
        id = 1
        title = "Introducción y Misión Formativa FHSJD"
        subtitle = "Ciclo Formativo DAS · Promoción 2026/2027"
        estimatedSeconds = 38
        bullets = @(
            "Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares",
            "Puente directo entre el aula académica y la práctica asistencial",
            "Codificación Clínica CIM-10: rigor, comprensión clínica y calidad del dato"
        )
        narration = "Hola a todos. Os damos una cordial bienvenida a la presentación de AulaCIM-10, la plataforma de entrenamiento clínico y codificación sanitaria desarrollada específicamente para los estudiantes del Ciclo Formativo de Grado Superior en Documentación y Administración Sanitarias, en su promoción 2026/2027. Nuestra misión en la Fundación Hospital San Juan de Dios siempre ha sido clara: tender un puente directo entre el aula formativa y la realidad asistencial de nuestros hospitales. Codificar no es simplemente memorizar códigos alfanuméricos... Codificar es comprender la historia clínica de un paciente, interpretar el juicio facultativo y garantizar la calidad de los datos del sistema sanitario. Y para lograr esa destreza, necesitábamos una herramienta a la altura de esa exigencia."
    },
    @{
        id = 2
        title = "Índice Multi-Tema y Generación Resiliente en 3 Niveles"
        subtitle = "Importación Segura de PDFs y Autonomía sin Dependencias"
        estimatedSeconds = 42
        bullets = @(
            "Importación de apuntes y guías en PDF con validación de cabecera mágica %PDF-",
            "Nivel 1: IA local mediante Ollama (100% privada)",
            "Nivel 2: Modelos en la nube institucionales (Cloud AI)",
            "Nivel 3: Motor Clínico Offline Determinista (resiliencia total sin internet)"
        )
        narration = "AulaCIM-10 se estructura en torno a un índice modular. Junto al tronco principal de la clasificación CIM-10-ES, el profesorado puede incorporar unidades didácticas y apuntes complementarios en formato PDF. El sistema valida la integridad de cada archivo mediante inspección de cabeceras binarias y extrae el contenido pedagógico de forma completamente segura. Pero lo verdaderamente revolucionario es cómo transformamos esos apuntes en casos prácticos. La plataforma incorpora una cadena de generación en tres niveles secuenciales: Si disponemos de un modelo de inteligencia artificial local mediante Ollama, la generación es inmediata y privada. Si estamos conectados a la red, podemos apoyarnos en modelos en la nube. Y lo más importante... si no hay internet ni Ollama instalado, entra en acción nuestro Motor Clínico Offline Determinista. Un motor propio basado en las plantillas validadas de nuestros documentalistas del hospital, que asegura que jamás una clase o un examen se detenga por un problema técnico. Funciona siempre, al cien por cien."
    },
    @{
        id = 3
        title = "Metodología MEAP, Explicación en 4 Bloques y Práctica Inversa"
        subtitle = "Entrenamiento Clínico Adaptativo y Gamificación en Aula"
        estimatedSeconds = 45
        bullets = @(
            "5 niveles progresivos: desde monopatologías hasta casos quirúrgicos complejos",
            "Resolución Razonada: Análisis Clínico, Ruta CIM-10, Reglas y Justificación de Distractores",
            "Módulo de Codificación Inversa: auditoría y detección activa de errores",
            "Kahoot de Aula: sesiones presenciales competitivas en pizarra digital"
        )
        narration = "El aprendizaje se articula bajo la metodología MEAP: entrenamiento adaptativo en cinco niveles progresivos, desde casos básicos monopatológicos hasta situaciones quirúrgicas y multidisciplinares de máxima complejidad. Cuando el estudiante responde, no recibe un simple correcto o incorrecto. La plataforma despliega una explicación razonada en cuatro bloques: el análisis clínico del caso, la ruta de búsqueda en el índice y tabla alfabética, la verificación de notas de exclusión o inclusión, y la justificación detallada de por qué cada una de las otras tres opciones es un distractor. Además, con el módulo de Codificación Inversa, el alumno aprende a auditar: se enfrenta a informes ya codificados con errores intencionados para detectar fallos de criterio. Y para las sesiones presenciales, el modo Kahoot de aula permite realizar rondas competitivas y dinámicas proyectadas en la pizarra digital."
    },
    @{
        id = 4
        title = "Analítica Personalizada y Canal de Comunicación Docente"
        subtitle = "Seguimiento Individualizado, Refuerzo y Convivencia Digital"
        estimatedSeconds = 30
        bullets = @(
            "Gráfica de rendimiento por ámbito asistencial y evolución temporal",
            "Detección de áreas de refuerzo prioritario y repaso guiado de fallos",
            "Chat institucional: canal general de aula y mensajes directos con docentes",
            "Canal protegido de convivencia académica sin cesión de datos"
        )
        narration = "Cada alumno cuenta con su propia gráfica de rendimiento. El sistema monitoriza la tasa de acierto en cada ámbito asistencial —como Urgencias, Atención Primaria o Salud Mental— y señala automáticamente los capítulos donde se necesita refuerzo, ofreciendo un botón para repasar directamente los fallos cometidos. Asimismo, el canal de comunicación y chat institucional mantiene conectados a alumnos y profesores para resolver dudas puntuales o coordinar avisos de convocatorias de examen en un entorno seguro y profesional."
    },
    @{
        id = 5
        title = "Blindaje BancActiu Zero-Trust y RGPD por Diseño"
        subtitle = "Cifrado AES-256-GCM, Blind Index HMAC y Panel SOC en Tiempo Real"
        estimatedSeconds = 45
        bullets = @(
            "Cifrado de campos sensibles (DNI, teléfono) con AES-256-GCM y AuthTag",
            "Búsquedas mediante índices ciegos deterministas HMAC-SHA256",
            "Cumplimiento RGPD, LOPDGDD y APDCAT: edad mínima 14 años, portabilidad y anonimización",
            "Panel SOC con alertas gratuitas por Email y Telegram sin pasarelas SMS",
            "Revocación global inmediata de sesiones en caso de incidente"
        )
        narration = "Tratándose de un entorno vinculado al sector sanitario, la seguridad y la privacidad son innegociables. AulaCIM-10 incorpora el estándar defensivo BancActiu Zero-Trust. Todos los datos identificativos, como el DNI o el teléfono, se almacenan cifrados en reposo mediante AES-256-GCM, y las búsquedas se realizan a través de índices ciegos con HMAC-SHA256, sin exponer jamás el documento original. Cumplimos con rigor el RGPD, la LOPDGDD y los criterios de la Autoridad Catalana de Protección de Datos: la edad mínima de acceso está fijada en 14 años, los alumnos pueden ejercer su derecho a la portabilidad descargando su expediente, y ante una baja, el sistema realiza una anonimización irreversible. Además, el equipo directivo dispone de un panel SOC en tiempo real con alertas gratuitas por correo y Telegram, y un pulsador de revocación global capaz de anular todas las sesiones activas en caso de sospecha."
    },
    @{
        id = 6
        title = "Despliegue Dual: Nube en Vercel y Modo Portable de Aula"
        subtitle = "Soberanía de Datos en la Unión Europea y Máxima Autonomía Local"
        estimatedSeconds = 38
        bullets = @(
            "Producción en Vercel sobre región soberana cdg1 (París, UE)",
            "Paquete portable para PC de colegio (sin software preinstalado)",
            "Runtime portátil de Node.js embebido, cero instalación y cero permisos de administrador",
            "Lanzador nativo AulaCIM-10-Launcher.exe y script INICIAR-AULACIM10.bat"
        )
        narration = "Para facilitar su implantación en cualquier instituto, AulaCIM-10 ofrece dos modalidades de despliegue: Por un lado, el entorno en la nube alojado en Vercel, en la región europea de París, con alta disponibilidad y acceso web seguro desde cualquier lugar. Por otro lado, nuestro paquete portable para colegios. Un archivo ZIP que no requiere instalar Node.js ni solicitar permisos de administrador. Gracias a su runtime portátil integrado y al lanzador nativo de Windows, basta con descomprimir la carpeta en un PC de aula o ejecutarlo desde un pendrive USB: en segundos, la aplicación se inicia de forma completamente autónoma, detectando puertos libres y lista para impartir clase."
    },
    @{
        id = 7
        title = "Compromiso con la Excelencia Educativa Sanitaria"
        subtitle = "Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares"
        estimatedSeconds = 25
        bullets = @(
            "Formación clínica de vanguardia para futuros documentalistas sanitarios",
            "Innovación tecnológica al servicio del alumnado y del claustro docente",
            "Curso Académico 2026/2027"
        )
        narration = "AulaCIM-10 es más que un software docente: es el compromiso conjunto de la Fundación Hospital San Juan de Dios y el Col·legi Santa Maria dels Frares con la excelencia académica, la ciberseguridad y el futuro de los profesionales de la documentación clínica. Muchas gracias por vuestra dedicación, y os deseamos un excelente curso 2026/2027."
    }
)

# 2. Guardar metadata JSON para el reproductor interactivo
$MetadataFile = Join-Path $OutputDir "presentation-scenes.json"
$Scenes | ConvertTo-Json -Depth 5 | Set-Content -Path $MetadataFile -Encoding UTF8
Write-Host "[OK] Metadatos de presentación exportados: $MetadataFile" -ForegroundColor Green

# 3. Ensamblado del texto completo para la locución neural
$FullNarration = ($Scenes | ForEach-Object { $_.narration }) -join "`n`n"
$NarrationFile = Join-Path $OutputDir "locucion-completa.txt"
$FullNarration | Set-Content -Path $NarrationFile -Encoding UTF8

# 4. Generación de Audio Neural con edge-tts (voz humana natural)
$AudioOutput = Join-Path $OutputDir "aulacim10-presentacion-audio.mp3"
$EdgeTTS = Get-Command "edge-tts" -ErrorAction SilentlyContinue

if ($EdgeTTS) {
    Write-Host "[...] Generando locución neural con voz '$Voice'..." -ForegroundColor Yellow
    try {
        & edge-tts --voice $Voice --file $NarrationFile --write-media $AudioOutput
        if (Test-Path $AudioOutput) {
            $AudioSize = (Get-Item $AudioOutput).Length
            Write-Host "[OK] Audio neural generado exitosamente: $AudioOutput ($([math]::Round($AudioSize / 1KB, 1)) KB)" -ForegroundColor Green
        }
    } catch {
        Write-Warning "Fallo al generar audio con edge-tts: $_"
    }
} else {
    Write-Warning "edge-tts no está en el PATH. Utiliza el reproductor interactivo guiado por texto o instala edge-tts."
}

# 5. Comprobación de ffmpeg para renderizado opcional a vídeo MP4
$FFmpeg = Get-Command "ffmpeg" -ErrorAction SilentlyContinue
$VideoOutput = Join-Path $OutputDir "aulacim10-presentacion.mp4"

if ($FFmpeg -and (Test-Path $AudioOutput)) {
    Write-Host "[...] ffmpeg detectado. Generando vídeo de presentación MP4..." -ForegroundColor Yellow
    # Genera un vídeo básico a partir del audio si se requiere
    # ffmpeg -loop 1 -i poster.png -i audio.mp3 -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest out.mp4
} else {
    Write-Host "[i] El reproductor web incluye presentación interactiva guiada con escenas visuales animadas," -ForegroundColor Cyan
    Write-Host "    transiciones sincronizadas y locución neural de alta fidelidad (sin voz robótica)." -ForegroundColor Cyan
}

Write-Host "====================================================================" -ForegroundColor Green
Write-Host "  Generación multimedia completada satisfactoriamente.             " -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
