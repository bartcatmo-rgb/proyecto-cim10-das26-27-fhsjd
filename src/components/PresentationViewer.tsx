'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  ArrowLeft,
  Video,
  Layers,
  Award,
  BookOpen,
  Lock,
  Server,
  HeartHandshake,
  Download,
} from 'lucide-react';

interface Scene {
  id: number;
  title: string;
  subtitle: string;
  estimatedSeconds: number;
  bullets: string[];
  narration: string;
}

const DEFAULT_SCENES: Scene[] = [
  {
    id: 1,
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
  },
  {
    id: 2,
    title: 'Índice Multi-Tema y Generación Resiliente en 3 Niveles',
    subtitle: 'Importación Segura de PDFs y Autonomía sin Dependencias',
    estimatedSeconds: 42,
    bullets: [
      'Importación de apuntes y guías en PDF con validación de cabecera mágica %PDF-',
      'Nivel 1: IA local mediante Ollama (100% privada)',
      'Nivel 2: Modelos en la nube institucionales (Cloud AI)',
      'Nivel 3: Motor Clínico Offline Determinista (resiliencia total sin internet)',
    ],
    narration:
      'AulaCIM-10 se estructura en torno a un índice modular. Junto al tronco principal de la clasificación CIM-10-ES, el profesorado puede incorporar unidades didácticas y apuntes complementarios en formato PDF. El sistema valida la integridad de cada archivo mediante inspección de cabeceras binarias y extrae el contenido pedagógico de forma completamente segura. Pero lo verdaderamente revolucionario es cómo transformamos esos apuntes en casos prácticos. La plataforma incorpora una cadena de generación en tres niveles secuenciales: Si disponemos de un modelo de inteligencia artificial local mediante Ollama, la generación es inmediata y privada. Si estamos conectados a la red, podemos apoyarnos en modelos en la nube. Y lo más importante... si no hay internet ni Ollama instalado, entra en acción nuestro Motor Clínico Offline Determinista. Un motor propio basado en las plantillas validadas de nuestros documentalistas del hospital, que asegura que jamás una clase o un examen se detenga por un problema técnico. Funciona siempre, al cien por cien.',
  },
  {
    id: 3,
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
  },
  {
    id: 4,
    title: 'Analítica Personalizada y Canal de Comunicación Docente',
    subtitle: 'Seguimiento Individualizado, Refuerzo y Convivencia Digital',
    estimatedSeconds: 30,
    bullets: [
      'Gráfica de rendimiento por ámbito asistencial y evolución temporal',
      'Detección de áreas de refuerzo prioritario y repaso guiado de fallos',
      'Chat institucional: canal general de aula y mensajes directos con docentes',
      'Canal protegido de convivencia académica sin cesión de datos',
    ],
    narration:
      'Cada alumno cuenta con su propia gráfica de rendimiento. El sistema monitoriza la tasa de acierto en cada ámbito asistencial —como Urgencias, Atención Primaria o Salud Mental— y señala automáticamente los capítulos donde se necesita refuerzo, ofreciendo un botón para repasar directamente los fallos cometidos. Asimismo, el canal de comunicación y chat institucional mantiene conectados a alumnos y profesores para resolver dudas puntuales o coordinar avisos de convocatorias de examen en un entorno seguro y profesional.',
  },
  {
    id: 5,
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
  },
  {
    id: 6,
    title: 'Despliegue Dual: Nube en Vercel y Modo Portable de Aula',
    subtitle: 'Soberanía de Datos en la Unión Europea y Máxima Autonomía Local',
    estimatedSeconds: 38,
    bullets: [
      'Producción en Vercel sobre región soberana cdg1 (París, UE)',
      'Paquete portable para PC de colegio (sin software preinstalado)',
      'Runtime portátil de Node.js embebido, cero instalación y cero permisos de administrador',
      'Lanzador nativo AulaCIM-10-Launcher.exe y script INICIAR-AULACIM10.bat',
    ],
    narration:
      'Para facilitar su implantación en cualquier instituto, AulaCIM-10 ofrece dos modalidades de despliegue: Por un lado, el entorno en la nube alojado en Vercel, en la región europea de París, con alta disponibilidad y acceso web seguro desde cualquier lugar. Por otro lado, nuestro paquete portable para colegios. Un archivo ZIP que no requiere instalar Node.js ni solicitar permisos de administrador. Gracias a su runtime portátil integrado y al lanzador nativo de Windows, basta con descomprimir la carpeta en un PC de aula o ejecutarlo desde un pendrive USB: en segundos, la aplicación se inicia de forma completamente autónoma, detectando puertos libres y lista para impartir clase.',
  },
  {
    id: 7,
    title: 'Compromiso con la Excelencia Educativa Sanitaria',
    subtitle: 'Fundación Hospital San Juan de Dios & Col·legi Santa Maria dels Frares',
    estimatedSeconds: 25,
    bullets: [
      'Formación clínica de vanguardia para futuros documentalistas sanitarios',
      'Innovación tecnológica al servicio del alumnado y del claustro docente',
      'Curso Académico 2026/2027',
    ],
    narration:
      'AulaCIM-10 es más que un software docente: es el compromiso conjunto de la Fundación Hospital San Juan de Dios y el Col·legi Santa Maria dels Frares con la excelencia académica, la ciberseguridad y el futuro de los profesionales de la documentación clínica. Muchas gracias por vuestra dedicación, y os deseamos un excelente curso 2026/2027.',
  },
];

const SCENE_ICONS = [
  Sparkles,
  Layers,
  Award,
  BookOpen,
  ShieldCheck,
  Server,
  HeartHandshake,
];

export default function PresentationViewer() {
  const [scenes, setScenes] = useState<Scene[]>(DEFAULT_SCENES);
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasAudioFile, setHasAudioFile] = useState(true);
  const [hasVideoMp4, setHasVideoMp4] = useState(false);
  const [viewMode, setViewMode] = useState<'interactive' | 'video'>('interactive');
  const [autoAdvance, setAutoAdvance] = useState(true);

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

    // Comprobar si existe el archivo de vídeo MP4 nativo
    fetch('/api/media/presentation-video')
      .then((r) => {
        if (r.ok && r.headers.get('content-type')?.includes('video')) {
          setHasVideoMp4(true);
        }
      })
      .catch(() => {});
  }, []);

  const currentScene = scenes[currentSceneIdx] || scenes[0];
  const CurrentIcon = SCENE_ICONS[currentSceneIdx] || Sparkles;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Audio play prevented:', e);
      });
    }
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

  return (
    <div className="space-y-6">
      {/* Elemento de audio invisible para la locución neural natural */}
      <audio
        ref={audioRef}
        src="/media/aulacim10-presentacion-audio.mp3"
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (autoAdvance && currentSceneIdx < scenes.length - 1) {
            handleNextScene();
          }
        }}
        onError={() => setHasAudioFile(false)}
      />

      {/* Cabecera del Reproductor */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Acceso Exclusivo: Claustro Docente y Dirección Académica</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Tv className="w-6 h-6 text-brand-400" />
            Presentación Multimedia Oficial · AulaCIM-10 (DAS 26/27)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Locución con voz humana neural en español (sin voz sintética ni robótica) · 7 escenas explicativas sincronizadas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasVideoMp4 && (
            <button
              onClick={() => setViewMode(viewMode === 'interactive' ? 'video' : 'interactive')}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Video className="w-4 h-4 text-brand-400" />
              {viewMode === 'interactive' ? 'Ver Vídeo MP4' : 'Ver Modo Interactivo'}
            </button>
          )}

          <a
            href="/docs/GUION_VIDEO_PRESENTACION.md"
            target="_blank"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Guion Completo
          </a>
        </div>
      </div>

      {/* Escenario Principal */}
      {viewMode === 'video' && hasVideoMp4 ? (
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 aspect-video flex items-center justify-center">
          <video
            controls
            className="w-full h-full"
            src="/api/media/presentation-video"
            poster="/branding/logo-docente.svg"
          >
            Tu navegador no soporta reproducción de vídeo HTML5.
          </video>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tarjeta de Escena Visual */}
          <div className="lg:col-span-8 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 text-white rounded-2xl p-6 sm:p-10 border border-slate-800 shadow-2xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
            {/* Fondo con brillo sutil */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Cabecera de la Diapositiva */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-brand-500/20 text-brand-300 border border-brand-500/30 rounded-lg inline-flex items-center gap-1.5">
                  <CurrentIcon className="w-3.5 h-3.5 text-brand-400" />
                  Escena {currentScene.id} de {scenes.length}
                </span>

                <span className="text-xs text-slate-400 font-mono">
                  ~{currentScene.estimatedSeconds}s de locución
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {currentScene.title}
              </h3>
              <p className="text-sm sm:text-base text-brand-300 font-medium">
                {currentScene.subtitle}
              </p>
            </div>

            {/* Puntos Clave de la Escena */}
            <div className="relative z-10 my-6 space-y-3 bg-slate-900/60 p-5 rounded-xl border border-slate-800/80 backdrop-blur-xs">
              <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                Puntos Clave del Programa
              </div>
              {currentScene.bullets.map((bullet, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </div>
              ))}
            </div>

            {/* Barra de Controles de Reproducción Integrada */}
            <div className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
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
                      <span>Pausar Locución</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{hasAudioFile ? 'Escuchar con Voz Humana' : 'Iniciar Presentación'}</span>
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
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !isMuted;
                      setIsMuted(!isMuted);
                    }
                  }}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition ml-2"
                  title={isMuted ? 'Activar sonido' : 'Silenciar'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoAdvance}
                    onChange={(e) => setAutoAdvance(e.target.checked)}
                    className="rounded border-slate-700 text-brand-500 focus:ring-0"
                  />
                  <span>Avance automático</span>
                </label>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Guion Locutado y Lista de Escenas */}
          <div className="lg:col-span-4 space-y-4">
            {/* Cuadro de Teleprompter / Texto Locutado */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs uppercase font-extrabold text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Locución de la Escena {currentScene.id}
                </span>
                <span className="text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">
                  Voz Elvira Neural
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-48 overflow-y-auto">
                &ldquo;{currentScene.narration}&rdquo;
              </p>
            </div>

            {/* Selector de Escenas */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs uppercase font-extrabold text-slate-700 mb-2">
                Índice de Escenas (7 Pasos)
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {scenes.map((scene, idx) => {
                  const isCurrent = idx === currentSceneIdx;
                  return (
                    <button
                      key={scene.id}
                      type="button"
                      onClick={() => setCurrentSceneIdx(idx)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-semibold transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-brand-500 text-slate-950 shadow-xs font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-100'
                      }`}
                    >
                      <span className="truncate pr-2">
                        {scene.id}. {scene.title}
                      </span>
                      <span className={`text-[10px] font-mono ${isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                        {scene.estimatedSeconds}s
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
