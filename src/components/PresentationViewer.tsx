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
  Layers,
  Award,
  BookOpen,
  Lock,
  Server,
  HeartHandshake,
  Download,
  Users,
  User,
  School,
  FileText,
  MessageSquare,
  ShieldAlert,
  Sliders,
  Check,
  ChevronRight,
  TrendingUp,
  Cpu,
  Eye,
  Key,
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

// 8 Funcionalidades Clave Estructuradas del Sistema
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

interface CinematicProps {
  cameraMode: 'classroom' | 'zooming' | 'board';
  children: React.ReactNode;
  activeFeature: SystemFeatureItem;
  onZoomClick: () => void;
}

function ClassroomCinematicWrapper({
  cameraMode,
  children,
  activeFeature,
  onZoomClick,
}: CinematicProps) {
  if (cameraMode === 'board') {
    return (
      <div className="relative rounded-2xl border-4 border-slate-700 bg-slate-950 p-3 sm:p-4 shadow-2xl transition-all duration-500">
        {/* Pizarra Digital Bezel & Smart Toolbar */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">Pizarra Digital Interactiva FHSJD · Proyección de Aula</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono text-[10px] font-bold">
              1080p · Táctil Activo
            </span>
            <div className="flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded">
              <span className="w-2 h-2 rounded-full bg-blue-400" title="Rotulador Azul" />
              <span className="w-2 h-2 rounded-full bg-red-400" title="Puntero Láser" />
              <span className="w-2 h-2 rounded-full bg-amber-400" title="Marcador" />
            </div>
          </div>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 border border-slate-700 p-4 min-h-[460px] flex flex-col justify-between shadow-2xl select-none">
      {/* Dynamic zoom container */}
      <div
        className="w-full flex-1 flex flex-col items-center justify-center transition-all duration-1000 ease-out origin-center"
        style={{
          transform: cameraMode === 'zooming' ? 'scale(1.7) translateY(-8%)' : 'scale(1) translateY(0)',
          filter: cameraMode === 'zooming' ? 'contrast(1.05)' : 'none',
        }}
      >
        {/* Institutional Plaque on Front Wall */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black bg-brand-900/60 text-brand-200 border border-brand-500/30 uppercase tracking-widest shadow-inner">
            <School className="w-3 h-3 text-brand-400" />
            <span>Fundación Hospital San Juan de Dios · Aula Magna DAS 26/27</span>
          </div>
        </div>

        {/* Central Whiteboard & Professor Podium */}
        <div className="w-full max-w-xl relative mx-auto">
          {/* SmartBoard Frame */}
          <div className="rounded-xl border-4 border-slate-600 bg-slate-950 p-2 shadow-2xl relative">
            <div className="flex items-center justify-between text-[9px] text-slate-400 pb-1 border-b border-slate-800 font-mono mb-1.5">
              <span className="flex items-center gap-1 font-bold text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                PIZARRA DIGITAL · PROYECCIÓN EN VIVO
              </span>
              <span className="text-brand-400 font-semibold">{activeFeature.badge}</span>
            </div>

            {/* Embedded simulation screen inside the board */}
            <div className="rounded overflow-hidden max-h-[300px] overflow-y-auto">
              {children}
            </div>
          </div>

          {/* Teacher avatar standing next to whiteboard */}
          <div className="absolute -left-6 bottom-0 hidden sm:flex flex-col items-center pointer-events-none">
            <div className="bg-purple-950/90 text-purple-200 border border-purple-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-md mb-1 animate-bounce">
              Profesor
            </div>
            <div className="w-8 h-16 bg-gradient-to-b from-purple-600 to-indigo-800 rounded-t-full border border-purple-400/40 shadow-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        {/* Classroom Rows with Students at Desks */}
        <div className="w-full mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-around text-slate-400">
          {[
            { id: 1, name: 'Laia (48069899Z)', status: 'Codificando MEAP' },
            { id: 2, name: 'Alumno DAS A', status: 'Verificando Diagnóstico' },
            { id: 3, name: 'Alumno DAS B', status: 'Atendiendo Explicación' },
          ].map((student) => (
            <div key={student.id} className="flex flex-col items-center">
              <div className="text-[9px] font-bold text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-full border border-slate-600 mb-1">
                {student.name}
              </div>
              <div className="w-16 h-7 bg-slate-800 border border-slate-600 rounded-t-lg flex items-center justify-center text-[8px] text-teal-300 font-mono shadow-md">
                💻 AulaCIM
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action to Trigger Zoom */}
      {cameraMode === 'classroom' && (
        <div className="absolute bottom-3 right-3 z-10">
          <button
            type="button"
            onClick={onZoomClick}
            className="px-3 py-1.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center gap-1.5 animate-pulse"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Hacer Zoom a la Pizarra</span>
          </button>
        </div>
      )}
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
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1.5); // Ritmo ágil por defecto
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(260); // Duración total estimada ~4m20s
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Estados de Cinemática de Dinámica de Clase y Zoom a Pizarra
  const [cameraMode, setCameraMode] = useState<'classroom' | 'zooming' | 'board'>('classroom');
  const [autoCinematic, setAutoCinematic] = useState(true);

  // Estados interactivos para el simulador de UI
  const [simSelectedOption, setSimSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>('B');
  const [simShowReasoned, setSimShowReasoned] = useState(true);
  const [simSubjectFilter, setSimSubjectFilter] = useState<'all' | 'cim10' | 'docsan'>('all');
  const [simRoleView, setSimRoleView] = useState<'student' | 'teacher' | 'admin'>('student');
  const [simRevokeModalOpen, setSimRevokeModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cargar escenas si hay endpoint dinámico
    fetch('/api/media/presentation-scenes')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.scenes?.length) {
          setScenes(data.scenes);
        }
      })
      .catch(() => {});

    // Escuchar cambios de fullscreen del navegador
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  const currentScene = scenes[currentSceneIdx] || scenes[0];

  // Sincronizar feature activa cuando cambia la escena
  useEffect(() => {
    if (currentScene.featureExplanation) {
      const match = SYSTEM_FEATURES.find((f) => f.sceneId === currentScene.id);
      if (match) {
        setActiveFeatureKey(match.key);
      }
    }
  }, [currentSceneIdx, currentScene]);

  // Aplicar velocidad de reproducción al audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Cinemática de dinámica de clase: arranca en fondo del aula y hace zoom progresivo a la pizarra
  useEffect(() => {
    if (!autoCinematic || !isPlaying) return;

    // 1. Mostrar visión general del fondo del aula
    setCameraMode('classroom');

    // 2. Transición de zoom progresivo hacia la pizarra digital
    const zoomTimer = setTimeout(() => {
      setCameraMode('zooming');
      // 3. Foco completo en la pizarra digital
      const boardTimer = setTimeout(() => {
        setCameraMode('board');
      }, 1300);
      return () => clearTimeout(boardTimer);
    }, Math.round(2800 / playbackSpeed));

    return () => clearTimeout(zoomTimer);
  }, [currentSceneIdx, isPlaying, autoCinematic, playbackSpeed]);

  const handleCameraChange = (mode: 'classroom' | 'zooming' | 'board') => {
    if (mode === 'zooming') {
      setCameraMode('zooming');
      setTimeout(() => setCameraMode('board'), 1100);
    } else {
      setCameraMode(mode);
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
      console.warn('Error al cambiar a pantalla completa:', err);
    }
  };

  // Feature activa actual
  const activeFeature =
    SYSTEM_FEATURES.find((f) => f.key === activeFeatureKey) || SYSTEM_FEATURES[0];

  return (
    <div
      ref={containerRef}
      className={`space-y-3.5 transition-colors duration-300 ${
        isFullscreen ? 'bg-slate-950 p-4 overflow-y-auto min-h-screen text-white' : ''
      }`}
    >
      {/* Elemento de audio para locución neural */}
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

      {/* CABECERA PRINCIPAL COMPACTA CON ESTADO Y PANTALLA COMPLETA */}
      <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <ShieldCheck className="w-3 h-3 text-brand-400" />
              <span>Acceso Exclusivo: Claustro Docente y Dirección FHSJD</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Gauge className="w-3 h-3 text-purple-400" />
              <span>Ritmo Ágil: {playbackSpeed}x</span>
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <Tv className="w-5 h-5 text-brand-400 flex-shrink-0" />
            <span>Presentación Interactiva · AulaCIM-10 (DAS 26/27)</span>
          </h1>

          <p className="text-xs text-slate-300">
            Explicación sincronizada con cinemática animada de dinamización de clase y simulación en pizarra digital.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Velocidad */}
          <div className="inline-flex items-center rounded-xl bg-slate-800 border border-slate-700 p-1 text-xs font-bold">
            <span className="px-2 text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-brand-400" /> Velocidad:
            </span>
            {([1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  playbackSpeed === spd
                    ? 'bg-brand-500 text-slate-950 font-black shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Botón de Pantalla Completa */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title={isFullscreen ? 'Salir de Pantalla Completa (ESC)' : 'Ver en Pantalla Completa'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4" />
                <span>Ventana</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" />
                <span>Pantalla Completa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SELECTOR RÁPIDO DE FUNCIONALIDADES (8 PÍLDORAS CLAVE) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            Funcionalidades del Sistema Explicadas en Directo (Clic para inspeccionar):
          </span>
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Sincronizado con Escena {currentScene.id}/7
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {SYSTEM_FEATURES.map((feat) => {
            const isSelected = activeFeatureKey === feat.key;
            const Icon = feat.icon;
            return (
              <button
                key={feat.key}
                type="button"
                onClick={() => handleSelectFeature(feat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                  isSelected
                    ? 'bg-brand-700 text-white shadow-sm ring-2 ring-brand-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{feat.shortName}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANEL PRINCIPAL: DOS COLUMNAS (EXPLICACIÓN ESTRUCTURADA + SIMULADOR VISUAL REAL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: TEXTO EXPLICATIVO SINCRONIZADO CON LA FUNCIÓN (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-brand-50 text-brand-700 font-bold">
                  {React.createElement(activeFeature.icon, { className: 'w-5 h-5' })}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Explicación de la Funcionalidad
                  </span>
                  <div className="text-xs font-bold text-brand-700">{activeFeature.badge}</div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                Escena {activeFeature.sceneId} / 7
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {activeFeature.functionTitle || activeFeature.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              {activeFeature.summary}
            </p>

            {/* Puntos Clave de la Función */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Puntos Clave y Garantías Operativas:
              </span>
              {activeFeature.keyHighlights.map((hl, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 leading-normal">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{hl}</span>
                </div>
              ))}
            </div>

            {/* Locución actual transcrita */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Locución de la Escena Actual ({currentScene.id}):</span>
                <span className="text-brand-600 font-semibold">Voz Elvira Neural</span>
              </div>
              <p className="text-xs text-slate-600 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 max-h-24 overflow-y-auto">
                &ldquo;{currentScene.narration}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: SIMULADOR VISUAL ANIMADO DE LOS FLUJOS REALES (7 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3.5">
            {/* Cabecera del Simulador con Dinámica de Clase y Zoom a Pizarra */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
              <div className="flex items-center gap-2">
                <span className="flex space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs text-slate-300 font-mono ml-1.5">
                  Dinámica de Clase · Proyección Pizarra Digital
                </span>
              </div>

              {/* Botones de Control de Cámara Cinemática */}
              <div className="flex flex-wrap items-center gap-1 bg-slate-800/90 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleCameraChange('classroom')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                    cameraMode === 'classroom'
                      ? 'bg-brand-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Vista general desde el fondo del aula"
                >
                  <School className="w-3.5 h-3.5" />
                  <span>Fondo Aula</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCameraChange('zooming')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                    cameraMode === 'zooming'
                      ? 'bg-purple-500 text-white font-black shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Animar zoom progresivo hacia la pizarra digital"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom Pizarra</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCameraChange('board')}
                  className={`px-2 py-1 rounded-lg transition flex items-center gap-1 ${
                    cameraMode === 'board'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Foco directo en la pantalla de la pizarra digital"
                >
                  <Tv className="w-3.5 h-3.5" />
                  <span>Foco Pizarra</span>
                </button>

                <label className="flex items-center gap-1 ml-1 pl-2 border-l border-slate-700 text-[10px] text-slate-300 font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCinematic}
                    onChange={(e) => setAutoCinematic(e.target.checked)}
                    className="rounded border-slate-600 text-brand-500 w-3 h-3"
                  />
                  <span>Auto-zoom</span>
                </label>
              </div>
            </div>

            <ClassroomCinematicWrapper
              cameraMode={cameraMode}
              activeFeature={activeFeature}
              onZoomClick={() => handleCameraChange('zooming')}
            >
              {/* PANTALLA SIMULADA SEGÚN LA FUNCIÓN ACTIVA */}
              <div className="bg-slate-950 rounded-xl p-3 sm:p-4 border border-slate-800/80 min-h-[350px] flex flex-col justify-center">
              {/* 1. SIMULACIÓN LOGIN & ROLES */}
              {activeFeature.simulation === 'login' && (
                <div className="max-w-md mx-auto w-full bg-slate-900 p-5 rounded-2xl border border-slate-700 shadow-lg space-y-3.5">
                  <div className="text-center space-y-1">
                    <div className="inline-flex p-2 rounded-xl bg-brand-500/20 text-brand-300 mb-1">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-white">Muro de Login Seguro · BancActiu</h3>
                    <p className="text-xs text-slate-400">Introduce DNI o usuario para acceder al aula</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">DNI / Usuario</label>
                      <input
                        type="text"
                        readOnly
                        value="48069899Z"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-slate-300 font-bold block mb-1">Contraseña</label>
                      <input
                        type="password"
                        readOnly
                        value="••••••••"
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Sesión Autenticada: <strong>Laia Cachinero Baranda</strong></span>
                      </div>
                      <span className="text-[10px] uppercase font-bold bg-emerald-500/20 px-2 py-0.5 rounded">
                        Alumno
                      </span>
                    </div>
                  </div>

                  {/* Simulador de conmutación de rol */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Conmutador de Rol (Dual):</span>
                    <div className="inline-flex rounded-lg bg-slate-800 p-0.5">
                      <button
                        onClick={() => setSimRoleView('student')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          simRoleView === 'student' ? 'bg-brand-500 text-slate-950' : 'text-slate-400'
                        }`}
                      >
                        Vista Alumno
                      </button>
                      <button
                        onClick={() => setSimRoleView('teacher')}
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          simRoleView === 'teacher' ? 'bg-purple-500 text-white' : 'text-slate-400'
                        }`}
                      >
                        Vista Docente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SIMULACIÓN MATERIAS & AULAS */}
              {activeFeature.simulation === 'subjects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white">Catálogo de Materias Activas</h4>
                      <p className="text-xs text-slate-400">Asignaturas con exámenes y aulas independientes</p>
                    </div>
                    <span className="text-xs bg-brand-500/20 text-brand-300 font-bold px-2.5 py-1 rounded-lg">
                      Curso 2026/2027
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-brand-500/50 space-y-2">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Codificación CIM-10
                        </span>
                        <span className="text-emerald-400 font-mono text-[10px]">CIM10-TRONCAL</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">2 aulas activas (Grupo Mañana, Tarde) · 35 alumnos</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                          Documentación Sanitaria
                        </span>
                        <span className="text-purple-400 font-mono text-[10px]">DOCSAN-01</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">1 aula activa · Docente titular asignado</p>
                    </div>
                  </div>

                  {/* Tabla de aulas */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                      Aulas Desplegadas:
                    </span>
                    <div className="divide-y divide-slate-800 text-[11px]">
                      <div className="py-1.5 flex items-center justify-between text-slate-300">
                        <span>Aula DAS 26/27 - Grupo A (Mañana)</span>
                        <span className="text-emerald-400 font-semibold">28/35 matriculados</span>
                      </div>
                      <div className="py-1.5 flex items-center justify-between text-slate-300">
                        <span>Aula DAS 26/27 - Grupo B (Tarde)</span>
                        <span className="text-emerald-400 font-semibold">24/35 matriculados</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SIMULACIÓN PDFS E IA EN 3 NIVELES */}
              {activeFeature.simulation === 'pdf_ai' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-dashed border-brand-500/60 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-brand-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Guia_Codificacion_Urgencias_2026.pdf</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Cabecera mágica %PDF- verificada (Seguro)
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-brand-500/20 text-brand-300 px-2.5 py-1 rounded-lg font-bold">
                      PDF Procesado
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Cadena de Fallback Resiliente en 3 Niveles:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                        <div className="font-bold text-blue-300">Nivel 1: Ollama Local</div>
                        <p className="text-[10px] text-slate-400 mt-1">100% privado en hardware del centro</p>
                      </div>
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                        <div className="font-bold text-purple-300">Nivel 2: Cloud AI</div>
                        <p className="text-[10px] text-slate-400 mt-1">Modelos institucionales en nube</p>
                      </div>
                      <div className="p-3 bg-emerald-950/80 rounded-xl border border-emerald-500/60">
                        <div className="font-bold text-emerald-300">Nivel 3: Motor Determinista</div>
                        <p className="text-[10px] text-emerald-200 mt-1">100% offline sin internet garantizado</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SIMULACIÓN MEAP & RESOLUCIÓN RAZONADA EN 4 BLOQUES */}
              {activeFeature.simulation === 'test_exam' && (
                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[10px] font-bold">
                      CASO CLÍNICO · NIVEL 4 (ALTA COMPLEJIDAD)
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Pregunta 1 de 10</span>
                  </div>

                  <p className="text-slate-200 text-xs leading-relaxed bg-slate-900 p-3 rounded-xl border border-slate-800">
                    Paciente de 68 años con fibrilación auricular crónica anticoagulada que ingresa por hematoma subdural traumático tras caída casual en domicilio. Se realiza evacuación quirúrgica urgente.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'A', text: 'I48.0 (Fibrilación auricular) como DP + S06.5X0A' },
                      { id: 'B', text: 'S06.5X0A (Hematoma subdural traumático con pérdida de conciencia) como DP' },
                      { id: 'C', text: 'W19.XXXA (Caída no especificada) como DP' },
                      { id: 'D', text: 'I62.0 (Hematoma subdural no traumático)' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSimSelectedOption(opt.id as any);
                          setSimShowReasoned(true);
                        }}
                        className={`p-2.5 rounded-xl text-left transition border ${
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

                  {/* Modal de 4 bloques desplegado */}
                  {simShowReasoned && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40 space-y-1.5 text-[11px] text-slate-300">
                      <div className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Resolución Razonada en 4 Bloques:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                        <div>1. <strong>Análisis:</strong> Motivo del ingreso es el trauma craneal.</div>
                        <div>2. <strong>Ruta CIM-10:</strong> Hematoma &gt; subdural &gt; traumático (S06.5).</div>
                        <div>3. <strong>Reglas:</strong> La causa de admisión rige la jerarquía diagnóstica.</div>
                        <div>4. <strong>Distractores:</strong> A, C y D confunden etiología y comorbilidad.</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. SIMULACIÓN ANALÍTICA DE APRENDIZAJE & SVG */}
              {activeFeature.simulation === 'learning_chart' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">Ámbito:</span>
                      <div className="inline-flex rounded-lg bg-slate-800 p-0.5">
                        <button
                          onClick={() => setSimSubjectFilter('all')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            simSubjectFilter === 'all' ? 'bg-brand-500 text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          En Conjunto
                        </button>
                        <button
                          onClick={() => setSimSubjectFilter('cim10')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            simSubjectFilter === 'cim10' ? 'bg-blue-600 text-white' : 'text-slate-400'
                          }`}
                        >
                          CIM-10
                        </button>
                      </div>
                    </div>

                    <span className="text-emerald-400 font-bold font-mono text-sm">
                      Media: 8.4 / 10
                    </span>
                  </div>

                  {/* Curva SVG animada */}
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <svg viewBox="0 0 400 100" className="w-full h-24">
                      <line x1="20" y1="50" x2="380" y2="50" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="375" y="46" fill="#f43f5e" fontSize="8" textAnchor="end">Aprobado (5.0)</text>
                      <polyline
                        points="30,80 70,65 110,70 150,55 190,40 230,45 270,30 310,25 350,20"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {[
                        [30, 80, '4.2'],
                        [110, 70, '5.8'],
                        [190, 40, '7.6'],
                        [270, 30, '8.2'],
                        [350, 20, '9.1'],
                      ].map(([x, y, val], i) => (
                        <circle key={i} cx={Number(x)} cy={Number(y)} r="4" fill="#a5b4fc" stroke="#312e81" strokeWidth="2" />
                      ))}
                    </svg>
                    <div className="flex justify-between text-[10px] text-slate-400 px-2 mt-1">
                      <span>Evaluación 1</span>
                      <span>Evaluación 5</span>
                      <span>Evaluación 10</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SIMULACIÓN CHAT DE AULA */}
              {activeFeature.simulation === 'chat' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      Canal General · Aula DAS 26/27
                    </span>
                    <span className="text-[10px] text-emerald-400">Canal Seguro FHSJD</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div className="flex justify-between text-slate-400 font-bold">
                        <span>Prof. Roca (Docente Titular)</span>
                        <span>10:15</span>
                      </div>
                      <p className="text-slate-200">
                        Recordad revisar las notas de Excluye 1 en el Capítulo 19 antes del simulacro de mañana.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-[11px] space-y-1 ml-4">
                      <div className="flex justify-between text-indigo-300 font-bold">
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

              {/* 7. SIMULACIÓN MANUALES POR ROL */}
              {activeFeature.simulation === 'manuals' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Centro Oficial de Manuales</span>
                    <span className="text-[10px] text-brand-400">Markdown Integrado</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-emerald-300">MANUAL_ALUMNOS.md</div>
                      <p className="text-[10px] text-slate-400">Guía de acceso, MEAP, gráfica y RGPD (Visible)</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-blue-300">MANUAL_PROFESORES.md</div>
                      <p className="text-[10px] text-slate-400">Configuración de pruebas y monitor (Docente)</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-purple-500/50 space-y-1">
                      <div className="font-bold text-purple-300">MANUAL_ADMINISTRADORES.md</div>
                      <p className="text-[10px] text-slate-400">SOC, alertas, roles y copias (Admin)</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-300">MANUAL_INSTITUTO_IT.md</div>
                      <p className="text-[10px] text-slate-400">Despliegue offline y red escolar (Técnico)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. SIMULACIÓN PANEL SOC & RGPD */}
              {activeFeature.simulation === 'soc' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Panel SOC · Telemetría en Tiempo Real
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded">
                      AES-256-GCM Activo
                    </span>
                  </div>

                  <div className="space-y-1.5 font-mono text-[10px]">
                    <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-300">
                      <span>[INFO] LOGIN_SUCCESS usr_core_admin (IP hash: 8f3c...b2)</span>
                      <span className="text-emerald-400">OK</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-300">
                      <span>[WARN] RATE_LIMIT_CHECKED /api/auth/login</span>
                      <span className="text-amber-400">Filtrado</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg flex items-center justify-between text-slate-300">
                      <span>[INFO] RGPD_PORTABILITY_EXPORT (Art. 20)</span>
                      <span className="text-blue-400">Generado</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Alertas: Webhook Telegram + SMTP</span>
                    <button
                      onClick={() => setSimRevokeModalOpen(!simRevokeModalOpen)}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition"
                    >
                      Pulsador Revocación Global
                    </button>
                  </div>
                </div>
              )}

              {/* 9. SIMULACIÓN CIERRE & DESPLIEGUE */}
              {activeFeature.simulation === 'closing' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center">
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Compromiso San Juan de Dios</h3>
                  <p className="text-xs text-slate-300 max-w-sm mx-auto">
                    Formación de documentalistas clínicos con tecnología soberana, excelencia asistencial y ciberseguridad BancActiu.
                  </p>
                  <div className="pt-2 text-xs font-bold text-brand-400">Promoción DAS 2026/2027</div>
                </div>
              )}
              </div>
            </ClassroomCinematicWrapper>
          </div>
        </div>
      </div>

      {/* BARRA DE CONTROLES INFERIOR: REPRODUCCIÓN, NAVEGACIÓN Y AVANCE COMPACTA */}
      <div className="bg-slate-900 text-white p-2.5 sm:p-3 rounded-xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Controles principales de audio / secuencia */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrevScene}
            disabled={currentSceneIdx === 0}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded-xl transition"
            title="Escena anterior"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            className="px-5 py-2.5 bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center gap-2 text-sm"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>Pausar</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{hasAudioFile ? 'Iniciar Locución' : 'Comenzar'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextScene}
            disabled={currentSceneIdx === scenes.length - 1}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white rounded-xl transition"
            title="Siguiente escena"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
            title="Reiniciar presentación desde el inicio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.muted = !isMuted;
                setIsMuted(!isMuted);
              }
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition ml-1"
            title={isMuted ? 'Activar sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Selector de velocidad en barra */}
          <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-xl text-xs font-semibold text-slate-300 ml-2">
            <span>Velocidad:</span>
            {([1, 1.5, 2] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-1.5 py-0.5 rounded ${
                  playbackSpeed === spd ? 'bg-brand-500 text-slate-950 font-bold' : 'hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Indicador de progreso de la escena y enlace al guion */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-200">
              Escena {currentScene.id} de {scenes.length}
            </span>
            <span>·</span>
            <span className="font-mono text-slate-400">
              {Math.floor(currentTime)}s / ~{duration > 0 ? Math.floor(duration) : 260}s
            </span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-slate-700 text-brand-500 focus:ring-0"
            />
            <span>Avance automático</span>
          </label>

          <a
            href="/docs/GUION_VIDEO_PRESENTACION.md"
            target="_blank"
            className="text-brand-400 hover:text-brand-300 font-bold underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            Guion
          </a>
        </div>
      </div>
    </div>
  );
}
