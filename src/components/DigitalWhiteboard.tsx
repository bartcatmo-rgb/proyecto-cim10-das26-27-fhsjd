'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Tv,
  Clock,
  Wifi,
  Maximize,
  Minimize,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import { DISCIPLINE_CATALOG } from '@/lib/cim10/disciplines';
import { ServiceArea } from '@/types';
import BrandLogo from '@/components/BrandLogo';

// Play offline synthetic web audio chime
function playChime(urgency: 'low' | 'medium' | 'high') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    const freqs = urgency === 'high' ? [880, 880, 1046] : urgency === 'medium' ? [659, 784] : [523, 659];
    
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.18);

      gain.gain.setValueAtTime(0.25, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.4);
    });
  } catch {
    // Ignore audio autoplay restrictions
  }
}

export default function DigitalWhiteboard() {
  const [exam, setExam] = useState<any | null>(null);
  const [serverTime, setServerTime] = useState<Date>(new Date());
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeAlert, setActiveAlert] = useState<{ minutes: number; message: string; color: string } | null>(null);
  const [hostIp, setHostIp] = useState<string>('0.0.0.0');

  // Track thresholds to trigger strictly once per threshold
  const triggeredRef = useRef<Record<number, boolean>>({
    15: false,
    10: false,
    5: false,
    2: false,
  });

  const fetchActiveExam = async () => {
    try {
      const res = await fetch('/api/admin/active-exam');
      if (res.ok) {
        const json = await res.json();
        setExam(json.activeExam);
        if (json.serverTime) {
          setServerTime(new Date(json.serverTime));
        }

        if (json.activeExam?.endsAt) {
          const ends = new Date(json.activeExam.endsAt).getTime();
          const now = Date.now();
          const diffSecs = Math.max(0, Math.floor((ends - now) / 1000));
          setSecondsRemaining(diffSecs);
        } else {
          setSecondsRemaining(null);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHostIp(window.location.hostname || '0.0.0.0');
    }

    fetchActiveExam();
    const interval = setInterval(fetchActiveExam, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1-second countdown decrement & threshold check
  useEffect(() => {
    if (secondsRemaining === null) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining]);

  // Monitor thresholds: 15, 10, 5, 2 minutes
  useEffect(() => {
    if (secondsRemaining === null) return;

    const checkThreshold = (minutes: number, label: string, color: string, urgency: 'low' | 'medium' | 'high') => {
      const targetSecs = minutes * 60;
      // Trigger if we are within [targetSecs - 2, targetSecs] and not already triggered
      if (secondsRemaining <= targetSecs && secondsRemaining > targetSecs - 3 && !triggeredRef.current[minutes]) {
        triggeredRef.current[minutes] = true;
        setActiveAlert({ minutes, message: label, color });
        if (soundEnabled) {
          playChime(urgency);
        }
        // Auto-dismiss alert banner after 12 seconds
        setTimeout(() => {
          setActiveAlert((current) => (current?.minutes === minutes ? null : current));
        }, 12000);
      }
    };

    checkThreshold(15, '¡ATENCIÓN: QUEDAN 15 MINUTOS! Organiza la codificación de los últimos casos.', 'bg-amber-600', 'low');
    checkThreshold(10, '¡AVISO: QUEDAN 10 MINUTOS! Verifica tus opciones y criterios de selección.', 'bg-orange-600', 'medium');
    checkThreshold(5, '¡URGENTE: ÚLTIMOS 5 MINUTOS! Revisa los códigos CIM-10 y notas de exclusión.', 'bg-rose-600', 'high');
    checkThreshold(2, '¡ÚLTIMOS 2 MINUTOS! Envío final inminente. No dejes preguntas sin marcar.', 'bg-red-700', 'high');

  }, [secondsRemaining, soundEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-10 select-none relative overflow-hidden">
      
      {/* Escalated Threshold Alert Banner */}
      {activeAlert && (
        <div className={`fixed top-0 left-0 right-0 z-50 py-3.5 px-6 text-white ${activeAlert.color} shadow-2xl flex items-center justify-between animate-pulse transition-all duration-300`}>
          <div className="flex items-center gap-3 mx-auto font-black text-sm sm:text-base tracking-wide">
            <BellRing className="w-6 h-6 animate-bounce" />
            <span>{activeAlert.message}</span>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-xs uppercase bg-black/30 hover:bg-black/50 px-3 py-1 rounded-md text-white font-bold"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* Top Bar: Center Brand + Network IP info + Audio & Fullscreen controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-md">
            <BrandLogo size="md" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              Pizarra Digital de Proyección en Aula · Red Local LAN
            </div>
          </div>
        </div>

        {/* Local Network Access IP Card & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <div className="text-xs">
              <span className="text-slate-400">Acceso Alumnos: </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                http://{hostIp}:3000
              </span>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 border rounded-xl transition-colors ${
              soundEnabled
                ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'Avisos sonoros ACTIVADOS (15, 10, 5, 2 min)' : 'Avisos sonoros SILENCIADOS'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 transition-colors"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Center Display */}
      <div className="my-auto py-10 text-center max-w-4xl mx-auto space-y-8">
        {exam?.isActive ? (
          <>
            {/* Exam Title & Specialty */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-widest">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                CONVOCATORIA EN CURSO · {DISCIPLINE_CATALOG[exam.discipline as ServiceArea]?.name || exam.discipline}
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {exam.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-400 pt-2">
                <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  Dificultad: <strong className="text-slate-200">{exam.level === 0 ? 'Adaptativo IA' : `Nivel ${exam.level}`}</strong>
                </span>
                <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  Total de Casos: <strong className="text-slate-200">{exam.questionCount} MEAP</strong>
                </span>
                <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                  Avisos de Aula: <strong className="text-emerald-400">15m · 10m · 5m · 2m</strong>
                </span>
              </div>
            </div>

            {/* Giant Countdown Clock */}
            {secondsRemaining !== null ? (
              <div className="py-6">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
                  Tiempo Restante de la Prueba
                </div>
                <div
                  className={`text-6xl sm:text-8xl md:text-9xl font-mono font-black tracking-tight ${
                    secondsRemaining < 120
                      ? 'text-red-500 animate-pulse'
                      : secondsRemaining < 300
                      ? 'text-rose-500 animate-pulse'
                      : secondsRemaining < 600
                      ? 'text-orange-400'
                      : 'text-amber-400'
                  }`}
                >
                  {formatCountdown(secondsRemaining)}
                </div>
                {secondsRemaining === 0 && (
                  <div className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl text-lg font-bold animate-bounce">
                    ¡TIEMPO FINALIZADO! ENTREGA OBLIGATORIA
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8">
                <div className="text-xs uppercase font-bold tracking-widest text-slate-400 mb-2">
                  Modalidad sin límite de tiempo
                </div>
                <div className="text-5xl sm:text-7xl font-mono font-bold text-slate-400">
                  --:--
                </div>
              </div>
            )}
          </>
        ) : (
          /* Standby Screen when no exam is currently active */
          <div className="space-y-6 py-12">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-600 shadow-xl">
              <Tv className="w-10 h-10 text-slate-400" />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                AulaCIM-10 · Sala de Codificación Clínica
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-lg mx-auto">
                No hay ningún examen activo en este momento. El docente activará la prueba desde el panel de control.
              </p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 max-w-md mx-auto text-left space-y-3">
              <div className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                Instrucciones para los alumnos en el aula:
              </div>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Abre el navegador web en tu equipo del instituto.</li>
                <li>Escribe en la barra de direcciones: <strong className="text-emerald-400 font-mono">http://{hostIp}:3000</strong></li>
                <li>Inicia sesión con tu DNI/NIE oficial o usuario de clase.</li>
                <li>Permanece a la espera de que el profesor active el test o introduce el enlace de prueba proporcionado.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className="pt-6 border-t border-slate-900 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>FHSJD · Departamento de Administración Sanitaria · Curso 2026/2027</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/kahoot"
            className="text-amber-400 hover:text-amber-300 font-bold transition-colors"
          >
            Lanzar Ronda Kahoot (10-20) &rarr;
          </Link>
          <Link
            href="/manuales"
            className="text-brand-400 hover:text-brand-300 font-bold transition-colors"
          >
            Manuales de Aula &rarr;
          </Link>
          <Link
            href="/admin/en-vivo"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Abrir Monitor en Vivo &rarr;
          </Link>
          <Link
            href="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Volver a la Portada
          </Link>
        </div>
      </div>

    </div>
  );
}
