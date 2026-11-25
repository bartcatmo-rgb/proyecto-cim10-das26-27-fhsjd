'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tv,
  Maximize2,
  Minimize2,
  RotateCcw,
  Gauge,
  Award,
  BookOpen,
  Lock,
  HeartHandshake,
  Download,
  School,
  FileText,
  MessageSquare,
  ShieldAlert,
  Check,
  TrendingUp,
  Cpu,
  ZoomIn,
  ZoomOut,
  Laptop,
} from 'lucide-react';

export interface FeatureExplanation {
  functionTitle: string;
  summary: string;
  keyHighlights: string[];
  badge: string;
  simulation: string;
}

export interface Scene {
  id: number;
  featureKey: string;
  title: string;
  subtitle: string;
  estimatedSeconds: number;
  bullets: string[];
  narration: string;
  featureExplanation?: FeatureExplanation;
}

export interface SystemFeatureItem extends FeatureExplanation {
  key: string;
  sceneId: number;
  shortName: string;
  icon: any;
  title?: string;
}

const SYSTEM_FEATURES: SystemFeatureItem[] = [
  {
    key: 'auth_roles',
    sceneId: 1,
    functionTitle: 'Control de Acceso, Muro de Login y Roles RBAC (Alumno, Docente, Admin)',
    shortName: 'Acceso y Roles',
    badge: 'Muro Login & Roles RBAC',
    icon: Lock,
    summary:
      'Muro de login estricto implementado con getSessionUser(): sin sesión verificada no se expone ningún contenido ni API operativa (HTTP 401/403 en servidor). Modelo de roles tripartito (Alumno, Docente, Administrador) con conmutación dual de rol para supervisión pedagógica en tiempo real y protección del último administrador.',
    keyHighlights: [
      'Muro de login obligatorio: portada restringida y redirección automática si no hay sesión',
      'Control de acceso RBAC por perfil (student, teacher, admin) y sesiones firmadas HttpOnly',
      'Conmutador dual de roles para auditoría y verificación de vista de alumno',
      'Protección defensiva contra revocación accidental del último administrador activo',
    ],
    simulation: 'login',
  },
  {
    key: 'subjects_classrooms',
    sceneId: 2,
    functionTitle: 'Materias del Curso Lectivo y Múltiples Aulas Simultáneas',
    shortName: 'Materias y Aulas',
    badge: 'Multi-Materia & Aulas',
    icon: School,
    summary:
      'Estructura modular para impartir múltiples materias del ciclo formativo (CIM-10 Troncal, Documentación Sanitaria, etc.) y desplegar varias aulas simultáneas (Grupo Mañana, Tarde, Aula A, Aula B) con docentes titulares, ratios independientes y expedientes aislados.',
    keyHighlights: [
      'Aislamiento estricto de materias y aulas: ratios, docentes titulares y exámenes separados',
      'Mapeo de miembros: asignación flexible de alumnos y profesores asistentes por aula',
      'Pruebas y métricas segmentadas sin mezclar expedientes académicos',
      'Control visual de capacidad máxima de aula y estado activo/cerrado',
    ],
    simulation: 'subjects',
  },
  {
    key: 'pdf_ai_levels',
    sceneId: 2,
    functionTitle: 'Importación Segura de PDFs y Cadena de Generación en 3 Niveles',
    shortName: 'PDFs e IA 3 Niveles',
    badge: 'Inferencia Resiliente 3 Niveles',
    icon: Cpu,
    summary:
      'Carga y extracción de guías clínicas y temarios en PDF con validación defensiva de cabecera mágica (%PDF-). Generación de casos clínicos mediante una cadena en 3 niveles secuenciales: Nivel 1 (Ollama local privado), Nivel 2 (Cloud AI institucional) y Nivel 3 (Motor Clínico Offline Determinista basado en plantillas hospitalarias validadas sin internet).',
    keyHighlights: [
      'Inspección de cabeceras binarias antes de parsear cualquier archivo PDF',
      'Nivel 1: IA local mediante Ollama (100% confidencial y soberano)',
      'Nivel 2: Modelos Cloud institucionales para generación asistida a escala',
      'Nivel 3: Motor Clínico Offline Determinista (garantía de clase sin internet)',
    ],
    simulation: 'pdf_ai',
  },
  {
    key: 'meap_reasoned_tests',
    sceneId: 3,
    functionTitle: 'Metodología MEAP, Explicación en 4 Bloques y Práctica Inversa',
    shortName: 'MEAP y 4 Bloques',
    badge: 'Pedagogía & 4 Bloques',
    icon: Award,
    summary:
      '5 niveles de complejidad clínica progresiva. Ante cada respuesta, la plataforma despliega una resolución razonada exhaustiva estructurada en 4 bloques: Análisis Clínico, Ruta en el Catálogo CIM-10, Reglas y Notas de Exclusión, y Justificación Pormenorizada de cada uno de los 3 distractores. Complementado con Codificación Inversa y modo Kahoot.',
    keyHighlights: [
      '5 niveles: desde casos básicos monopatológicos hasta cirugía de alta complejidad',
      'Resolución en 4 bloques: Análisis, Ruta CIM-10, Normas/Exclusiones y Distractores',
      'Módulo de Codificación Inversa para entrenar la auditoría y detección de errores',
      'Kahoot de Aula con clasificación en tiempo real para sesiones dinámicas en pizarra',
    ],
    simulation: 'test_exam',
  },
  {
    key: 'learning_analytics',
    sceneId: 4,
    functionTitle: 'Panel y Gráfica SVG de Rendimiento: Por Materia y en Conjunto',
    shortName: 'Gráfica de Rendimiento',
    badge: 'Analítica SVG & Multi-Materia',
    icon: TrendingUp,
    summary:
      'Seguimiento milimétrico de la evolución del alumno. Gráfica SVG cronológica interactiva con umbral de aprobado (5.0), filtrable al instante por materia individual o en conjunto con todas las materias agregadas. Desglose de dominio por tema y recomendaciones prioritarias generadas por IA.',
    keyHighlights: [
      'Curva cronológica interactiva en SVG con calificaciones exactas e histórico',
      'Filtro tipo pestaña: En Conjunto (Todas las Materias) y desglose por asignatura',
      'Detección automática de temas que requieren refuerzo prioritario por IA docente',
      'Historial inmutable de intentos y acceso directo a repaso de fallos',
    ],
    simulation: 'learning_chart',
  },
  {
    key: 'classroom_chat',
    sceneId: 4,
    functionTitle: 'Canal de Convivencia y Chat de Aula Protegido',
    shortName: 'Chat de Aula',
    badge: 'Comunicación Institucional',
    icon: MessageSquare,
    summary:
      'Entorno de comunicación institucional en tiempo real sin cesión de datos a plataformas externas. Permite a alumnos y profesores resolver dudas clínicas, coordinar convocatorias de examen y enviar mensajes directos bajo moderación docente.',
    keyHighlights: [
      'Canal general de aula y mensajería directa alumno-profesor',
      'Moderación docente y filtrado contra lenguaje inadecuado o fugas de datos',
      'Tablón de avisos fijados con avisos oficiales del profesorado',
      'Completamente integrado sin WhatsApp ni servicios comerciales de terceros',
    ],
    simulation: 'chat',
  },
  {
    key: 'role_manuals',
    sceneId: 6,
    functionTitle: 'Centro de Documentación y Manuales Oficiales por Rol',
    shortName: 'Manuales por Rol',
    badge: 'Manuales en Markdown',
    icon: BookOpen,
    summary:
      'Centro de manuales técnicos y pedagógicos en Markdown integrado. Cuatro manuales especializados (Alumno, Profesor, Administrador, Instituto/IT) accesibles desde la interfaz y protegidos con filtrado estricto en API y UI para evitar fugas de privilegios o guías técnicas al alumnado.',
    keyHighlights: [
      'Manual del Alumno: registro, navegación, MEAP, gráfica y privacidad',
      'Manual del Profesor: configuración de exámenes, seguimiento y pizarra',
      'Manual del Administrador: panel SOC, RGPD, gestión de roles y backups',
      'Manual Instituto IT: despliegue Vercel, offline y requisitos de red escolar',
    ],
    simulation: 'manuals',
  },
  {
    key: 'soc_rgpd',
    sceneId: 5,
    functionTitle: 'Blindaje BancActiu Zero-Trust, RGPD por Diseño y Panel SOC',
    shortName: 'SOC y RGPD',
    badge: 'BancActiu Zero-Trust',
    icon: ShieldCheck,
    summary:
      'Estándar BancActiu Zero-Trust: cifrado AES-256-GCM para DNI y teléfono, índices ciegos HMAC-SHA256 para búsquedas sin descifrado, cumplimiento RGPD/LOPDGDD/APDCAT (edad mínima 14 años, portabilidad y anonimización irreversible). Panel SOC en tiempo real con alertas gratuitas por Email y Telegram y pulsador de revocación global.',
    keyHighlights: [
      'Cifrado AES-256-GCM con AuthTag en base de datos en reposo',
      'Índice ciego HMAC-SHA256 (búsquedas sin exponer el DNI original)',
      'Derechos ARCO: Exportación JSON (Art. 15/20) y Anonimización (Art. 17)',
      'Alertas gratuitas sin SMS vía Webhook Telegram y SMTP institucional',
      'Botón de Revocación Global inmediata de todas las sesiones activas',
    ],
    simulation: 'soc',
  },
];

const DEFAULT_SCENES: Scene[] = [
  {
    id: 1,
    featureKey: 'auth_roles',
    title: 'Introducción y Misión Formativa FHSJD',
    subtitle: 'Ciclo Formativo DAS · Promoción 2026/2027',
    estimatedSeconds: 38,
    bullets: [
      'Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares',
      'Puente directo entre el aula académica y la práctica asistencial',
      'Codificación Clínica CIM-10: rigor, comprensión clínica y calidad del dato',
    ],
    narration:
      'Hola a todos. Os damos una cordial bienvenida a la presentación de AulaCIM-10, la plataforma de entrenamiento clínico y codificación sanitaria desarrollada específicamente para los estudiantes del Ciclo Formativo de Grado Superior en Documentación y Administración Sanitarias, en su promoción 2026/2027. Nuestra misión en la Fundación Hospital San Juan de Dios siempre ha sido clara: tender un puente directo entre el aula formativa y la realidad asistencial de nuestros hospitales. Codificar no es simplemente memorizar códigos alfanuméricos... Codificar es comprender la historia clínica de un paciente, interpretar el juicio facultativo y garantizar la calidad de los datos del sistema sanitario. Y para lograr esa destreza, necesitábamos una herramienta a la altura de esa exigencia.',
    featureExplanation: SYSTEM_FEATURES[0],
  },
  {
    id: 2,
    featureKey: 'subjects_and_pdf_ai',
    title: 'Materias, Aulas y Generación Resiliente en 3 Niveles',
    subtitle: 'Importación Segura de PDFs y Autonomía sin Dependencias',
    estimatedSeconds: 42,
    bullets: [
      'Gestión de múltiples materias del ciclo formativo y aulas simultáneas',
      'Importación de apuntes en PDF con validación de cabecera mágica %PDF-',
      'Nivel 1: IA local mediante Ollama (100% confidencial)',
      'Nivel 2: Modelos Cloud institucionales para alta escala',
      'Nivel 3: Motor Clínico Offline Determinista (resiliencia total sin internet)',
    ],
    narration:
      'AulaCIM-10 se estructura en torno a un índice modular. Junto al tronco principal de la clasificación CIM-10-ES, el profesorado puede incorporar unidades didácticas y apuntes complementarios en formato PDF. El sistema valida la integridad de cada archivo mediante inspección de cabeceras binarias y extrae el contenido pedagógico de forma completamente segura. Pero lo verdaderamente revolucionario es cómo transformamos esos apuntes en casos prácticos. La plataforma incorpora una cadena de generación en tres niveles secuenciales: Si disponemos de un modelo de inteligencia artificial local mediante Ollama, la generación es inmediata y privada. Si estamos conectados a la red, podemos apoyarnos en modelos en la nube. Y lo más importante... si no hay internet ni Ollama instalado, entra en acción nuestro Motor Clínico Offline Determinista. Un motor propio basado en las plantillas validadas de nuestros documentalistas del hospital, que asegura que jamás una clase o un examen se detenga por un problema técnico. Funciona siempre, al cien por cien.',
    featureExplanation: SYSTEM_FEATURES[1],
  },
  {
    id: 3,
    featureKey: 'meap_reasoned_tests',
    title: 'Metodología MEAP, Explicación en 4 Bloques y Práctica Inversa',
    subtitle: 'Entrenamiento Clínico Adaptativo y Gamificación en Aula',
    estimatedSeconds: 45,
    bullets: [
      '5 niveles progresivos: desde monopatologías hasta casos quirúrgicos complejos',
      'Resolución Razonada: Análisis Clínico, Ruta CIM-10, Reglas y Justificación de Distractores',
      'Módulo de Codificación Inversa: auditoría y detección activa de errores',
      'Kahoot de Aula: sesiones presenciales competitivas en pizarra digital',
    ],
    narration:
      'El aprendizaje se articula bajo la metodología MEAP: entrenamiento adaptativo en cinco niveles progresivos, desde casos básicos monopatológicos hasta situaciones quirúrgicas y multidisciplinares de máxima complejidad. Cuando el estudiante responde, no recibe un simple correcto o incorrecto. La plataforma despliega una explicación razonada en cuatro bloques: el análisis clínico del caso, la ruta de búsqueda en el índice y tabla alfabética, la verificación de notas de exclusión o inclusión, y la justificación detallada de por qué cada una de las otras tres opciones es un distractor. Además, con el módulo de Codificación Inversa, el alumno aprende a auditar: se enfrenta a informes ya codificados con errores intencionados para detectar fallos de criterio. Y para las sesiones presenciales, el modo Kahoot de aula permite realizar rondas competitivas y dinámicas proyectadas en la pizarra digital.',
    featureExplanation: SYSTEM_FEATURES[3],
  },
  {
    id: 4,
    featureKey: 'learning_analytics_and_chat',
    title: 'Analítica por Materia/En Conjunto y Chat Institucional',
    subtitle: 'Seguimiento Individualizado, Refuerzo y Convivencia Digital',
    estimatedSeconds: 30,
    bullets: [
      'Gráfica SVG de evolución filtrable por materia individual o en conjunto',
      'Detección de áreas de refuerzo prioritario y repaso guiado de fallos',
      'Chat institucional: canal general de aula y mensajes directos con docentes',
      'Canal protegido de convivencia académica sin cesión de datos a terceros',
    ],
    narration:
      'Cada alumno cuenta con su propia gráfica de rendimiento. El sistema monitoriza la tasa de acierto en cada ámbito asistencial —como Urgencias, Atención Primaria o Salud Mental— y señala automáticamente los capítulos donde se necesita refuerzo, ofreciendo un botón para repasar directamente los fallos cometidos. Asimismo, el canal de comunicación y chat institucional mantiene conectados a alumnos y profesores para resolver dudas puntuales o coordinar avisos de convocatorias de examen en un entorno seguro y profesional.',
    featureExplanation: SYSTEM_FEATURES[4],
  },
  {
    id: 5,
    featureKey: 'soc_rgpd',
    title: 'Blindaje BancActiu Zero-Trust y RGPD por Diseño',
    subtitle: 'Cifrado AES-256-GCM, Blind Index HMAC y Panel SOC en Tiempo Real',
    estimatedSeconds: 45,
    bullets: [
      'Cifrado de campos sensibles (DNI, teléfono) con AES-256-GCM y AuthTag',
      'Búsquedas mediante índices ciegos deterministas HMAC-SHA256',
      'Cumplimiento RGPD, LOPDGDD y APDCAT: edad mínima 14 años, portabilidad y anonimización',
      'Panel SOC con alertas gratuitas por Email y Telegram sin pasarelas SMS',
      'Revocación global inmediata de sesiones en caso de incidente',
    ],
    narration:
      'Tratándose de un entorno vinculado al sector sanitario, la seguridad y la privacidad son innegociables. AulaCIM-10 incorpora el estándar defensivo BancActiu Zero-Trust. Todos los datos identificativos, como el DNI o el teléfono, se almacenan cifrados en reposo mediante AES-256-GCM, y las búsquedas se realizan a través de índices ciegos con HMAC-SHA256, sin exponer jamás el documento original. Cumplimos con rigor el RGPD, la LOPDGDD y los criterios de la Autoridad Catalana de Protección de Datos: la edad mínima de acceso está fijada en 14 años, los alumnos pueden ejercer su derecho a la portabilidad descargando su expediente, y ante una baja, el sistema realiza una anonimización irreversible. Además, el equipo directivo dispone de un panel SOC en tiempo real con alertas gratuitas por correo y Telegram, y un pulsador de revocación global capaz de anular todas las sesiones activas en caso de sospecha.',
    featureExplanation: SYSTEM_FEATURES[7],
  },
  {
    id: 6,
    featureKey: 'manuals_and_deployment',
    title: 'Manuales por Rol y Despliegue Dual (Nube + Portable)',
    subtitle: 'Soberanía de Datos en la Unión Europea y Máxima Autonomía Local',
    estimatedSeconds: 38,
    bullets: [
      'Centro de manuales técnicos y pedagógicos en Markdown con acceso filtrado por rol',
      'Producción en Vercel sobre región soberana cdg1 (París, UE)',
      'Paquete portable para PC de colegio (sin software preinstalado)',
      'Runtime portátil de Node.js embebido, cero instalación y cero permisos de administrador',
      'Lanzador nativo AulaCIM-10-Launcher.exe y script INICIAR-AULACIM10.bat',
    ],
    narration:
      'Para facilitar su implantación en cualquier instituto, AulaCIM-10 ofrece dos modalidades de despliegue: Por un lado, el entorno en la nube alojado en Vercel, en la región europea de París, con alta disponibilidad y acceso web seguro desde cualquier lugar. Por otro lado, nuestro paquete portable para colegios. Un archivo ZIP que no requiere instalar Node.js ni solicitar permisos de administrador. Gracias a su runtime portátil integrado y al lanzador nativo de Windows, basta con descomprimir la carpeta en un PC de aula o ejecutarlo desde un pendrive USB: en segundos, la aplicación se inicia de forma completamente autónoma, detectando puertos libres y lista para impartir clase.',
    featureExplanation: SYSTEM_FEATURES[6],
  },
  {
    id: 7,
    featureKey: 'institutional_closing',
    title: 'Compromiso con la Excelencia Educativa Sanitaria',
    subtitle: 'Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares',
    estimatedSeconds: 25,
    bullets: [
      'Formación clínica de vanguardia para futuros documentalistas sanitarios',
      'Innovación tecnológica al servicio del alumnado y del claustro docente',
      'Curso Académico 2026/2027 · DAS FHSJD',
    ],
    narration:
      'AulaCIM-10 es más que un software docente: es el compromiso conjunto de la Fundación Hospital San Juan de Dios y el Col·legi Santa Maria dels Frares con la excelencia académica, la ciberseguridad y el futuro de los profesionales de la documentación clínica. Muchas gracias por vuestra dedicación, y os deseamos un excelente curso 2026/2027.',
    featureExplanation: {
      functionTitle: 'Excelencia Formativa y Sanitaria del Futuro',
      summary:
        'Una solución integral que fusiona tecnología avanzada, rigor documental sanitario y pedagogía adaptativa para preparar con las máximas garantías a la promoción 2026/2027 del Ciclo Superior DAS.',
      keyHighlights: [
        'Alineación curricular plena con el programa oficial de Documentación Sanitaria',
        'Formación práctica basada en casos reales de hospitalización, cirugía y urgencias',
        'Compromiso institucional permanente de soporte, actualización y evolución',
      ],
      badge: 'Excelencia FHSJD 26/27',
      simulation: 'closing',
    },
  },
];

interface RealisticClassroomProps {
  cameraMode: 'classroom' | 'zooming' | 'board';
  children: React.ReactNode;
  activeFeature: SystemFeatureItem;
  onToggleZoom: () => void;
  isPlaying: boolean;
}

function RealisticClassroomStage({
  cameraMode,
  children,
  activeFeature,
  onToggleZoom,
  isPlaying,
}: RealisticClassroomProps) {
  const isZoomed = cameraMode === 'board';
  const isTransitioning = cameraMode === 'zooming';

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col justify-between shadow-2xl select-none">
      {/* Dynamic Classroom Viewport */}
      <div
        className="relative w-full h-full flex-1 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] origin-[52%_38%]"
        style={{
          transform: isZoomed
            ? 'scale(1.9) translateY(-2%)'
            : isTransitioning
            ? 'scale(1.45) translateY(-1%)'
            : 'scale(1) translateY(0)',
        }}
      >
        {/* ESCENA ILUSTRADA EN SVG DE ALTA NITIDEZ (AULA EN PERSPECTIVA) */}
        <svg
          viewBox="0 0 1000 640"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Gradientes arquitectónicos de pared y suelo */}
            <linearGradient id="cls-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0b1329" />
              <stop offset="60%" stopColor="#111c38" />
              <stop offset="100%" stopColor="#182649" />
            </linearGradient>

            <linearGradient id="cls-floor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1e29" />
              <stop offset="50%" stopColor="#12161f" />
              <stop offset="100%" stopColor="#090c12" />
            </linearGradient>

            {/* Focos cenitales sobre pizarra */}
            <radialGradient id="spotlight" cx="50%" cy="0%" r="70%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0b1329" stopOpacity="0" />
            </radialGradient>

            {/* Luz de proyector / SmartBoard */}
            <radialGradient id="board-glow" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Traje y profesor */}
            <linearGradient id="suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>

            {/* Pupitres madera moderna */}
            <linearGradient id="desk-wood" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>

          {/* 1. Pared Frontal del Aula */}
          <rect x="0" y="0" width="1000" height="420" fill="url(#cls-wall)" />
          <rect x="0" y="0" width="1000" height="420" fill="url(#spotlight)" />

          {/* Ventanal izquierdo en perspectiva */}
          <polygon points="0,40 110,90 110,380 0,420" fill="#0f2142" opacity="0.65" />
          <line x1="0" y1="180" x2="110" y2="200" stroke="#38bdf8" strokeWidth="2" opacity="0.35" />
          <line x1="0" y1="280" x2="110" y2="290" stroke="#38bdf8" strokeWidth="2" opacity="0.35" />
          <polygon points="10,60 100,105 100,360 10,395" fill="#1e3a8a" opacity="0.25" />

          {/* 2. Suelo del Aula en Perspectiva */}
          <polygon points="0,420 1000,420 1000,640 0,640" fill="url(#cls-floor)" />
          {/* Líneas de fuga del suelo */}
          <line x1="500" y1="420" x2="100" y2="640" stroke="#334155" strokeWidth="1" opacity="0.3" />
          <line x1="500" y1="420" x2="350" y2="640" stroke="#334155" strokeWidth="1" opacity="0.25" />
          <line x1="500" y1="420" x2="650" y2="640" stroke="#334155" strokeWidth="1" opacity="0.25" />
          <line x1="500" y1="420" x2="900" y2="640" stroke="#334155" strokeWidth="1" opacity="0.3" />

          {/* Zócalo y friso decorativo frontal */}
          <line x1="0" y1="420" x2="1000" y2="420" stroke="#475569" strokeWidth="3" opacity="0.5" />

          {/* 3. Cartel Institucional FHSJD sobre la Pizarra */}
          <g transform="translate(320, 20)">
            <rect
              x="0"
              y="0"
              width="360"
              height="28"
              rx="14"
              fill="#0f172a"
              stroke="#0284c7"
              strokeWidth="1.5"
              opacity="0.95"
            />
            <circle cx="18" cy="14" r="5" fill="#38bdf8" />
            <text
              x="180"
              y="18"
              fill="#e0f2fe"
              fontSize="10"
              fontWeight="bold"
              letterSpacing="1.2"
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              FUNDACIÓN HOSPITAL SAN JUAN DE DIOS · DAS 26/27
            </text>
          </g>

          {/* Reloj de pared del aula (arriba a la derecha) */}
          <g transform="translate(860, 45)">
            <circle cx="0" cy="0" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="0" cy="0" r="2" fill="#38bdf8" />
            <line x1="0" y1="0" x2="0" y2="-9" stroke="#f1f5f9" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="0" y1="0" x2="6" y2="2" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 4. Marco Exterior Físico de la Pizarra Digital SmartBoard */}
          <g transform="translate(200, 60)">
            {/* Resplandor ambiental de proyección */}
            <rect x="-15" y="-15" width="590" height="350" rx="20" fill="url(#board-glow)" />

            {/* Marco de titanio y aluminio */}
            <rect
              x="0"
              y="0"
              width="560"
              height="320"
              rx="14"
              fill="#090d16"
              stroke="#475569"
              strokeWidth="5"
            />

            {/* Altavoz integrado superior y barra táctil */}
            <rect x="230" y="6" width="100" height="4" rx="2" fill="#334155" />
            <circle cx="280" cy="8" r="1.5" fill="#10b981" />

            {/* Bandeja para lápices ópticos magnéticos en la base */}
            <rect x="180" y="315" width="200" height="5" rx="2" fill="#64748b" />
            <rect x="210" y="316" width="35" height="3" rx="1.5" fill="#38bdf8" />
            <rect x="255" y="316" width="35" height="3" rx="1.5" fill="#f43f5e" />
          </g>

          {/* 5. EL PROFESOR EXPLICANDO JUNTO A LA PIZARRA (De pie, señalando activamente) */}
          <g transform="translate(130, 160)">
            {/* Sombra en el suelo */}
            <ellipse cx="25" cy="255" rx="32" ry="10" fill="#000000" opacity="0.45" />

            {/* Piernas y pantalones formales */}
            <path d="M12,180 L8,250 L20,250 L22,180 Z" fill="#1e293b" />
            <path d="M26,180 L28,250 L40,250 L34,180 Z" fill="#0f172a" />
            {/* Zapatos */}
            <ellipse cx="14" cy="252" rx="10" ry="4" fill="#020617" />
            <ellipse cx="34" cy="252" rx="10" ry="4" fill="#020617" />

            {/* Torso con americana / chaqueta formal */}
            <path d="M4,75 Q24,68 44,75 L42,180 Q24,185 6,180 Z" fill="url(#suit-grad)" />
            {/* Camisa y corbata / lanyard institucional */}
            <polygon points="20,72 28,72 26,120 22,120" fill="#f8fafc" />
            <line x1="24" y1="72" x2="24" y2="135" stroke="#0284c7" strokeWidth="2.5" />
            {/* Acreditación docente FHSJD */}
            <rect x="20" y="130" width="9" height="13" rx="1.5" fill="#ffffff" stroke="#0284c7" strokeWidth="1" />

            {/* Brazo izquierdo sosteniendo tablet docente */}
            <path d="M6,80 Q-10,115 2,135" stroke="#312e81" strokeWidth="12" strokeLinecap="round" fill="none" />
            {/* Tablet docente con pantalla azul encendida */}
            <rect x="-14" y="125" width="22" height="15" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="-11" y="127" width="16" height="11" fill="#0284c7" opacity="0.8" />

            {/* Brazo derecho extendido SEÑALANDO LA PIZARRA CON GESTO ACTIVO */}
            <path
              d="M42,85 Q65,80 88,68"
              stroke="#312e81"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
            />
            {/* Mano extendida y puntero digital hacia la pizarra */}
            <circle cx="92" cy="66" r="4.5" fill="#fbcfe8" />
            <line x1="94" y1="64" x2="115" y2="52" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
            <circle cx="118" cy="50" r="3" fill="#38bdf8" opacity="0.9" className="animate-ping" />

            {/* Cuello y cabeza del profesor */}
            <rect x="18" y="55" width="12" height="16" fill="#fbcfe8" />
            <ellipse cx="24" cy="42" rx="14" ry="17" fill="#fbcfe8" />
            {/* Pelo cuidado */}
            <path d="M10,40 Q24,18 38,36 Q34,22 18,22 Q10,28 10,40 Z" fill="#334155" />
            {/* Gafas profesionales */}
            <rect x="17" y="38" width="7" height="5" rx="1" fill="none" stroke="#0284c7" strokeWidth="1.2" />
            <rect x="26" y="38" width="7" height="5" rx="1" fill="none" stroke="#0284c7" strokeWidth="1.2" />
            <line x1="24" y1="40" x2="26" y2="40" stroke="#0284c7" strokeWidth="1" />

            {/* Bocadillo / Indicador de voz activa */}
            <g transform="translate(-10, -5)">
              <rect x="0" y="0" width="78" height="20" rx="10" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.5" />
              <text x="39" y="13" fill="#e0e7ff" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Profesor FHSJD
              </text>
              {/* Onda sonora animada si está sonando */}
              {isPlaying && (
                <circle cx="70" cy="10" r="3" fill="#34d399" className="animate-pulse" />
              )}
            </g>
          </g>

          {/* 6. FILA DE ALUMNOS SENTADOS EN PUPITRES MIRANDO HACIA LA PIZARRA (Plano Medio) */}
          {/* Pupitre Central Izquierdo: Alumna Laia Cachinero Baranda */}
          <g transform="translate(240, 395)">
            {/* Sombra del pupitre */}
            <ellipse cx="90" cy="110" rx="95" ry="14" fill="#000000" opacity="0.4" />

            {/* Silla ergonómica de aula */}
            <path d="M60,65 Q85,55 110,65 L105,100 L65,100 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <line x1="85" y1="100" x2="85" y2="120" stroke="#475569" strokeWidth="4" />
            <line x1="65" y1="120" x2="105" y2="120" stroke="#475569" strokeWidth="3" />

            {/* Alumna sentada de espaldas / 3/4 mirando hacia la pizarra */}
            <ellipse cx="85" cy="50" rx="22" ry="25" fill="#065f46" /> {/* Chaqueta verde esmeralda */}
            {/* Cabeza con coleta alta */}
            <circle cx="85" cy="22" r="14" fill="#fed7aa" />
            <path d="M72,20 Q85,6 98,20 Q92,10 78,10 Z" fill="#78350f" />
            <path d="M96,20 Q108,24 104,36 Q98,34 94,22 Z" fill="#78350f" /> {/* Coleta */}

            {/* Pupitre de madera */}
            <polygon points="10,65 160,65 175,85 -5,85" fill="url(#desk-wood)" stroke="#64748b" strokeWidth="1" />
            {/* Patas metálicas */}
            <line x1="5" y1="85" x2="5" y2="140" stroke="#475569" strokeWidth="3" />
            <line x1="165" y1="85" x2="165" y2="140" stroke="#475569" strokeWidth="3" />

            {/* Portátil abierto sobre el pupitre */}
            <g transform="translate(62, 50)">
              {/* Teclado */}
              <polygon points="5,22 45,22 50,30 0,30" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
              {/* Pantalla orientada hacia adelante con resplandor */}
              <polygon points="5,22 45,22 43,0 7,0" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              <rect x="10" y="3" width="30" height="15" fill="#38bdf8" opacity="0.3" />
              {/* Logo sutil en la tapa posterior */}
              <circle cx="25" cy="11" r="2.5" fill="#e0f2fe" opacity="0.9" />
            </g>

            {/* Rótulo de la alumna */}
            <g transform="translate(30, -5)">
              <rect x="0" y="0" width="115" height="18" rx="9" fill="#064e3b" stroke="#34d399" strokeWidth="1" opacity="0.95" />
              <text x="57" y="12" fill="#d1fae5" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Laia (48069899Z) · Alumna
              </text>
            </g>
          </g>

          {/* Pupitre Central Derecho: Alumno atendiendo y codificando */}
          <g transform="translate(560, 395)">
            {/* Sombra */}
            <ellipse cx="90" cy="110" rx="95" ry="14" fill="#000000" opacity="0.4" />

            {/* Silla */}
            <path d="M60,65 Q85,55 110,65 L105,100 L65,100 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" />
            <line x1="85" y1="100" x2="85" y2="120" stroke="#475569" strokeWidth="4" />
            <line x1="65" y1="120" x2="105" y2="120" stroke="#475569" strokeWidth="3" />

            {/* Alumno de espaldas atento a la explicación */}
            <ellipse cx="85" cy="50" rx="24" ry="26" fill="#1e3a8a" /> {/* Sudadera azul */}
            {/* Cabeza */}
            <circle cx="85" cy="22" r="14" fill="#fcd34d" />
            <path d="M72,22 Q85,8 98,22 Q94,10 76,12 Z" fill="#18181b" />

            {/* Pupitre */}
            <polygon points="10,65 160,65 175,85 -5,85" fill="url(#desk-wood)" stroke="#64748b" strokeWidth="1" />
            <line x1="5" y1="85" x2="5" y2="140" stroke="#475569" strokeWidth="3" />
            <line x1="165" y1="85" x2="165" y2="140" stroke="#475569" strokeWidth="3" />

            {/* Portátil del alumno */}
            <g transform="translate(62, 50)">
              <polygon points="5,22 45,22 50,30 0,30" fill="#0f172a" stroke="#94a3b8" strokeWidth="1" />
              <polygon points="5,22 45,22 43,0 7,0" fill="#6366f1" stroke="#818cf8" strokeWidth="1.5" />
              <rect x="10" y="3" width="30" height="15" fill="#a5b4fc" opacity="0.3" />
              <circle cx="25" cy="11" r="2.5" fill="#ffffff" opacity="0.9" />
            </g>

            {/* Rótulo Alumno B */}
            <g transform="translate(38, -5)">
              <rect x="0" y="0" width="100" height="18" rx="9" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" opacity="0.95" />
              <text x="50" y="12" fill="#e0e7ff" fontSize="8.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                Alumno DAS · En Directo
              </text>
            </g>
          </g>

          {/* 7. PRIMER PLANO (Foreground): HOMBROS Y PORTÁTILES EN LA PARTE INFERIOR DEL AULA */}
          {/* Silueta Alumno Foreground Izquierda */}
          <g transform="translate(20, 510)" opacity="0.85">
            <ellipse cx="60" cy="100" rx="45" ry="50" fill="#090d16" />
            <circle cx="60" cy="45" r="26" fill="#0f172a" />
            {/* Portátil en mesa inferior */}
            <polygon points="100,50 180,50 190,75 90,75" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <polygon points="100,50 180,50 178,20 102,20" fill="#0284c7" opacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          </g>

          {/* Silueta Alumno Foreground Derecha */}
          <g transform="translate(820, 510)" opacity="0.85">
            <ellipse cx="60" cy="100" rx="45" ry="50" fill="#090d16" />
            <circle cx="60" cy="45" r="26" fill="#0f172a" />
            <polygon points="-40,50 40,50 50,75 -50,75" fill="#1e293b" stroke="#334155" strokeWidth="1" />
            <polygon points="-40,50 40,50 38,20 -38,20" fill="#10b981" opacity="0.4" stroke="#34d399" strokeWidth="1" />
          </g>
        </svg>

        {/* CONTENEDOR DE LA PANTALLA PROYECTADA DENTRO DE LA PIZARRA DIGITAL */}
        {/* Posicionado exactamente en las coordenadas relativas del marco de la SmartBoard (20% a 76% ancho, 9% a 59% alto) */}
        <div
          className={`absolute transition-all duration-700 ease-out z-10 flex flex-col ${
            isZoomed
              ? 'inset-2 sm:inset-3 rounded-xl border-2 border-brand-500/70 bg-slate-950 p-2 sm:p-3 shadow-2xl overflow-y-auto'
              : 'left-[21.5%] top-[11.2%] w-[53%] h-[45%] rounded-lg border border-slate-700 bg-slate-950 p-1.5 sm:p-2 shadow-2xl overflow-hidden pointer-events-auto'
          }`}
        >
          {/* Barra de cabecera de la pizarra táctil */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-300">
            <div className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white text-[11px] truncate">
                {isZoomed ? 'PIZARRA DIGITAL · ENFOQUE TÁCTIL ACTIVO' : 'PROYECCIÓN EN PIZARRA'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 font-mono text-[9px]">
              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-bold">
                {activeFeature.badge}
              </span>
              <button
                type="button"
                onClick={onToggleZoom}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-sans font-bold flex items-center gap-1 border border-slate-700"
                title={isZoomed ? 'Alejar a Vista de Aula' : 'Acercar Pizarra'}
              >
                {isZoomed ? <ZoomOut className="w-3 h-3 text-brand-400" /> : <ZoomIn className="w-3 h-3 text-brand-400" />}
                <span className="hidden xs:inline">{isZoomed ? 'Alejar' : 'Zoom'}</span>
              </button>
            </div>
          </div>

          {/* Contenido interactivo dinámico de la aplicación */}
          <div className="flex-1 min-h-0 overflow-y-auto rounded bg-slate-950/90 text-white">
            {children}
          </div>
        </div>
      </div>

      {/* Barra de herramientas inferior del escenario de clase */}
      <div className="relative z-20 bg-slate-900/95 border-t border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-300">
            <School className="w-3.5 h-3.5 text-brand-400" />
            <span className="hidden sm:inline">Aula Magna FHSJD ·</span> Alumnos Presenciales & Pizarra Digital
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleZoom}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              isZoomed
                ? 'bg-brand-500 text-slate-950 hover:bg-brand-400'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white animate-pulse'
            }`}
          >
            {isZoomed ? (
              <>
                <ZoomOut className="w-3.5 h-3.5" />
                <span>Vista Aula General</span>
              </>
            ) : (
              <>
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Enfocar Pizarra Digital</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PresentationViewer() {
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_SCENES);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [activeFeatureKey, setActiveFeatureKey] = useState<string>('auth_roles');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudioFile, setHasAudioFile] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1.5);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(260);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Cámara cinemática: arranca en aula completa y hace zoom suave a la pizarra
  const [cameraMode, setCameraMode] = useState<'classroom' | 'zooming' | 'board'>('classroom');
  const [autoCinematic, setAutoCinematic] = useState(true);

  // Estados interactivos para las pantallas simuladas
  const [simSelectedOption, setSimSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>('B');
  const [simShowReasoned, setSimShowReasoned] = useState(true);
  const [simSubjectFilter, setSimSubjectFilter] = useState<'all' | 'cim10' | 'docsan'>('all');
  const [simRoleView, setSimRoleView] = useState<'student' | 'teacher' | 'admin'>('student');
  const [simRevokeModalOpen, setSimRevokeModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('/api/media/presentation-scenes')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.scenes?.length) {
          setScenes(data.scenes);
        }
      })
      .catch(() => {});

    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  useEffect(() => {
    if (currentScene.featureExplanation) {
      const match = SYSTEM_FEATURES.find((f) => f.sceneId === currentScene.id);
      if (match) {
        setActiveFeatureKey(match.key);
      }
    }
  }, [currentSceneIdx, currentScene]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Transición suave: aula general -> zoom suave hacia la pizarra proyectada
  useEffect(() => {
    if (!autoCinematic || !isPlaying) return;

    setCameraMode('classroom');

    const zoomTimer = setTimeout(() => {
      setCameraMode('zooming');
      const boardTimer = setTimeout(() => {
        setCameraMode('board');
      }, 1000);
      return () => clearTimeout(boardTimer);
    }, Math.round(2600 / playbackSpeed));

    return () => clearTimeout(zoomTimer);
  }, [currentSceneIdx, isPlaying, autoCinematic, playbackSpeed]);

  const handleToggleZoom = () => {
    if (cameraMode === 'board') {
      setCameraMode('classroom');
    } else {
      setCameraMode('zooming');
      setTimeout(() => setCameraMode('board'), 750);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((e) => {
          console.warn('Audio play prevented:', e);
        });
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    setCurrentSceneIdx(0);
    setActiveFeatureKey('auth_roles');
    setCurrentTime(0);
  };

  const handleNextScene = () => {
    if (currentSceneIdx < scenes.length - 1) {
      setCurrentSceneIdx((prev) => prev + 1);
    }
  };

  const handlePrevScene = () => {
    if (currentSceneIdx > 0) {
      setCurrentSceneIdx((prev) => prev - 1);
    }
  };

  const handleSelectFeature = (feat: SystemFeatureItem) => {
    setActiveFeatureKey(feat.key);
    const targetSceneIdx = scenes.findIndex((s) => s.id === feat.sceneId);
    if (targetSceneIdx !== -1) {
      setCurrentSceneIdx(targetSceneIdx);
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.warn('Error al alternar pantalla completa:', err);
    }
  };

  const activeFeature =
    SYSTEM_FEATURES.find((f) => f.key === activeFeatureKey) || SYSTEM_FEATURES[0];

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex flex-col justify-between overflow-hidden gap-2 ${
        isFullscreen ? 'bg-slate-950 p-2 sm:p-3 text-white' : ''
      }`}
    >
      {/* Audio neural Elvira */}
      <audio
        ref={audioRef}
        src="/media/aulacim10-presentacion-audio.mp3"
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          setCurrentTime(t);
          if (e.currentTarget.duration) {
            setDuration(e.currentTarget.duration);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          if (autoAdvance && currentSceneIdx < scenes.length - 1) {
            handleNextScene();
          }
        }}
        onError={() => setHasAudioFile(false)}
      />

      {/* CABECERA COMPACTA SIN SCROLL */}
      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-lg bg-brand-500/20 text-brand-400 flex-shrink-0">
            <Tv className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-white tracking-tight truncate flex items-center gap-1.5">
              <span>Dinámica de Aula · Pizarra Digital Proyectada</span>
              <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                DAS 26/27
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Velocidad de Reproducción */}
          <div className="inline-flex items-center rounded-lg bg-slate-800 border border-slate-700 p-0.5 text-[11px] font-bold">
            <span className="px-1.5 text-slate-400 flex items-center gap-1">
              <Gauge className="w-3 h-3 text-brand-400" />
            </span>
            {([1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded transition ${
                  playbackSpeed === spd
                    ? 'bg-brand-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Pantalla Completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
            title={isFullscreen ? 'Salir de Pantalla Completa (ESC)' : 'Ver en Pantalla Completa'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ventana</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE FUNCIONALIDADES (PÍLDORAS SIN SCROLL) */}
      <div className="bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 flex-shrink-0 pl-1">
          <Sparkles className="w-3 h-3 text-brand-600" />
          <span className="hidden md:inline">Funcionalidades:</span>
        </span>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto scrollbar-none py-0.5">
          {SYSTEM_FEATURES.map((feat) => {
            const isSelected = activeFeatureKey === feat.key;
            const Icon = feat.icon;
            return (
              <button
                key={feat.key}
                type="button"
                onClick={() => handleSelectFeature(feat)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap shadow-2xs flex-shrink-0 ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-xs ring-1 ring-brand-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{feat.shortName}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL PRINCIPAL: DOS COLUMNAS EN UNA SOLA PANTALLA (EXPLICACIÓN + ESCENARIO DE CLASE) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch overflow-hidden">
        {/* COLUMNA IZQUIERDA: EXPLICACIÓN COMPACTA Y SINCRONIZADA (5 COLS) */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between bg-white rounded-xl p-3 border border-slate-200 shadow-xs overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-brand-50 text-brand-700 font-bold">
                  {React.createElement(activeFeature.icon, { className: 'w-4 h-4' })}
                </span>
                <div>
                  <div className="text-[11px] font-extrabold text-brand-700 leading-none">
                    {activeFeature.badge}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600">
                Escena {activeFeature.sceneId}/7
              </span>
            </div>

            <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
              {activeFeature.functionTitle || activeFeature.title}
            </h2>

            <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
              {activeFeature.summary}
            </p>

            {/* Puntos clave */}
            <div className="space-y-1 pt-0.5">
              {activeFeature.keyHighlights.slice(0, 3).map((hl, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-[10.5px] text-slate-700 leading-tight">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Locución actual transcrita */}
          <div className="pt-2 border-t border-slate-100 mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
              <span>Locución de Aula (Elvira Neural):</span>
              <span className="text-brand-600 font-semibold">{Math.floor(currentTime)}s / ~{duration}s</span>
            </div>
            <p className="text-[10px] text-slate-600 italic bg-amber-50/70 p-2 rounded-lg border border-amber-200/60 max-h-16 overflow-y-auto leading-tight">
              &ldquo;{currentScene.narration}&rdquo;
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: ESCENARIO ILUSTRADO DE CLASE CON PIZARRA DIGITAL DINÁMICA (7 COLS) */}
        <div className="lg:col-span-7 h-full flex flex-col justify-between overflow-hidden">
          <RealisticClassroomStage
            cameraMode={cameraMode}
            activeFeature={activeFeature}
            onToggleZoom={handleToggleZoom}
            isPlaying={isPlaying}
          >
            {/* PANTALLAS SIMULADAS DE AULACIM-10 DENTRO DE LA PIZARRA DIGITAL */}
            <div className="p-2 sm:p-2.5 space-y-2 text-xs">
              {/* 1. LOGIN Y CONTROL DE ACCESO */}
              {activeFeature.simulation === 'login' && (
                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/40">
                      Muro de Login Seguro · Zero-Trust
                    </span>
                    <h3 className="text-xs font-bold text-white mt-1">Acceso Identificado al Aula</h3>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px]">DNI / Identificador:</span>
                      <input
                        type="text"
                        readOnly
                        value="48069899Z"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Contraseña:</span>
                      <input
                        type="password"
                        readOnly
                        value="••••••••"
                        className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="p-1.5 rounded bg-emerald-950/90 border border-emerald-500/50 text-[10.5px] text-emerald-200 flex items-center justify-between">
                    <span>Sesión: <strong>Laia Cachinero Baranda</strong></span>
                    <span className="bg-emerald-500/30 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[9px]">
                      ALUMNO
                    </span>
                  </div>

                  {/* Switcher de rol */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Conmutador pedagógico:</span>
                    <div className="inline-flex rounded bg-slate-800 p-0.5">
                      <button
                        onClick={() => setSimRoleView('student')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          simRoleView === 'student' ? 'bg-brand-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        Alumno
                      </button>
                      <button
                        onClick={() => setSimRoleView('teacher')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          simRoleView === 'teacher' ? 'bg-purple-500 text-white' : 'text-slate-400'
                        }`}
                      >
                        Docente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. MATERIAS Y AULAS SIMULTÁNEAS */}
              {activeFeature.simulation === 'subjects' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-bold text-white">Materias y Aulas Desplegadas</div>
                      <div className="text-[9px] text-brand-400">CFGS Documentación y Administración Sanitarias</div>
                    </div>
                    <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      2026/2027
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    <div className="p-2 rounded bg-slate-900 border border-brand-500/40 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        Codificación CIM-10
                      </div>
                      <div className="text-slate-400 text-[9px]">2 aulas (Mañana / Tarde)</div>
                      <div className="text-emerald-400 font-bold text-[9px]">28/35 matriculados</div>
                    </div>

                    <div className="p-2 rounded bg-slate-900 border border-slate-700 space-y-1">
                      <div className="font-bold text-white flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-400" />
                        Documentación Sanitaria
                      </div>
                      <div className="text-slate-400 text-[9px]">1 aula activa</div>
                      <div className="text-emerald-400 font-bold text-[9px]">24/30 matriculados</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. PDFS E INFERENCIA EN 3 NIVELES */}
              {activeFeature.simulation === 'pdf_ai' && (
                <div className="space-y-2">
                  <div className="p-2 rounded bg-slate-900 border border-dashed border-brand-500/60 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-brand-400 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-white truncate max-w-[170px]">Guia_Codificacion_Urgencias.pdf</div>
                        <div className="text-emerald-400 text-[9px]">Cabecera mágica %PDF- verificada</div>
                      </div>
                    </div>
                    <span className="bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                      Seguro
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[9px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-center">
                      <div className="font-bold text-blue-300">1. Ollama</div>
                      <div className="text-slate-400">Privado local</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-center">
                      <div className="font-bold text-purple-300">2. Cloud AI</div>
                      <div className="text-slate-400">Escala institucional</div>
                    </div>
                    <div className="p-1.5 rounded bg-emerald-950 border border-emerald-500/60 text-center">
                      <div className="font-bold text-emerald-300">3. Offline</div>
                      <div className="text-emerald-200">100% Determinista</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. METODOLOGÍA MEAP & EXPLICACIÓN EN 4 BLOQUES */}
              {activeFeature.simulation === 'test_exam' && (
                <div className="space-y-1.5 text-[10.5px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">
                      MEAP NIVEL 4 · ALTA COMPLEJIDAD
                    </span>
                    <span className="text-[9px] text-slate-400">Pregunta 1 de 10</span>
                  </div>

                  <p className="text-slate-200 text-[10px] leading-tight bg-slate-900 p-2 rounded border border-slate-800">
                    Varón 68 años con fibrilación auricular que sufre traumatismo con hematoma subdural tras caída casual. Evacuación urgente.
                  </p>

                  <div className="grid grid-cols-2 gap-1 text-[9.5px]">
                    {[
                      { id: 'A', text: 'I48.0 (FA crónica) como DP' },
                      { id: 'B', text: 'S06.5X0A (Hematoma subdural) como DP' },
                      { id: 'C', text: 'W19.XXXA (Caída casual)' },
                      { id: 'D', text: 'I62.0 (Hematoma no traumático)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSimSelectedOption(opt.id as any);
                          setSimShowReasoned(true);
                        }}
                        className={`p-1.5 rounded text-left transition border ${
                          simSelectedOption === opt.id
                            ? opt.id === 'B'
                              ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold'
                              : 'bg-rose-950 border-rose-500 text-rose-200'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <strong>{opt.id})</strong> {opt.text}
                      </button>
                    ))}
                  </div>

                  {simShowReasoned && (
                    <div className="p-2 rounded bg-slate-900 border border-emerald-500/40 text-[9px] space-y-1 text-slate-300">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Explicación en 4 Bloques:
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8.5px] text-slate-400">
                        <div>1. <strong>Análisis:</strong> Motivo de ingreso rige la jerarquía.</div>
                        <div>2. <strong>Ruta CIM:</strong> Hematoma &gt; subdural &gt; traumático (S06.5).</div>
                        <div>3. <strong>Reglas:</strong> Normas de codificación de causas externas.</div>
                        <div>4. <strong>Distractores:</strong> A, C y D confunden etiología o comorbilidad.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. ANALÍTICA DE APRENDIZAJE & GRÁFICA SVG */}
              {activeFeature.simulation === 'learning_chart' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px]">
                      <span className="text-slate-400">Ámbito:</span>
                      <button
                        onClick={() => setSimSubjectFilter('all')}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          simSubjectFilter === 'all' ? 'bg-brand-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        En Conjunto
                      </button>
                      <button
                        onClick={() => setSimSubjectFilter('cim10')}
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          simSubjectFilter === 'cim10' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        CIM-10
                      </button>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono text-xs">Media: 8.4/10</span>
                  </div>

                  <div className="p-2 bg-slate-900 rounded border border-slate-800">
                    <svg viewBox="0 0 360 85" className="w-full h-16">
                      <line x1="10" y1="42" x2="350" y2="42" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="345" y="38" fill="#f43f5e" fontSize="7" textAnchor="end">Aprobado 5.0</text>
                      <polyline
                        points="20,68 60,54 100,58 140,46 180,32 220,36 260,24 300,20 340,16"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      {[
                        [20, 68],
                        [100, 58],
                        [180, 32],
                        [260, 24],
                        [340, 16],
                      ].map(([x, y], i) => (
                        <circle key={i} cx={x} cy={y} r="3" fill="#a5b4fc" stroke="#312e81" strokeWidth="1.5" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[8px] text-slate-400 px-1 mt-0.5">
                      <span>Prueba 1</span>
                      <span>Prueba 5</span>
                      <span>Prueba 10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. CHAT DE AULA */}
              {activeFeature.simulation === 'chat' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-white flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Canal General DAS 26/27
                    </span>
                    <span className="text-[9px] text-emerald-400">Canal FHSJD Seguro</span>
                  </div>

                  <div className="space-y-1 text-[9.5px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800 space-y-0.5">
                      <div className="flex justify-between text-slate-400 font-bold text-[8.5px]">
                        <span>Prof. Roca (Docente Titular)</span>
                        <span>10:15</span>
                      </div>
                      <p className="text-slate-200">
                        Recordad revisar las notas de Excluye 1 en el Capítulo 19 antes del examen.
                      </p>
                    </div>

                    <div className="p-1.5 rounded bg-indigo-950/80 border border-indigo-500/40 space-y-0.5 ml-3">
                      <div className="flex justify-between text-indigo-300 font-bold text-[8.5px]">
                        <span>Laia Cachinero Baranda</span>
                        <span>10:18</span>
                      </div>
                      <p className="text-indigo-100">
                        Entendido, profesor. Hemos completado la lectura guiada del temario en la plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. MANUALES POR ROL */}
              {activeFeature.simulation === 'manuals' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Centro Oficial de Manuales</span>
                    <span className="text-[9px] text-brand-400">Markdown Filtrado</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="font-bold text-emerald-300">MANUAL_ALUMNOS.md</div>
                      <div className="text-slate-400 text-[8px]">Acceso, MEAP, RGPD</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="font-bold text-blue-300">MANUAL_PROFESORES.md</div>
                      <div className="text-slate-400 text-[8px]">Exámenes y Pizarra</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-purple-500/40">
                      <div className="font-bold text-purple-300">MANUAL_ADMIN.md</div>
                      <div className="text-slate-400 text-[8px]">SOC, RGPD y Roles</div>
                    </div>
                    <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                      <div className="font-bold text-amber-300">MANUAL_INSTITUTO.md</div>
                      <div className="text-slate-400 text-[8px]">Despliegue Portable</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. PANEL SOC & RGPD */}
              {activeFeature.simulation === 'soc' && (
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                    <span className="font-bold text-white flex items-center gap-1 text-[10px]">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Telemetría SOC
                    </span>
                    <span className="text-[8.5px] text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.5 rounded">
                      AES-256-GCM Activo
                    </span>
                  </div>

                  <div className="space-y-1 font-mono text-[8.5px]">
                    <div className="p-1 bg-slate-900 rounded flex items-center justify-between text-slate-300">
                      <span>[INFO] LOGIN_SUCCESS usr_core_admin</span>
                      <span className="text-emerald-400 font-bold">OK</span>
                    </div>
                    <div className="p-1 bg-slate-900 rounded flex items-center justify-between text-slate-300">
                      <span>[WARN] RATE_LIMIT_CHECKED /api/auth/login</span>
                      <span className="text-amber-400 font-bold">FILTRADO</span>
                    </div>
                    <div className="p-1 bg-slate-900 rounded flex items-center justify-between text-slate-300">
                      <span>[INFO] RGPD_PORTABILITY_EXPORT (Art. 20)</span>
                      <span className="text-blue-400 font-bold">DESCARGA</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[9px]">
                    <span className="text-slate-400">Alertas: Webhook Telegram + SMTP</span>
                    <button
                      onClick={() => setSimRevokeModalOpen(!simRevokeModalOpen)}
                      className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[8.5px]"
                    >
                      Revocación Global
                    </button>
                  </div>
                </div>
              )}

              {/* 9. CIERRE INSTITUCIONAL */}
              {activeFeature.simulation === 'closing' && (
                <div className="text-center py-2 space-y-1">
                  <div className="w-8 h-8 mx-auto rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-bold text-white">Compromiso San Juan de Dios</div>
                  <div className="text-[10px] text-slate-300 max-w-xs mx-auto">
                    Formación de documentalistas clínicos con tecnología soberana y excelencia asistencial.
                  </div>
                  <div className="text-[9px] font-bold text-brand-400 pt-0.5">Promoción DAS 2026/2027</div>
                </div>
              )}
            </div>
          </RealisticClassroomStage>
        </div>
      </div>

      {/* BARRA INFERIOR DE REPRODUCCIÓN Y NAVEGACIÓN COMPACTA */}
      <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-800 shadow-md flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevScene}
            disabled={currentSceneIdx === 0}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition"
            title="Escena anterior"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="px-3.5 py-1.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-lg transition shadow-md flex items-center gap-1.5 text-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{hasAudioFile ? 'Iniciar Locución' : 'Comenzar'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextScene}
            disabled={currentSceneIdx === scenes.length - 1}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg transition"
            title="Siguiente escena"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
            title={isMuted ? 'Sonido activado' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Indicador de escena y guion */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-200">Escena {currentScene.id}/{scenes.length}</span>
            <span>·</span>
            <span>{Math.floor(currentTime)}s / {duration > 0 ? Math.floor(duration) : 260}s</span>
          </div>

          <label className="hidden sm:flex items-center gap-1 cursor-pointer select-none text-[10px]">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-slate-700 text-brand-500 w-3 h-3"
            />
            <span>Avance auto</span>
          </label>

          <a
            href="/docs/GUION_VIDEO_PRESENTACION.md"
            target="_blank"
            className="text-brand-400 hover:text-brand-300 font-bold underline flex items-center gap-1 text-[11px]"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Guion</span>
          </a>
        </div>
      </div>
    </div>
  );
}
