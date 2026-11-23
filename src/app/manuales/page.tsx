'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  Usb,
  Mic,
  Tv,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Download,
  Share2,
  Terminal,
} from 'lucide-react';

export default function ManualesPage() {
  const [activeTab, setActiveTab] = useState<'profesor' | 'usb' | 'seguridad'>('profesor');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
              <Link href="/" className="hover:text-brand-600 transition">Inicio</Link>
              <span>/</span>
              <span className="text-slate-800">Guías y Manuales</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand-600" />
              Manuales de Aula y Convocatorias (Para Dummies)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Guías operativas paso a paso para docentes, administradores de aula y técnicos del instituto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Aula
            </Link>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setActiveTab('profesor')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'profesor'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Manual del Docente: Crear, Dictar y Lanzar Pruebas
          </button>
          <button
            onClick={() => setActiveTab('usb')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'usb'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Usb className="w-4 h-4" />
            Manual de Instalación en USB y Red Local del Instituto
          </button>
          <button
            onClick={() => setActiveTab('seguridad')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'seguridad'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Blindaje en Aula: Navegador vs. PowerShell SO
          </button>
        </div>

        {/* Tab 1: Docente */}
        {activeTab === 'profesor' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-brand-600 tracking-wider">
                Guía Rápida para el Docente
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Cómo gestionar pruebas y exámenes en 5 sencillos pasos
              </h2>
            </div>

            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Acceder al Panel de Control de Administración</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Inicia sesión con tu usuario de profesor (por ejemplo <code className="bg-slate-100 px-1.5 py-0.5 rounded text-brand-700 font-mono">admin</code>) y accede a la sección <strong>/admin</strong> desde el menú superior o el botón de herramientas.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Crear casos por dictado de voz o texto</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ve a la pestaña <strong>Asistente de Voz / IA</strong>. Pulsa el botón del micrófono, dicta el caso clínico en voz alta (ejemplo: <em>"Paciente de 65 años que ingresa en Urgencias con dolor torácico..."</em>) y pulsa en <strong>Generar e Implementar Casos</strong>. La IA genera automáticamente el caso con su correspondiente código CIM-10, justificación de 4 bloques y lo guarda en la base de datos sin reiniciar nada.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Programar o Activar la Prueba</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    En la pestaña <strong>Configurador de Pruebas</strong>, selecciona la prueba deseada (Casos MEAP, Codificación Inversa de detección de errores o Ronda Kahoot de 10-20 preguntas) y cambia su estado a <strong className="text-emerald-700">En Vivo (live)</strong>.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Compartir el Enlace o Proyectar la Pizarra</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Copia el enlace directo de sesión (ejemplo: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-brand-700 font-mono">http://[IP-AULA]:3000/prueba/C10-URG1</code>) para que los alumnos entren directamente, o abre la <strong>Pizarra Digital (/pizarra)</strong> en el proyector de clase para mostrar el reloj sincronizado y los avisos sonoros de aula a los 15, 10, 5 y 2 minutos.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  5
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-base">Auditoría Histórica y Repaso</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Al terminar la prueba, consulta en la pestaña <strong>Repositorio Histórico</strong> los aciertos, notas y desglose por alumno y curso. Los alumnos pueden revisar sus fallos con las justificaciones completas en <strong>/examenes-realizados</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: USB & Red Local */}
        {activeTab === 'usb' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                Despliegue Portable en Instituto FHSJD
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Cómo arrancar AulaCIM-10 desde un USB en los ordenadores del aula
              </h2>
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-900 leading-relaxed">
                <strong>Autonomía 100% offline:</strong> La plataforma funciona sin conexión a internet gracias a su motor SQLite embebido (<code className="font-mono">./data/cim10_centro.db</code>). Los progresos y exámenes se guardan en el disco del equipo host o en el propio USB.
              </div>

              <div className="space-y-4">
                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-600" />
                    Paso A: Descomprimir en el ordenador del profesor (Host)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Copia el archivo <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">AulaCIM-10_DAS26-27_FHSJD_PORTABLE.zip</code> desde el USB a una carpeta del equipo del profesor (ejemplo: en el Escritorio) y descomprímelo.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-brand-600" />
                    Paso B: Ejecutar el script de red local
                  </h3>
                  <p className="text-xs text-slate-600">
                    Haz doble clic sobre el archivo <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-700">start-lan.bat</code> (en Windows) o ejecuta <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold">./start-lan.sh</code> (en Linux/Mac).
                  </p>
                  <p className="text-xs text-slate-500">
                    El script detectará automáticamente la dirección IP local de la red del instituto (ej. 192.168.1.45) y arrancará el servidor en el puerto 3000 accesible para toda el aula.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Tv className="w-4 h-4 text-brand-600" />
                    Paso C: Conectar los equipos de los alumnos
                  </h3>
                  <p className="text-xs text-slate-600">
                    Indica a los alumnos que abran su navegador web habitual (Chrome, Edge, Firefox) y escriban la dirección que muestra la ventana de la consola, por ejemplo:
                  </p>
                  <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-sm rounded-lg text-center font-bold">
                    http://[IP-DEL-ORDENADOR-DOCENTE]:3000
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-600" />
                    Paso D: Copias de Seguridad al finalizar la clase
                  </h3>
                  <p className="text-xs text-slate-600">
                    Desde el panel <strong>/admin</strong> &rarr; <strong>Persistencia y Backups</strong>, puedes descargar en cualquier momento una copia <code className="font-mono">.db</code> o <code className="font-mono">.json</code> directamente a tu pendrive para tener salvaguardadas las notas y expedientes de todos los alumnos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Seguridad y Blindaje de Aula */}
        {activeTab === 'seguridad' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-indigo-600 tracking-wider">
                Arquitectura de Seguridad Docente (Nivel CISO)
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                Blindaje en Modo Examen: Navegador Web vs. Script PowerShell SO
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Comprende los límites de la tecnología web y cómo se complementa con directivas de sistema operativo para una integridad anti-copia absoluta en el instituto.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Capa Navegador */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <ShieldCheck className="w-6 h-6" />
                  <h3 className="font-bold text-base text-slate-900">1. Capa Web (Navegador del Alumno)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El navegador ejecuta un sandbox seguro en espacio de usuario. En los corredores de examen (<code className="font-mono text-brand-700">/prueba/[code]</code>, <code className="font-mono text-brand-700">TestRunner</code>, <code className="font-mono text-brand-700">Kahoot</code>), la web aplica defensas automáticas:
                </p>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  <li><strong>Supresión de respuestas en red</strong>: Ningún endpoint de examen envía <code className="font-mono">correctOptionId</code> ni resoluciones antes de la entrega formal.</li>
                  <li><strong>Bloqueo de selección y portapapeles</strong>: Estilos CSS <code className="font-mono">select-none</code> impiden copiar texto de enunciados u opciones.</li>
                  <li><strong>Inhabilitación de atajos de teclado</strong>: Se neutralizan <code className="font-mono">Ctrl+C</code>, <code className="font-mono">Ctrl+S</code>, <code className="font-mono">Ctrl+U</code>, <code className="font-mono">Ctrl+P</code>, <code className="font-mono">F12</code> e <code className="font-mono">ImprPant</code>.</li>
                  <li><strong>Detección de cambio de pestaña</strong>: Si el alumno minimiza la ventana o cambia de pestaña, el evento se audita en SQLite y se despliega un modal de advertencia de integridad.</li>
                </ul>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 font-medium">
                  <strong>Límite del Navegador:</strong> Por seguridad del propio sistema operativo, una página web <em>nunca</em> puede acceder al hardware para impedir que un usuario introduzca un pendrive en la torre ni bloquear atajos globales del sistema (como la tecla Windows o herramientas de captura externas).
                </div>
              </div>

              {/* Box 2: Capa Sistema Operativo */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 text-purple-700">
                  <Terminal className="w-6 h-6" />
                  <h3 className="font-bold text-base text-slate-900">2. Capa Sistema Operativo (Script Docente)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Para convocatorias y exámenes oficiales en ordenadores de aula, el docente ejecuta con un solo clic el script de PowerShell con privilegios administrativos:
                </p>
                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto space-y-1">
                  <div># Activar Modo Examen en el ordenador:</div>
                  <div>powershell -ExecutionPolicy Bypass -File .\scripts\exam-lockdown.ps1 -Action Lock</div>
                  <div className="pt-2 text-slate-400"># Restaurar al terminar el examen:</div>
                  <div>powershell -ExecutionPolicy Bypass -File .\scripts\exam-lockdown.ps1 -Action Unlock</div>
                </div>
                <ul className="text-xs text-slate-700 space-y-2 list-disc list-inside">
                  <li><strong>Control USB (USBSTOR)</strong>: Establece <code className="font-mono">Start = 4</code> en el registro <code className="font-mono">HKLM</code>, bloqueando la conexión de nuevos pendrives en la máquina.</li>
                  <li><strong>Salvaguarda Activa de Ejecución</strong>: Verifica la letra de la unidad en ejecución y preserva el pendrive docente o disco donde corre el servidor para que jamás se desmonte ni se congele.</li>
                  <li><strong>Bloqueo de Captura de Pantalla</strong>: Desactiva directivas de captura de pantalla por apps (<code className="font-mono">LetAppsCaptureScreen</code> = 2) y grabación GameDVR de Windows.</li>
                </ul>
              </div>
            </div>

            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2">
              <div className="font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Auditoría de Ciberseguridad Centralizada (CISO)</span>
              </div>
              <p>
                Todos los intentos de infracción (pérdida de foco de pestaña, intentos IDOR entre alumnos, peticiones no autorizadas o fallos de autenticación) se registran en la tabla persistente <code className="font-mono font-bold">security_audit_logs</code> de SQLite, visible en tiempo real para el docente desde la pestaña <strong>Auditoría CISO / Logs</strong> de <code className="font-mono font-bold">/admin</code>.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
