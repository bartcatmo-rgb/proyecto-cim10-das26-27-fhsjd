'use client';

import React, { useState } from 'react';
import { User, StudentReport, DisciplineProgress } from '@/types';
import { DISCIPLINE_CATALOG, ALL_SERVICE_AREAS } from '@/lib/cim10/disciplines';
import { maskDni } from '@/lib/auth/validation';
import {
  User as UserIcon,
  Mail,
  Phone,
  Hash,
  Users,
  Award,
  FileText,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Calendar,
} from 'lucide-react';

interface Props {
  user: User;
  reports: StudentReport[];
  progressMap: Record<string, DisciplineProgress>;
}

export default function StudentProfileView({ user, reports, progressMap }: Props) {
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(
    reports.length > 0 ? reports[0] : null
  );

  // Edit personal profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [fullName, setFullName] = useState(user.fullName || '');
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [academicGroup, setAcademicGroup] = useState(user.academicGroup || '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveMsg(null);
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          academicGroup,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar.');
      }
      setSaveMsg('Datos actualizados correctamente.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setSaveMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Printable Report Overlay when printing */}
      {selectedReport && (
        <div className="hidden print:block printable-card">
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <h1 className="text-xl font-black text-slate-900">
              AulaCIM-10 · FHSJD (DAS 26/27)
            </h1>
            <p className="text-xs text-slate-600">
              Fundación Hospital San Juan de Dios · Ciclo Formativo de Grado Superior en Documentación y Administración Sanitarias
            </p>
            <div className="mt-4 flex justify-between text-xs font-semibold text-slate-800">
              <span>Alumno: {user.fullName} (DNI: {maskDni(user.dniNie)})</span>
              <span>Grupo: {user.academicGroup}</span>
              <span>Fecha: {new Date(selectedReport.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <h2 className="text-base font-bold text-slate-900">{selectedReport.title}</h2>
            <div className="p-3 bg-slate-50 border rounded-lg whitespace-pre-wrap">
              {selectedReport.content}
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 border rounded-lg">
                <strong className="block font-bold text-emerald-800 mb-1">Fortalezas detectadas:</strong>
                <p>{selectedReport.strengths || 'Continuar con la constancia y rigor demostrado.'}</p>
              </div>
              <div className="p-3 border rounded-lg">
                <strong className="block font-bold text-rose-800 mb-1">Áreas de mejora:</strong>
                <p>{selectedReport.weaknesses || 'Repasar notas de Excluye 1 y especificidad.'}</p>
              </div>
            </div>

            <div className="p-3 border rounded-lg bg-teal-50">
              <strong className="block font-bold text-teal-900 mb-1">Plan de refuerzo prioritario:</strong>
              <p>{selectedReport.recommendedFocus}</p>
            </div>

            <div className="pt-8 text-right text-[11px] text-slate-500">
              Profesor tutor: {selectedReport.authorName || 'Claustro DAS 26/27'}
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <UserIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Ficha del Alumno y Buzón de Tutoría
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Datos académicos oficiales, progresión por ámbitos asistenciales y reportes personalizados del profesor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 font-bold border border-brand-200">
            {user.academicGroup}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
        
        {/* Left Column: Personal Data & Discipline Mastery */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Card: Personal Details */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-brand-600" />
              <span>Datos del Alumno</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nombre completo</span>
                <span className="font-bold text-slate-900 text-sm">{user.fullName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">DNI / NIE (Protegido)</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {maskDni(user.dniNie)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Correo Electrónico</span>
                <span className="font-medium text-slate-800">{user.email}</span>
              </div>

              {user.phone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Teléfono</span>
                  <span className="font-medium text-slate-800">{user.phone}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 block text-[11px]">Usuario de Aula</span>
                <span className="font-mono text-slate-700">{user.username}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Fecha de alta</span>
                <span className="text-slate-600">{new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="w-full py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 rounded-xl font-bold text-xs transition"
              >
                Completar o Editar Ficha Personal
              </button>
            </div>
          </div>

          {/* Card: Mastery by Discipline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Niveles Consolidados</span>
            </h2>

            <div className="space-y-3">
              {ALL_SERVICE_AREAS.map((key) => {
                const disc = DISCIPLINE_CATALOG[key];
                const p = progressMap[key];
                const lvl = p?.highestUnlockedLevel || 1;
                const score = p?.averageScore || 0;

                return (
                  <div key={key} className="text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-800 truncate">{disc.shortName}</span>
                      <span className="text-brand-700 font-bold shrink-0">Nivel {lvl} / 5</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-brand-600 h-1.5 rounded-full"
                        style={{ width: `${(lvl / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Teacher Reports & Advice Inbox */}
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600" />
                  <span>Buzón de Reportes y Consejos Docentes</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Comentarios y planes de refuerzo emitidos por el equipo docente de DAS 26/27.
                </p>
              </div>

              {selectedReport && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
              )}
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-slate-300" />
                <div className="text-sm font-semibold text-slate-700">No hay informes emitidos todavía</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  A medida que completes evaluaciones en los diferentes ámbitos MEAP, el profesor emitirá reportes con consejos y fortalezas en este buzón.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Selector if multiple */}
                {reports.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {reports.map((r, i) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedReport(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedReport?.id === r.id
                            ? 'bg-brand-50 text-brand-800 border border-brand-300 font-bold'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        Informe #{i + 1} ({new Date(r.createdAt).toLocaleDateString('es-ES')})
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Report Content */}
                {selectedReport && (
                  <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedReport.title}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Emitido por: <strong>{selectedReport.authorName}</strong> el{' '}
                          {new Date(selectedReport.createdAt).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans bg-white p-4 rounded-xl border border-slate-200">
                      {selectedReport.content}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Fortalezas y Dominio Clínico:
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {selectedReport.strengths}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
                        <span className="font-bold text-rose-900 flex items-center gap-1.5 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          Áreas de Mejora y Riesgo de Fallo:
                        </span>
                        <p className="text-slate-700 leading-relaxed text-[11px]">
                          {selectedReport.weaknesses}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 space-y-1 text-xs">
                      <span className="font-bold text-teal-900 flex items-center gap-1.5 text-xs">
                        <Sparkles className="w-4 h-4 text-teal-700" />
                        Plan de Refuerzo Recomendado para Examen MEAP:
                      </span>
                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {selectedReport.recommendedFocus}
                      </p>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </div>

      </div>

      {/* Modal: Editar Ficha Personal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-brand-600" />
                Actualizar Datos Personales
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            {saveMsg && (
              <div className={`p-3 rounded-xl text-xs font-semibold ${saveMsg.startsWith('Error') ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}`}>
                {saveMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono de Contacto (Opcional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Grupo / Promoción</label>
                <input
                  type="text"
                  value={academicGroup}
                  onChange={(e) => setAcademicGroup(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
