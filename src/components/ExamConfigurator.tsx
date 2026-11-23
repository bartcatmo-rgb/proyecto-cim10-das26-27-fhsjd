'use client';

import React, { useState, useEffect } from 'react';
import { ActiveExam, ServiceArea } from '@/types';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import {
  Sliders,
  Play,
  Square,
  Sparkles,
  Monitor,
  Tv,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  RefreshCw,
  BookOpen,
  Send,
  Zap,
  ShieldAlert,
} from 'lucide-react';
import Link from 'next/link';

interface ExamConfiguratorProps {
  initialActiveExam: ActiveExam | null;
}

export default function ExamConfigurator({ initialActiveExam }: ExamConfiguratorProps) {
  const [activeExam, setActiveExamState] = useState<ActiveExam | null>(initialActiveExam);
  
  // Form states for Exam Configuration
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<ServiceArea>('simulacro_integral');
  const [level, setLevel] = useState<number>(1);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(30);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states for AI Case Generator
  const [aiDiscipline, setAiDiscipline] = useState<ServiceArea>('atencion_primaria');
  const [aiLevel, setAiLevel] = useState<number>(2);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCode, setAiCode] = useState('');
  const [aiSaveDirectly, setAiSaveDirectly] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiGeneratedCase, setAiGeneratedCase] = useState<any | null>(null);

  useEffect(() => {
    if (activeExam) {
      setTitle(activeExam.title);
      setDiscipline(activeExam.discipline);
      setLevel(activeExam.level);
      setQuestionCount(activeExam.questionCount);
      setTimeLimitMinutes(activeExam.timeLimitMinutes);
    } else {
      setTitle('Examen Oficial CIM-10 - Convocatoria Ordinaria');
    }
  }, [activeExam]);

  const handleActivateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/active-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          discipline,
          level,
          questionCount,
          timeLimitMinutes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al activar examen');
      }

      setActiveExamState(data.exam);
      setMessage({ type: 'success', text: '¡Examen del Día activado correctamente! Ya está disponible en la Pizarra Digital y para los alumnos.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivateExam = async () => {
    if (!window.confirm('¿Seguro que deseas desactivar el Examen del Día actual?')) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/active-exam', { method: 'DELETE' });
      if (res.ok) {
        setActiveExamState(null);
        setMessage({ type: 'success', text: 'El examen activo ha sido desactivado.' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Error al desactivar el examen' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateAiCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAiGenerating(true);
    setMessage(null);
    setAiGeneratedCase(null);

    try {
      const res = await fetch('/api/admin/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discipline: aiDiscipline,
          level: aiLevel,
          topic: aiTopic,
          cim10Code: aiCode,
          saveDirectly: aiSaveDirectly,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar caso MEAP');
      }

      setAiGeneratedCase(data.case);
      setMessage({
        type: 'success',
        text: data.savedId
          ? `Caso generado con éxito y guardado en la base de datos (${data.savedId})`
          : 'Caso generado con éxito (modo borrador/previsualización).',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: `Fallo en el motor de generación: ${err.message}` });
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Navigation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <Sliders className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Configurador de Pruebas y Exámenes</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Diseña el Examen del Día para el grupo, activa la cuenta atrás en la Pizarra Digital y monitoriza en vivo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/kahoot"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Ronda Kahoot</span>
          </Link>
          <Link
            href="/test/inversa"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Cod. Inversa</span>
          </Link>
          <Link
            href="/pizarra"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>Pizarra Digital (Aula)</span>
          </Link>
          <Link
            href="/admin/en-vivo"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Monitor className="w-4 h-4" />
            <span>Monitor en Vivo</span>
          </Link>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Grid: Exam Configurator + Active Status Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Play className="w-4 h-4 text-brand-600" />
              <span>Configuración del Examen del Día</span>
            </h2>
            <p className="text-xs text-slate-500">
              Al activar este examen, los alumnos verán un aviso prioritario en su panel y sincronizará con la Pizarra.
            </p>
          </div>

          <form onSubmit={handleActivateExam} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Título de la Prueba / Convocatoria
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none"
                placeholder="Ej. Control 1: Urgencias y Traumatismos CIM-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Especialidad / Ámbito Asistencial
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value as ServiceArea)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none"
                >
                  {Object.entries(DISCIPLINE_CATALOG).map(([key, disc]) => (
                    <option key={key} value={key}>
                      {disc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nivel de Dificultad
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none"
                >
                  <option value={0}>0 · Adaptativo Inteligente (Fórmula 60/25/15)</option>
                  <option value={1}>Nivel 1: Básico y Motivo Principal</option>
                  <option value={2}>Nivel 2: Comorbilidades y Secundarios</option>
                  <option value={3}>Nivel 3: Lateralidad y 7º Carácter</option>
                  <option value={4}>Nivel 4: Casos Complejos y Neoplasias</option>
                  <option value={5}>Nivel 5: Auditoría MEAP Avanzada</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Número de Preguntas
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tiempo Límite (Minutos)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-brand-600 outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400">0 = sin límite</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              {activeExam?.isActive && (
                <button
                  type="button"
                  onClick={handleDeactivateExam}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Desactivar Examen Activo</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="ml-auto px-6 py-2.5 bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Activando...' : 'Activar como Examen del Día'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Status Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${activeExam?.isActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
              <span>Estado del Examen Actual</span>
            </h3>

            {activeExam?.isActive ? (
              <div className="space-y-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-slate-700">
                <div className="font-bold text-emerald-900 text-sm">{activeExam.title}</div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Ámbito</span>
                    <span className="font-semibold">{DISCIPLINE_CATALOG[activeExam.discipline]?.name || activeExam.discipline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Nivel</span>
                    <span className="font-semibold">{activeExam.level === 0 ? 'Adaptativo IA' : `Nivel ${activeExam.level}`}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Preguntas</span>
                    <span className="font-semibold">{activeExam.questionCount} casos</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-bold">Tiempo</span>
                    <span className="font-semibold">{activeExam.timeLimitMinutes > 0 ? `${activeExam.timeLimitMinutes} min` : 'Ilimitado'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Emitiendo en Aula
                  </span>
                  <Link
                    href="/pizarra"
                    target="_blank"
                    className="text-[11px] text-brand-700 hover:underline font-bold"
                  >
                    Ver Pizarra &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-2">
                <Clock className="w-6 h-6 text-slate-400 mx-auto" />
                <p>No hay ningún Examen del Día activo en este momento.</p>
                <p className="text-[11px] text-slate-400">Configura los parámetros a la izquierda y pulsa "Activar".</p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-brand-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Tv className="w-4 h-4" />
              <span>Pizarra Digital de Aula</span>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              Abre la Pizarra en el proyector de la clase. Mostrará el reloj gigante sincronizado, la IP de acceso local y el estado de la prueba.
            </p>
            <Link
              href="/pizarra"
              target="_blank"
              className="inline-block w-full text-center px-4 py-2 bg-white text-brand-900 rounded-xl text-xs font-bold shadow hover:bg-slate-100 transition-colors"
            >
              Proyectar Pizarra en Pantalla Completa
            </Link>
          </div>
        </div>

      </div>

      {/* AI MEAP Case Generator Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ASISTENTE IA PARA DOCENTES</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Generador Inteligente de Casos Clínicos MEAP
            </h2>
            <p className="text-xs text-slate-500">
              Genera nuevos casos con enunciado, 4 opciones y resolución razonada (análisis, camino CIM-10, reglas de exclusión y análisis de distractores).
            </p>
          </div>

          <span className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-lg text-slate-600 border border-slate-200">
            Motor: Ollama Local (11434) / Generador Clínico Offline
          </span>
        </div>

        <form onSubmit={handleGenerateAiCase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Especialidad
              </label>
              <select
                value={aiDiscipline}
                onChange={(e) => setAiDiscipline(e.target.value as ServiceArea)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none"
              >
                {Object.entries(DISCIPLINE_CATALOG).map(([key, disc]) => (
                  <option key={key} value={key}>{disc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nivel de Complejidad
              </label>
              <select
                value={aiLevel}
                onChange={(e) => setAiLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none"
              >
                <option value={1}>Nivel 1: Básico</option>
                <option value={2}>Nivel 2: Comorbilidades</option>
                <option value={3}>Nivel 3: Lateralidad/7º Carácter</option>
                <option value={4}>Nivel 4: Complejo/Neoplasias</option>
                <option value={5}>Nivel 5: Auditoría MEAP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tema / Patología (Opcional)
              </label>
              <input
                type="text"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Ej. Apendicitis aguda perforada"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Código CIM-10 Ref. (Opcional)
              </label>
              <input
                type="text"
                value={aiCode}
                onChange={(e) => setAiCode(e.target.value)}
                placeholder="Ej. K35.20"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-purple-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between pt-2 gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={aiSaveDirectly}
                onChange={(e) => setAiSaveDirectly(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
              />
              <span className="font-semibold">Guardar automáticamente en el banco oficial de preguntas</span>
            </label>

            <button
              type="submit"
              disabled={isAiGenerating}
              className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiGenerating ? 'Generando con IA...' : 'Generar Caso MEAP'}</span>
            </button>
          </div>
        </form>

        {/* AI Generated Preview */}
        {aiGeneratedCase && (
          <div className="p-6 bg-purple-50/40 rounded-xl border border-purple-200 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-200/60 pb-3">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Previsualización del Caso Generado
              </span>
              <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded border border-purple-300">
                Nivel {aiGeneratedCase.level} · {aiGeneratedCase.serviceContext}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{aiGeneratedCase.caseTitle}</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3.5 rounded-lg border border-purple-100">
                {aiGeneratedCase.clinicalScenario}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {aiGeneratedCase.options.map((opt: any) => (
                <div
                  key={opt.id}
                  className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                    opt.id === aiGeneratedCase.correctOptionId
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold text-[11px] w-5 h-5 rounded bg-slate-200 flex items-center justify-center flex-shrink-0">
                    {opt.id}
                  </span>
                  <div>
                    <span className="font-mono font-bold text-[11px] block">{opt.code}</span>
                    <span className="text-[11px] leading-snug">{opt.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 4-Block Reasoned Resolution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-[11px]">
                <strong className="block text-purple-900 mb-0.5">1. Análisis Clínico:</strong>
                <p className="text-slate-600">{aiGeneratedCase.reasonedResolution?.clinicalAnalysis}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-[11px]">
                <strong className="block text-purple-900 mb-0.5">2. Ruta CIM-10:</strong>
                <p className="text-slate-600 font-mono">{aiGeneratedCase.reasonedResolution?.cim10Path}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-[11px]">
                <strong className="block text-purple-900 mb-0.5">3. Verificación de Reglas:</strong>
                <p className="text-slate-600">{aiGeneratedCase.reasonedResolution?.ruleCheck}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-purple-100 text-[11px]">
                <strong className="block text-purple-900 mb-0.5">4. Justificación de Distractores:</strong>
                <p className="text-slate-600">
                  {Object.entries(aiGeneratedCase.reasonedResolution?.distractorExplanations || {})
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' | ')}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
