'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  BookOpen,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  Download,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { AcademicCourse, User } from '@/types';

interface Props {
  activeCourseId?: string;
  onCourseCreated?: () => void;
}

export default function CourseStudentsManager({ activeCourseId, onCourseCreated }: Props) {
  const [courses, setCourses] = useState<AcademicCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(activeCourseId || 'DAS-26-27');
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (activeCourseId) {
      setSelectedCourseId(activeCourseId);
    }
  }, [activeCourseId]);

  // New course form
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseId, setNewCourseId] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // New student form
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dniNie, setDniNie] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academicGroup, setAcademicGroup] = useState('DAS 1º');
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Excel Bulk Import state
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<any | null>(null);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);
  const [excelSuccess, setExcelSuccess] = useState<string | null>(null);

  const handleExcelPreview = async (file: File) => {
    setExcelFile(file);
    setExcelError(null);
    setExcelSuccess(null);
    setExcelPreview(null);
    setExcelLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'preview');
      formData.append('defaultCourseId', selectedCourseId === 'ALL' ? 'DAS-26-27' : selectedCourseId);

      const res = await fetch('/api/admin/students/import-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setExcelError(data.error || 'Error al validar el archivo Excel.');
      } else {
        setExcelPreview(data);
      }
    } catch (err: any) {
      setExcelError('Error al enviar el archivo Excel.');
    } finally {
      setExcelLoading(false);
    }
  };

  const handleCommitExcel = async () => {
    if (!excelFile) return;
    setExcelLoading(true);
    setExcelError(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('action', 'commit');
      formData.append('defaultCourseId', selectedCourseId === 'ALL' ? 'DAS-26-27' : selectedCourseId);

      const res = await fetch('/api/admin/students/import-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setExcelError(data.error || 'Error al importar alumnos.');
      } else {
        setExcelSuccess(data.message || `Importados ${data.importedCount} alumnos.`);
        fetchStudents();
        setTimeout(() => {
          setShowExcelModal(false);
          setExcelFile(null);
          setExcelPreview(null);
          setExcelSuccess(null);
        }, 2000);
      }
    } catch {
      setExcelError('Error de conexión al importar.');
    } finally {
      setExcelLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses || []);
      }
    } catch {
      // ignore
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/metrics?courseId=${selectedCourseId}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [selectedCourseId]);

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const confirmMsg = nextStatus === 'inactive'
      ? '¿Dar de baja a este alumno? Su acceso se pausará pero su historial de exámenes e intentos quedará 100% conservado.'
      : '¿Reactivar el acceso de este alumno?';

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/admin/students/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, status: nextStatus }),
      });

      if (res.ok) {
        fetchStudents();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al cambiar estado.');
      }
    } catch {
      alert('Error de conexión.');
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newCourseName) return;

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newCourseId,
          name: newCourseName,
          description: newCourseDesc,
        }),
      });

      if (res.ok) {
        setShowNewCourseModal(false);
        setNewCourseId('');
        setNewCourseName('');
        setNewCourseDesc('');
        await fetchCourses();
        setSelectedCourseId(newCourseId.toUpperCase());
        onCourseCreated?.();
      } else {
        const err = await res.json();
        alert(err.error || 'Error al crear curso.');
      }
    } catch {
      alert('Error de red al crear curso.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          dniNie,
          email,
          password,
          academicGroup,
          courseId: selectedCourseId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Error al matricular alumno.');
      } else {
        setFormSuccess(data.message);
        setFullName('');
        setUsername('');
        setDniNie('');
        setEmail('');
        setPassword('');
        fetchStudents();
        setTimeout(() => {
          setShowNewStudentModal(false);
          setFormSuccess(null);
        }, 1500);
      }
    } catch {
      setFormError('Error de red al registrar alumno.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter students by selected course and search
  const filteredStudents = students.filter((s) => {
    const matchesCourse = selectedCourseId === 'ALL' || (s.courseId || 'DAS-26-27') === selectedCourseId;
    const matchesSearch = !searchTerm ||
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dniNie?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top action bar: Course selector + New course + New student */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
            <span className="text-xs font-bold uppercase text-slate-500">Curso Académico:</span>
          </div>

          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="text-sm font-bold bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">Todos los cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.name} {c.isCurrent ? '(Activo)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowNewCourseModal(true)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl w-48 sm:w-64 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <a
            href="/api/admin/students/template"
            download
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Descargar plantilla Excel oficial con formato y validaciones"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Plantilla Excel</span>
          </a>

          <button
            onClick={() => setShowExcelModal(true)}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Cargar masivamente alumnos desde archivo Excel .xlsx"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Importar Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => setShowNewStudentModal(true)}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Matricular Alumno</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Alumnos Matriculados en {selectedCourseId === 'ALL' ? 'Todos los Cursos' : selectedCourseId}
            </h3>
            <p className="text-xs text-slate-500">
              Total listado: {filteredStudents.length} alumnos
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
            Cargando expedientes de alumnos...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No se encontraron alumnos para este curso o criterio de búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Alumno</th>
                  <th className="px-6 py-3">DNI/NIE</th>
                  <th className="px-6 py-3">Curso</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3 text-center">Intentos</th>
                  <th className="px-6 py-3 text-center">Media</th>
                  <th className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s) => {
                  const isActive = (s.status || 'active') === 'active';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-900">{s.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{s.username}</div>
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {s.maskedDni || s.dniNie}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-700">
                        {s.courseId || 'DAS-26-27'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {isActive ? 'Activo' : 'De Baja'}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-slate-700">
                        {s.totalAttempts || 0}
                      </td>
                      <td className="px-6 py-3.5 text-center font-bold text-brand-700">
                        {s.avgScore ? `${s.avgScore}%` : '--'}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(s.id, s.status || 'active')}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                            isActive
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isActive ? 'Dar de baja' : 'Reactivar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: New Course */}
      {showNewCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-black text-slate-900">Crear Nuevo Curso Académico</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Código del Curso (ej. DAS-27-28):</label>
                <input
                  type="text"
                  required
                  placeholder="DAS-27-28"
                  value={newCourseId}
                  onChange={(e) => setNewCourseId(e.target.value.toUpperCase())}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Descriptivo:</label>
                <input
                  type="text"
                  required
                  placeholder="Promoción DAS 2027/2028"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observaciones / Descripción:</label>
                <textarea
                  rows={2}
                  placeholder="Opcional..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCourseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Student Registration */}
      {showNewStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-600" />
              Matricular Alumno en {selectedCourseId}
            </h3>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Apellidos, Nombre"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de Usuario:</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. alumno.garcia"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">DNI/NIE Oficial (Módulo 23):</label>
                  <input
                    type="text"
                    required
                    placeholder="12345678Z"
                    value={dniNie}
                    onChange={(e) => setDniNie(e.target.value.toUpperCase())}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico:</label>
                  <input
                    type="email"
                    required
                    placeholder="alumno@fhsjd.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.toLowerCase())}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contraseña Temporal (mín. 8):</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grupo Académico:</label>
                  <input
                    type="text"
                    value={academicGroup}
                    onChange={(e) => setAcademicGroup(e.target.value)}
                    className="w-full p-2.5 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewStudentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {submitting ? 'Registrando...' : 'Matricular'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Importación Masiva Excel (.xlsx) */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                <span>Importación Masiva de Alumnos (Excel .xlsx)</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowExcelModal(false);
                  setExcelPreview(null);
                  setExcelFile(null);
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Sube la plantilla oficial de Excel completada. Cada fila será verificada según el algoritmo oficial de DNI/NIE español y se matriculará en el curso seleccionado (<strong>{selectedCourseId}</strong>).
            </p>

            {excelError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {excelError}
              </div>
            )}

            {excelSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{excelSuccess}</span>
              </div>
            )}

            {/* File upload drag/select */}
            <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:border-teal-400 transition bg-slate-50/50">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs inline-block">
                  Seleccionar archivo .xlsx
                </span>
                <input
                  type="file"
                  accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleExcelPreview(f);
                  }}
                />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">
                {excelFile ? `Archivo seleccionado: ${excelFile.name} (${Math.round(excelFile.size / 1024)} KB)` : 'Formatos aceptados: Microsoft Excel (.xlsx)'}
              </p>
            </div>

            {excelLoading && (
              <div className="py-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mx-auto mb-2" />
                <span className="text-xs font-semibold text-slate-600">Procesando y validando filas del archivo...</span>
              </div>
            )}

            {/* Preview Results */}
            {excelPreview && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">Filas Detectadas</span>
                    <span className="text-xl font-black text-slate-800">{excelPreview.totalRows}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block">Filas Válidas</span>
                    <span className="text-xl font-black text-emerald-700">{excelPreview.validCount}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="text-[10px] text-rose-700 font-bold uppercase block">Errores / Descartadas</span>
                    <span className="text-xl font-black text-rose-700">{excelPreview.errorCount}</span>
                  </div>
                </div>

                {excelPreview.errorCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 max-h-36 overflow-y-auto text-xs">
                    <div className="font-bold text-amber-900">Incidencias encontradas (no se importarán estas filas):</div>
                    {excelPreview.errorRows.map((err: any, i: number) => (
                      <div key={i} className="text-[11px] text-amber-800 flex items-start gap-1">
                        <span>• Fila {err.row} ({err.dni}): {err.error}</span>
                      </div>
                    ))}
                  </div>
                )}

                {excelPreview.validCount > 0 && (
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b">
                        <tr>
                          <th className="p-2">DNI/NIE</th>
                          <th className="p-2">Nombre y Apellidos</th>
                          <th className="p-2">Curso</th>
                          <th className="p-2">Usuario</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelPreview.validRows.map((r: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 font-mono font-bold text-slate-800">{r.dniNie}</td>
                            <td className="p-2">{r.fullName}</td>
                            <td className="p-2 font-mono text-[11px]">{r.courseId}</td>
                            <td className="p-2 font-mono text-[11px] text-slate-500">{r.username}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <a
                href="/api/admin/students/template"
                download
                className="text-xs text-teal-700 hover:underline font-bold flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar plantilla de ejemplo (.xlsx)</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowExcelModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs"
                >
                  Cerrar
                </button>
                {excelPreview && excelPreview.validCount > 0 && (
                  <button
                    type="button"
                    onClick={handleCommitExcel}
                    disabled={excelLoading}
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {excelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Confirmar e Importar {excelPreview.validCount} Alumnos</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
