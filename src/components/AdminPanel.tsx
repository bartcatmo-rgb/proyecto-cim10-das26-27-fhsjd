'use client';

import React, { useState } from 'react';
import { User, GroupAnalytics, AcademicCourse } from '@/types';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import {
  Shield,
  Users,
  TrendingUp,
  FileText,
  Pin,
  HardDrive,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  Eye,
  Sparkles,
  Search,
  Sliders,
  Monitor,
  Tv,
  Mic,
  BookOpen,
  History,
  Calendar,
  PlusCircle,
  Loader2,
  X,
} from 'lucide-react';
import Link from 'next/link';
import CourseStudentsManager from './admin/CourseStudentsManager';
import HistoricalAuditViewer from './admin/HistoricalAuditViewer';
import TestManagerPanel from './admin/TestManagerPanel';
import VoiceTestCreator from './admin/VoiceTestCreator';
import SecurityAuditViewer from './admin/SecurityAuditViewer';
import TopicManagerPanel from './admin/TopicManagerPanel';

interface Props {
  adminUser: User;
  analytics: GroupAnalytics;
  students: Array<User & { maskedDni: string; totalAttempts: number; avgScore: number }>;
  initialCourses?: AcademicCourse[];
  initialCourseId?: string;
}

export default function AdminPanel({ adminUser, analytics, students, initialCourses, initialCourseId }: Props) {
  const [activeTab, setActiveTab] = useState<
    'group' | 'course_students' | 'history_audit' | 'test_manager' | 'topic_manager' | 'voice_ai' | 'students' | 'report_gen' | 'notices' | 'backup' | 'security_logs'
  >('group');

  // Academic year / course selection state
  const [courses, setCourses] = useState<AcademicCourse[]>(
    initialCourses || [
      { id: 'DAS-26-27', name: 'Curso 2026/2027 · DAS', isCurrent: true, startDate: '2026-09-01', createdAt: '' },
      { id: 'DAS-25-26', name: 'Curso 2025/2026 · DAS (Histórico)', isCurrent: false, startDate: '2025-09-01', createdAt: '' },
    ]
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aulacim10_admin_active_academic_year');
      if (saved) return saved;
    }
    return initialCourseId || 'DAS-26-27';
  });

  const [currentAnalytics, setCurrentAnalytics] = useState<GroupAnalytics>(analytics);
  const [currentStudents, setCurrentStudents] = useState<Array<User & { maskedDni: string; totalAttempts: number; avgScore: number }>>(students);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  // New academic year modal state
  const [showYearModal, setShowYearModal] = useState(false);
  const [newYearCode, setNewYearCode] = useState('');
  const [newYearName, setNewYearName] = useState('');
  const [newYearIsCurrent, setNewYearIsCurrent] = useState(false);
  const [yearSaving, setYearSaving] = useState(false);

  const fetchMetricsForCourse = async (courseId: string) => {
    try {
      setLoadingMetrics(true);
      const res = await fetch(`/api/admin/metrics?courseId=${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentAnalytics(data.analytics);
        setCurrentStudents(data.students || []);
        if (data.courses) setCourses(data.courses);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleSelectYear = (courseId: string) => {
    setSelectedCourseId(courseId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aulacim10_admin_active_academic_year', courseId);
    }
    fetchMetricsForCourse(courseId);
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearCode || !newYearName) return;

    try {
      setYearSaving(true);
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newYearCode,
          name: newYearName,
          isCurrent: newYearIsCurrent,
        }),
      });

      if (res.ok) {
        setShowYearModal(false);
        const createdCode = newYearCode.toUpperCase().trim();
        setNewYearCode('');
        setNewYearName('');
        setNewYearIsCurrent(false);
        handleSelectYear(createdCode);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al registrar año académico.');
      }
    } catch {
      alert('Error de conexión al registrar año académico.');
    } finally {
      setYearSaving(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const isCurrentYear = Boolean(selectedCourse?.isCurrent);
  
  // Student selection for individual review / report drafting
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentStudents.length > 0 ? currentStudents[0].id : ''
  );

  // Notice form state
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticePinned, setNoticePinned] = useState(false);
  const [noticeStatus, setNoticeStatus] = useState<string | null>(null);

  // Report generator form state
  const selectedStudent = currentStudents.find((s) => s.id === selectedStudentId);
  const [reportTitle, setReportTitle] = useState('Informe de Rendimiento y Recomendaciones MEAP - DAS 26/27');
  const [reportContent, setReportContent] = useState('');
  const [reportStrengths, setReportStrengths] = useState('');
  const [reportWeaknesses, setReportWeaknesses] = useState('');
  const [reportFocus, setReportFocus] = useState('');
  const [reportStatus, setReportStatus] = useState<string | null>(null);

  // Auto-draft report based on student metrics
  const handleAutoDraft = () => {
    if (!selectedStudent) return;
    const avg = selectedStudent.avgScore;
    const attempts = selectedStudent.totalAttempts;

    let draftContent = `Estimado/a ${selectedStudent.fullName}:\n\nTras el análisis de tus ${attempts} intentos registrados en la plataforma AulaCIM-10 con una media de ${avg}%, evaluamos tu progreso técnico en el módulo de Codificación Clínica y MEAP.`;
    let draftStrengths = 'Demuestras constancia en el entrenamiento y buena asimilación en la estructura básica de los capítulos.';
    let draftWeaknesses = 'Es necesario extremar la precaución en las notas de Excluye 1 y la lateralidad en el Capítulo 19.';
    let draftFocus = 'Entrenar específicamente los casos de Especializada Médica y Urgencias de Nivel 3 y 4 antes del examen oficial.';

    if (avg >= 85) {
      draftStrengths = 'Excelente dominio de la jerarquía diagnóstica y aplicación rigurosa de las notas de inclusión y exclusión.';
      draftWeaknesses = 'Mantener la atención al detalle en códigos combinados de causa externa.';
      draftFocus = 'Completar los simulacros integrales de Nivel 5 de alta complejidad hospitalaria.';
    } else if (avg < 70) {
      draftWeaknesses = 'Dificultad recurrente en diferenciar Diagnóstico Principal de secundarios y olvido de códigos combinados.';
      draftFocus = 'Realizar el Test de Repaso de Errores y repasar las normas de codificación en el Catálogo CIM-10.';
    }

    setReportContent(draftContent);
    setReportStrengths(draftStrengths);
    setReportWeaknesses(draftWeaknesses);
    setReportFocus(draftFocus);
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !reportContent) return;

    setReportStatus('Enviando...');
    try {
      const res = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudentId,
          title: reportTitle,
          content: reportContent,
          strengths: reportStrengths,
          weaknesses: reportWeaknesses,
          recommendedFocus: reportFocus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setReportStatus(`Error: ${data.error}`);
        return;
      }

      setReportStatus('¡Informe depositado con éxito en el buzón del alumno!');
    } catch {
      setReportStatus('Error de conexión al enviar el informe.');
    }
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setNoticeStatus('Publicando...');
    try {
      const res = await fetch('/api/admin/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: noticeTitle,
          content: noticeContent,
          isPinned: noticePinned,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNoticeStatus(`Error: ${data.error}`);
        return;
      }

      setNoticeStatus('¡Aviso publicado correctamente en el tablón general!');
      setNoticeTitle('');
      setNoticeContent('');
      setNoticePinned(false);
    } catch {
      setNoticeStatus('Error al publicar aviso.');
    }
  };

  const handleBackupExport = () => {
    window.open('/api/admin/backup', '_blank');
  };

  const handleBackupImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        const res = await fetch('/api/admin/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        const data = await res.json();
        if (res.ok) {
          alert('Copia restaurada exitosamente.');
          window.location.reload();
        } else {
          alert(`Error: ${data.error}`);
        }
      } catch (err: any) {
        alert('Archivo JSON no válido.');
      }
    };
    reader.readAsText(file);
  };

  const handleRgpdExport = (studentId: string) => {
    window.open(`/api/admin/users/${studentId}/export`, '_blank');
  };

  const handleRgpdAnonymize = async (studentId: string, studentName: string) => {
    if (!window.confirm(`¿Confirmas la supresión y anonimización irreversible de los datos personales de "${studentName}" (Art. 17 RGPD)? Sus datos personales serán purgados y solo se conservarán estadísticas agregadas no identificables.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${studentId}/anonymize`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al anonimizar expediente');
        return;
      }
      alert(data.message || 'Expediente anonimizado conforme al Art. 17 RGPD.');
      fetchMetricsForCourse(selectedCourseId);
    } catch {
      alert('Error de conexión al procesar la solicitud RGPD.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Panel de Coordinación Docente · FHSJD
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Seguimiento de alumnos, métricas del grupo, redacción de informes tutoriales y gestión de persistencia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/pruebas"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Configurar Examen</span>
          </Link>
          <Link
            href="/admin/en-vivo"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Monitor className="w-4 h-4" />
            <span>Monitor Aula</span>
          </Link>
          <Link
            href="/pizarra"
            target="_blank"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Tv className="w-4 h-4" />
            <span>Pizarra</span>
          </Link>
          <div className="text-xs bg-purple-50 border border-purple-200 text-purple-900 font-semibold px-3 py-1.5 rounded-xl">
            Profesor: {adminUser.fullName}
          </div>
        </div>
      </div>

      {/* SELECTOR DE AÑO ACADÉMICO DE TRABAJO */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Año Académico de Trabajo:
            </span>
          </div>

          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => handleSelectYear(e.target.value)}
              className="text-sm font-extrabold bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 pr-8 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm transition"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.name} {c.isCurrent ? '★ (Año Actual)' : '⤹ (Histórico)'}
                </option>
              ))}
            </select>
          </div>

          {/* Badge indicator: Current vs Historical */}
          {isCurrentYear ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Año Académico Actual (En curso)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm">
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>Año Académico Pasado (Auditoría / Histórico)</span>
            </span>
          )}

          {loadingMetrics && (
            <span className="text-xs text-brand-600 flex items-center gap-1 font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Sincronizando...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowYearModal(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 text-brand-600" />
            <span>Registrar Nuevo Año Académico</span>
          </button>
        </div>
      </div>

      {/* Historical Audit Warning Banner */}
      {!isCurrentYear && (
        <div className="bg-amber-50/95 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong>Modo Histórico / Auditoría:</strong> Estás consultando el año académico cerrado{' '}
            <strong>{selectedCourse?.name || selectedCourseId}</strong>. Los datos, expedientes, notas y progresos se presentan en modo de consulta y auditoría histórica para salvaguardar las promociones pasadas.
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'group', label: 'Evolución del Grupo', icon: TrendingUp },
          { id: 'topic_manager', label: 'Temarios y PDFs (IA)', icon: BookOpen },
          { id: 'test_manager', label: 'Configurador de Pruebas', icon: Sliders },
          { id: 'course_students', label: 'Alumnos por Curso', icon: BookOpen },
          { id: 'history_audit', label: 'Repositorio Histórico', icon: History },
          { id: 'voice_ai', label: 'Asistente de Voz / IA', icon: Mic },
          { id: 'students', label: 'Evolución por Alumno', icon: Users },
          { id: 'report_gen', label: 'Generador de Reportes', icon: FileText },
          { id: 'notices', label: 'Tablón de Avisos', icon: Pin },
          { id: 'backup', label: 'Copias de Seguridad', icon: HardDrive },
          { id: 'security_logs', label: 'Auditoría CISO / Logs', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GROUP EVOLUTION */}
      {activeTab === 'group' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Alumnos Matriculados</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{currentAnalytics.totalStudents}</div>
              <span className="text-[11px] text-teal-600 font-semibold">{selectedCourse?.name || selectedCourseId}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Tests Evaluados</span>
              <div className="mt-1 text-3xl font-black text-slate-900">{currentAnalytics.totalAttempts}</div>
              <span className="text-[11px] text-slate-500">Intentos en este año lectivo</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Media Global del Año</span>
              <div className="mt-1 text-3xl font-black text-brand-700">{currentAnalytics.overallAverage}%</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Rendimiento colectivo</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 font-medium">Estado del Año Académico</span>
              <div className="mt-1 text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isCurrentYear ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span>{isCurrentYear ? 'Año Activo (En Curso)' : 'Año Cerrado (Histórico)'}</span>
              </div>
              <span className="text-[11px] text-slate-500">Persistencia SQLite garantizada</span>
            </div>
          </div>

          {/* Discipline Averages Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              Media de Rendimiento por Ámbito Asistencial (MEAP) · {selectedCourse?.name || selectedCourseId}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SERVICE_AREAS.map((key) => {
                const disc = DISCIPLINE_CATALOG[key];
                const data = currentAnalytics.disciplineAverages[key] || { avgScore: 0, attempts: 0 };

                return (
                  <div key={key} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">{disc.name}</span>
                      <span className="text-brand-700 font-mono text-sm">{data.avgScore}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-2 rounded-full"
                        style={{ width: `${data.avgScore}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {data.attempts} evaluaciones completadas
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collective Errors Ranking */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>Ranking de Errores Colectivos en el Aula ({selectedCourseId})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
                <span className="font-bold text-rose-900 block mb-1">Notas de Excluye 1 y 2</span>
                <p className="text-slate-600 text-[11px]">
                  Frecuencia de codificación simultánea de afecciones mutuamente excluyentes en hospitalización.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
                <span className="font-bold text-amber-900 block mb-1">Jerarquía Diagnóstica</span>
                <p className="text-slate-600 text-[11px]">
                  Confusión entre el motivo que justificó la admisión (DP) y las complicaciones sobrevenidas.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
                <span className="font-bold text-indigo-900 block mb-1">Lateralidad y 7º Carácter</span>
                <p className="text-slate-600 text-[11px]">
                  Omisión de lateralidad derecha/izquierda y del carácter de contacto inicial A en Urgencias.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ALUMNOS POR CURSO */}
      {activeTab === 'course_students' && (
        <CourseStudentsManager
          activeCourseId={selectedCourseId}
          onCourseCreated={() => fetchMetricsForCourse(selectedCourseId)}
        />
      )}

      {/* TAB: REPOSITORIO HISTÓRICO DE AUDITORÍA */}
      {activeTab === 'history_audit' && <HistoricalAuditViewer activeCourseId={selectedCourseId} />}

      {/* TAB: GESTIÓN DE TEMARIOS Y PDFS CON IA */}
      {activeTab === 'topic_manager' && <TopicManagerPanel />}

      {/* TAB: CONFIGURADOR DE PRUEBAS */}
      {activeTab === 'test_manager' && <TestManagerPanel activeCourseId={selectedCourseId} />}

      {/* TAB: ASISTENTE DE VOZ / IA */}
      {activeTab === 'voice_ai' && <VoiceTestCreator activeCourseId={selectedCourseId} />}

      {/* TAB 2: STUDENTS EVOLUTION */}
      {activeTab === 'students' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Listado Oficial de Alumnos</h2>
              <p className="text-xs text-slate-500">
                Consulta individualizada. El DNI completo solo es accesible desde la sesión docente autorizada.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-left font-bold">
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-4">DNI / NIE</th>
                  <th className="py-3 px-4">Grupo</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-center">Intentos</th>
                  <th className="py-3 px-4 text-center">Nota Media</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {currentStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{st.fullName}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {st.dniNie}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{st.academicGroup}</td>
                    <td className="py-3 px-4 text-slate-600">{st.email}</td>
                    <td className="py-3 px-4 text-center font-bold">{st.totalAttempts}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        st.avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {st.avgScore}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setActiveTab('report_gen');
                        }}
                        className="text-brand-700 hover:text-brand-800 font-bold bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                      >
                        Emitir Informe
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRgpdExport(st.id)}
                        className="text-indigo-700 hover:text-indigo-800 font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                        title="Exportar datos personales (Art. 15 y 20 RGPD)"
                      >
                        Exportar JSON
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRgpdAnonymize(st.id, st.fullName)}
                        className="text-rose-700 hover:text-rose-800 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors text-[11px]"
                        title="Anonimizar irreversiblemente (Art. 17 RGPD)"
                      >
                        Anonimizar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REPORT GENERATOR */}
      {activeTab === 'report_gen' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-600" />
              <span>Generador y Envío de Reportes y Consejos</span>
            </h2>
            <p className="text-xs text-slate-500">
              Genera automáticamente un borrador basado en las métricas reales del alumno, ajústalo según tu criterio docente y deposítalo directamente en su buzón.
            </p>
          </div>

          {reportStatus && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
              <span>{reportStatus}</span>
            </div>
          )}

          <form onSubmit={handleSendReport} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Seleccionar Alumno Destinatario *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="block w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {currentStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.academicGroup}) - Nota: {s.avgScore}%
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Título del Informe
                </label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="block w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAutoDraft}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold rounded-lg border border-brand-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>Autogenerar borrador según métricas del alumno</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido General y Comentario del Profesor *
              </label>
              <textarea
                required
                rows={4}
                value={reportContent}
                onChange={(e) => setReportContent(e.target.value)}
                placeholder="Escribe aquí las observaciones docentes para el alumno..."
                className="block w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-emerald-800 mb-1">
                  Fortalezas Detectadas
                </label>
                <textarea
                  rows={2}
                  value={reportStrengths}
                  onChange={(e) => setReportStrengths(e.target.value)}
                  className="block w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-800 mb-1">
                  Áreas de Mejora / Fallos Habituales
                </label>
                <textarea
                  rows={2}
                  value={reportWeaknesses}
                  onChange={(e) => setReportWeaknesses(e.target.value)}
                  className="block w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-900 mb-1">
                Plan de Refuerzo Prioritario
              </label>
              <input
                type="text"
                value={reportFocus}
                onChange={(e) => setReportFocus(e.target.value)}
                className="block w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Depositar Informe en Buzón del Alumno</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: NOTICES */}
      {activeTab === 'notices' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Pin className="w-5 h-5 text-amber-500" />
              <span>Publicar Aviso en el Tablón General</span>
            </h2>
            <p className="text-xs text-slate-500">
              Los avisos serán visibles de forma inmediata en la pantalla de inicio de todos los alumnos de DAS 26/27.
            </p>
          </div>

          {noticeStatus && (
            <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-600" />
              <span>{noticeStatus}</span>
            </div>
          )}

          <form onSubmit={handlePublishNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título del Aviso *
              </label>
              <input
                type="text"
                required
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Ej. Recordatorio: Examen de Prácticas de Especializada Quirúrgica"
                className="block w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido del Aviso *
              </label>
              <textarea
                required
                rows={3}
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Detalla las instrucciones o fechas para los alumnos..."
                className="block w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinNotice"
                checked={noticePinned}
                onChange={(e) => setNoticePinned(e.target.checked)}
                className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="pinNotice" className="text-xs font-semibold text-slate-700">
                Fijar este aviso en la parte superior del tablón
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-xl transition-colors"
            >
              Publicar Aviso
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-teal-600" />
              <span>Copias de Seguridad y Portabilidad (USB / Aula / Vercel)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Exporta y restaura copias completas de la base de datos (alumnos, intentos, progreso, catálogo y preguntas).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Export */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600" />
                <span>Exportar Copia de Seguridad (.json)</span>
              </h3>
              <p className="text-xs text-slate-600">
                Descarga un volcado íntegro de todas las tablas en un único archivo JSON para guardar en tu pendrive o llevar a otro ordenador.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleBackupExport}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Backup JSON</span>
                </button>
              </div>
            </div>

            {/* Import */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-purple-600" />
                <span>Restaurar Copia de Seguridad (.json)</span>
              </h3>
              <p className="text-xs text-slate-600">
                Restaura alumnos, progresos y registros desde un archivo JSON exportado previamente en el aula.
              </p>
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Seleccionar Archivo JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleBackupImport}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 10: SECURITY AUDIT & CISO LOGS */}
      {activeTab === 'security_logs' && (
        <SecurityAuditViewer />
      )}

      {/* Modal: Registrar Nuevo Año Académico */}
      {showYearModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                Registrar Nuevo Año Académico
              </h3>
              <button
                type="button"
                onClick={() => setShowYearModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código del Año / Curso (ej. DAS-27-28):</label>
                <input
                  type="text"
                  required
                  placeholder="DAS-27-28"
                  value={newYearCode}
                  onChange={(e) => setNewYearCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase font-bold text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo de la Promoción:</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Curso 2027/2028 · DAS"
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newYearIsCurrent}
                    onChange={(e) => setNewYearIsCurrent(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>Establecer como Año Académico Actual en Vigor</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  Si se marca, pasará a ser el curso activo por defecto para las nuevas matrículas y exámenes del centro.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowYearModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={yearSaving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {yearSaving ? 'Guardando...' : 'Registrar Año'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
