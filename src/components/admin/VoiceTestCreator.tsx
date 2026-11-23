'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Mic,
  MicOff,
  Sparkles,
  Play,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { ServiceArea } from '@/types';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';

interface Props {
  activeCourseId?: string;
}

export default function VoiceTestCreator({ activeCourseId }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [dictatedText, setDictatedText] = useState('');
  const [title, setTitle] = useState('');
  const [courseId, setCourseId] = useState(activeCourseId || 'DAS-26-27');
  const [discipline, setDiscipline] = useState<ServiceArea>('simulacro_integral');
  const [level, setLevel] = useState(2);
  const [questionCount, setQuestionCount] = useState(5);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(15);
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    if (activeCourseId) {
      setCourseId(activeCourseId);
    }
  }, [activeCourseId]);

  const [generating, setGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'es-ES';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      setDictatedText(currentTranscript.trim());
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Tu navegador no soporta Web Speech API. Puedes escribir el texto directamente en el recuadro.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        setError(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleGenerateAndImplement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dictatedText.trim()) {
      setError('Por favor dicta o escribe un caso o descripción para generar la prueba.');
      return;
    }

    try {
      setGenerating(true);
      setError(null);
      setGeneratedResult(null);

      const res = await fetch('/api/admin/ai-voice-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: dictatedText,
          title: title || undefined,
          courseId,
          discipline,
          level,
          questionCount,
          timeLimitMinutes,
          autoPublish,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al generar la prueba.');
      }

      setGeneratedResult(data);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (code: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    navigator.clipboard.writeText(`${origin}/prueba/${code}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">
              Generador de Pruebas Clínicas por Dictado de Voz o Asistente IA
            </h3>
            <p className="text-xs text-slate-500">
              Dicta los casos clínicos desde el micrófono del aula o escribe el prompt. La IA los codifica, redacta las resoluciones de 4 bloques y los implementa de inmediato en SQLite.
            </p>
          </div>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleGenerateAndImplement} className="space-y-6">
          
          {/* Voice Dictation Card */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span>Enunciado o Caso Clínico (Voz o Teclado):</span>
              </label>

              {speechSupported && (
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200'
                  }`}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span>{isRecording ? 'Detener Grabación' : 'Dictar por Micrófono'}</span>
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={4}
                required
                value={dictatedText}
                onChange={(e) => setDictatedText(e.target.value)}
                placeholder="Dicta o escribe aquí el caso clínico, por ejemplo: 'Paciente de 62 años que acude a Urgencias por fractura cerrada de tibia distal derecha tras caída casual. Se reduce y estabiliza...'"
                className="w-full p-4 border border-slate-300 rounded-2xl text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
              />
              {isRecording && (
                <div className="absolute top-3 right-3 flex items-center gap-2 bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full border border-rose-300">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>Escuchando en vivo...</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Ideas para dictar:</span>
              <button
                type="button"
                onClick={() => setDictatedText('Paciente varón de 58 años que acude a urgencias por dolor precordial opresivo con elevación del ST anteroseptal. Se realiza angioplastia primaria y colocación de stent.')}
                className="hover:text-brand-600 underline"
              >
                Infarto agudo de miocardio
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setDictatedText('Mujer de 72 años con diabetes tipo 2 e hipertensión que ingresa por neumonía lobar por Streptococcus pneumoniae con insuficiencia respiratoria aguda.')}
                className="hover:text-brand-600 underline"
              >
                Neumonía en paciente diabético
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setDictatedText('Paciente de 45 años intervenido mediante colecistectomía laparoscópica por colelitiasis sintomática con colecistitis crónica calculosa.')}
                className="hover:text-brand-600 underline"
              >
                Colelitiasis y Cirugía
              </button>
            </div>
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Título de la Convocatoria:</label>
              <input
                type="text"
                placeholder="Opcional (se infiere si está vacío)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Curso Destino:</label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value.toUpperCase())}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nº de Casos a Generar (1 a 10):</label>
              <input
                type="number"
                min={1}
                max={10}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tiempo de la Prueba (minutos):</label>
              <input
                type="number"
                min={0}
                max={120}
                value={timeLimitMinutes}
                onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Auto-publish checkbox */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span>Lanzar inmediatamente en Vivo para los alumnos (sin reiniciar servidor)</span>
            </label>
            <span className="text-[11px] text-emerald-700 font-semibold hidden sm:inline">
              Auto-implementación Atómica en SQLite
            </span>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando Casos e Implementando en Base de Datos...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generar e Implementar Inmediatamente</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success / Generated Test Card */}
        {generatedResult && (
          <div className="mt-6 p-6 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{generatedResult.message}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400">Código de Convocatoria Directa:</span>
                <div className="text-xl font-mono font-black text-brand-700">
                  {generatedResult.test?.code}
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  {generatedResult.test?.title}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyLink(generatedResult.test?.code)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Enlace Copiado!' : 'Copiar Enlace Alumno'}</span>
                </button>

                <Link
                  href={`/prueba/${generatedResult.test?.code}`}
                  target="_blank"
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Abrir Prueba</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Sample Question preview */}
            {generatedResult.sampleQuestion && (
              <div className="p-4 bg-white/70 rounded-xl border border-emerald-100 text-xs space-y-2">
                <div className="font-bold text-slate-800">
                  Muestra de Caso Generado: {generatedResult.sampleQuestion.caseTitle}
                </div>
                <p className="text-slate-600">{generatedResult.sampleQuestion.clinicalScenario}</p>
                <div className="pt-1 font-mono font-bold text-emerald-800">
                  Código Correcto Asignado: {generatedResult.sampleQuestion.options?.find((o: any) => o.id === generatedResult.sampleQuestion.correctOptionId)?.code}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
