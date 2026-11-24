import React from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth/session';
import { getStudentDisciplineProgress, getStudentErrorSynthesis, getNotices, getActiveExam } from '@/lib/db/queries';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import {
  Stethoscope,
  Award,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Pin,
  Sparkles,
  BookOpen,
  ShieldAlert,
  Zap,
  Trophy,
  History,
  MessageSquare,
  Tv,
} from 'lucide-react';
import PublicLandingView from '@/components/PublicLandingView';
import TopicIndexView from '@/components/TopicIndexView';

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) {
    return <PublicLandingView />;
  }

  const progressMap = getStudentDisciplineProgress(user.id);
  const errorSynthesis = getStudentErrorSynthesis(user.id);
  const notices = getNotices();
  const activeExam = getActiveExam();
  const isDocenteOrAdmin = user.role === 'admin' || user.activeRole === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curso 2026/2027 · Fundación Hospital San Juan de Dios</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            AulaCIM-10 · FHSJD <span className="text-brand-400 font-medium">(DAS 26/27)</span>
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-300 leading-relaxed">
            Plataforma docente especializada en <strong className="text-white">Codificación Clínica CIM-10</strong> bajo el modelo <strong className="text-white">MEAP</strong>. Entrena casos reales divididos por ámbitos asistenciales, escala a través de los 5 niveles progresivos y perfecciona tus criterios de selección de Diagnóstico Principal.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/entrenamiento"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-400 text-slate-950 transition-all shadow-md shadow-brand-500/20"
            >
              <Award className="w-4 h-4" />
              <span>Entrenar Casos Clínicos</span>
            </Link>

            {user && errorSynthesis && errorSynthesis.totalMistakes > 0 && (
              <Link
                href="/test/repaso"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600/90 hover:bg-rose-500 text-white transition-all border border-rose-500/40"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Repasar {errorSynthesis.totalMistakes} Fallos</span>
              </Link>
            )}

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Buscador Catálogo CIM-10</span>
            </Link>

            <Link
              href="/examenes-realizados"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <History className="w-4 h-4" />
              <span>Exámenes del Curso</span>
            </Link>

            <Link
              href="/manuales"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>Manuales</span>
            </Link>

            {isDocenteOrAdmin && (
              <Link
                href="/presentacion"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 transition-all shadow-sm"
              >
                <Tv className="w-4 h-4 text-purple-400" />
                <span>Presentación Programa (Voz Neural)</span>
              </Link>
            )}

            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 transition-all shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat de Aula / Consultas</span>
            </Link>
          </div>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none hidden lg:block">
          <Stethoscope className="w-96 h-96 text-brand-400" />
        </div>
      </section>

      {/* Active Exam del Día Alert Banner */}
      {activeExam?.isActive && (
        <section className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-emerald-500/30 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              CONVOCATORIA ACTIVA · EXAMEN DEL DÍA
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">{activeExam.title}</h2>
            <div className="flex flex-wrap gap-4 text-xs text-emerald-100">
              <span>Ámbito: <strong>{DISCIPLINE_CATALOG[activeExam.discipline]?.name || activeExam.discipline}</strong></span>
              <span>Dificultad: <strong>{activeExam.level === 0 ? 'Adaptativo IA' : `Nivel ${activeExam.level}`}</strong></span>
              <span>Casos: <strong>{activeExam.questionCount} preguntas</strong></span>
              <span>Tiempo: <strong>{activeExam.timeLimitMinutes > 0 ? `${activeExam.timeLimitMinutes} minutos` : 'Sin límite'}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={
                activeExam.level === 0
                  ? `/test/adaptativo?discipline=${activeExam.discipline}&count=${activeExam.questionCount}&examId=${activeExam.id}&timeLimit=${activeExam.timeLimitMinutes}`
                  : `/test/${activeExam.discipline}/${activeExam.level}?examId=${activeExam.id}&timeLimit=${activeExam.timeLimitMinutes}`
              }
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>Comenzar Examen Oficial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Adaptive Mode Promotion Card */}
      <section className="bg-gradient-to-r from-indigo-900 via-brand-900 to-purple-950 text-white rounded-2xl p-6 sm:p-7 shadow-md border border-indigo-500/20 flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NUEVO · MOTOR ADAPTATIVO DINÁMICO IA</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Entrenamiento Inteligente Personalizado</h2>
          <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Nuestra IA analiza tus fallos históricos y genera un test a medida con la Fórmula de Oro (60% refuerzo en fallos habituales, 25% reto de progresión y 15% consolidación).
          </p>
        </div>

        <Link
          href="/test/adaptativo"
          className="px-5 py-2.5 bg-white text-brand-950 hover:bg-slate-100 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-2"
        >
          <span>Iniciar Test Adaptativo</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* 2 New Interactive Modalities: Codificación Inversa & Ronda Tipo Kahoot */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Codificación Inversa */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border-2 border-amber-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>NUEVA MODALIDAD · AUDITORÍA CLÍNICA</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Codificación Inversa: Detección y Corrección
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enfrenta casos clínicos con una codificación inicial propuesta que contiene un fallo intencionado (lateralidad, complicación omitida, Excluye 1 o 7º carácter). Identifica el error y asigna el código oficial correcto.
            </p>
          </div>

          <Link
            href="/test/inversa"
            className="inline-flex items-center justify-between px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <span>Iniciar Auditoría Inversa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Card 2: Ronda Tipo Kahoot */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-2xl border-2 border-purple-200/80 p-6 sm:p-7 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
              <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
              <span>MODALIDAD COMPETITIVA · 10 A 20 PREGUNTAS</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Ronda Tipo Kahoot con Podio 1º, 2º y 3º
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Rondas contrarreloj con 25 segundos por caso y 4 botones geométricos. Bonificación por rapidez, rachas consecutivas de acierto y podio visual con trofeo de oro, plata y bronce.
            </p>
          </div>

          <Link
            href="/kahoot"
            className="inline-flex items-center justify-between px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
          >
            <span>Lanzar Ronda Kahoot</span>
            <Trophy className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Student Progress Overview Strip */}
      {user && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                <span>Tu Estado Académico en el Aula</span>
              </h2>
              <p className="text-xs text-slate-500">
                Alumno: <strong className="text-slate-800">{user.fullName}</strong> ({user.academicGroup})
              </p>
            </div>
            <Link
              href="/historial"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Ver historial de intentos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Disciplinas Activas</span>
              <div className="mt-1 text-2xl font-black text-slate-900">7 / 7</div>
              <span className="text-[11px] text-teal-600 font-medium">Ámbitos MEAP oficiales</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Nivel Máximo Desbloqueado</span>
              <div className="mt-1 text-2xl font-black text-slate-900">
                {progressMap
                  ? Math.max(...Object.values(progressMap).map((p) => p.highestUnlockedLevel), 1)
                  : 1} / 5
              </div>
              <span className="text-[11px] text-slate-500">Escalón progresivo</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Fallos para Repaso</span>
              <div className="mt-1 text-2xl font-black text-rose-600">
                {errorSynthesis?.totalMistakes || 0}
              </div>
              <span className="text-[11px] text-slate-500">Preguntas pendientes</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <span className="text-xs font-medium text-slate-500">Nota Media Acumulada</span>
              <div className="mt-1 text-2xl font-black text-brand-700">
                {progressMap && Object.values(progressMap).length > 0
                  ? (
                      Object.values(progressMap).reduce((acc, curr) => acc + curr.averageScore, 0) /
                      Object.values(progressMap).length
                    ).toFixed(1)
                  : '0.0'}%
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">Media ponderada</span>
            </div>
          </div>
        </section>
      )}

      {/* Catálogo Modular de Temarios Oficiales y Curva de Rendimiento */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Temarios y Módulos Formativos Oficiales (DAS 26/27)
          </h2>
          <p className="text-sm text-slate-600">
            Explora las directrices normativas oficiales, realiza exámenes temáticos de autoevaluación o consulta tu curva de progreso.
          </p>
        </div>
        <TopicIndexView />
      </section>

      {/* Grid of the 7 MEAP Disciplines */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Ámbitos Asistenciales de Codificación (MEAP)
          </h2>
          <p className="text-sm text-slate-600">
            Selecciona una disciplina para iniciar un entrenamiento clínico por niveles del 1 (Principiante) al 5 (Experto).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ALL_SERVICE_AREAS.map((areaKey) => {
            const disc = DISCIPLINE_CATALOG[areaKey];
            const prog = progressMap ? progressMap[areaKey] : null;
            const currentLvl = prog?.currentLevel || 1;
            const maxLvl = prog?.highestUnlockedLevel || 1;
            const avgScore = prog?.averageScore || 0;
            const attempts = prog?.attemptsCount || 0;

            return (
              <div
                key={areaKey}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${disc.bgLight}`}>
                      {disc.badge}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">Nivel {maxLvl}</span>
                      <span>/ 5</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {disc.name}
                  </h3>

                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {disc.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {disc.keyConcepts.slice(0, 3).map((concept, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        {concept}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{attempts}</span> intentos ·{' '}
                    <span className="font-bold text-brand-700">{avgScore}%</span> media
                  </div>

                  <Link
                    href={`/test/${areaKey}/${maxLvl}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Entrenar N{maxLvl}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tablón de Avisos y Consejos */}
      {notices.length > 0 && (
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-500" />
              <span>Tablón de Avisos Docentes</span>
            </h2>
            <span className="text-xs text-slate-400">Coordinación DAS 26/27</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className={`p-4 rounded-xl border ${
                  notice.isPinned
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>{notice.title}</span>
                  {notice.isPinned && (
                    <span className="text-[10px] bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                      Fijado
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {notice.content}
                </p>
                <div className="mt-3 text-[10px] text-slate-400">
                  Por {notice.authorName} · {new Date(notice.createdAt).toLocaleDateString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
