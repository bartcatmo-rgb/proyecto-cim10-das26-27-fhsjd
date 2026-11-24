'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  School,
  PlusCircle,
  Edit2,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  X,
  Search,
  Plus,
} from 'lucide-react';
import { CourseSubject, Classroom, ClassroomMember, User } from '@/types';

export default function SubjectsClassroomsManager() {
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected subject for classroom filter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('ALL');

  // Create/Edit Subject Modal
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<CourseSubject | null>(null);
  const [subjCode, setSubjCode] = useState('');
  const [subjName, setSubjName] = useState('');
  const [subjDescription, setSubjDescription] = useState('');
  const [subjColor, setSubjColor] = useState('#2563eb');
  const [subjIcon, setSubjIcon] = useState('book');
  const [subjIsActive, setSubjIsActive] = useState(true);
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  // Create/Edit Classroom Modal
  const [showClassroomModal, setShowClassroomModal] = useState(false);
  const [editingClassroom, setEditingClassroom] = useState<Classroom | null>(null);
  const [classCode, setClassCode] = useState('');
  const [className, setClassName] = useState('');
  const [classSubjectId, setClassSubjectId] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classMaxStudents, setClassMaxStudents] = useState<number>(35);
  const [classIsActive, setClassIsActive] = useState(true);
  const [savingClassroom, setSavingClassroom] = useState(false);
  const [classroomError, setClassroomError] = useState<string | null>(null);

  // Classroom Members Modal
  const [inspectingClassroom, setInspectingClassroom] = useState<Classroom | null>(null);
  const [members, setMembers] = useState<ClassroomMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState<'student' | 'teacher' | 'coordinator'>('student');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [subjRes, classRes, usersRes] = await Promise.all([
        fetch('/api/admin/subjects'),
        fetch('/api/admin/classrooms'),
        fetch('/api/admin/users'),
      ]);

      if (!subjRes.ok || !classRes.ok) {
        throw new Error('Error al consultar materias y aulas');
      }

      const subjData = await subjRes.json();
      const classData = await classRes.json();
      setSubjects(subjData.subjects || []);
      setClassrooms(classData.classrooms || []);

      if (usersRes.ok) {
        const uData = await usersRes.json();
        setAllUsers(uData.users || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewSubject = () => {
    setEditingSubject(null);
    setSubjCode('');
    setSubjName('');
    setSubjDescription('');
    setSubjColor('#2563eb');
    setSubjIcon('book');
    setSubjIsActive(true);
    setSubjectError(null);
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (s: CourseSubject) => {
    setEditingSubject(s);
    setSubjCode(s.code);
    setSubjName(s.name);
    setSubjDescription(s.description || '');
    setSubjColor(s.color || '#2563eb');
    setSubjIcon(s.icon || 'book');
    setSubjIsActive(s.isActive !== false);
    setSubjectError(null);
    setShowSubjectModal(true);
  };

  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjCode || !subjName) {
      setSubjectError('Código y nombre de la materia son obligatorios');
      return;
    }

    try {
      setSavingSubject(true);
      setSubjectError(null);

      const isEdit = Boolean(editingSubject);
      const res = await fetch('/api/admin/subjects', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSubject ? editingSubject.id : undefined,
          code: subjCode.trim().toUpperCase(),
          name: subjName.trim(),
          description: subjDescription.trim(),
          color: subjColor,
          icon: subjIcon,
          isActive: subjIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubjectError(data.error || 'Error al guardar materia');
        return;
      }

      setShowSubjectModal(false);
      await loadData();
    } catch {
      setSubjectError('Error de red al guardar materia');
    } finally {
      setSavingSubject(false);
    }
  };

  const handleOpenNewClassroom = () => {
    setEditingClassroom(null);
    setClassCode('');
    setClassName('');
    setClassSubjectId(subjects[0]?.id || '');
    setClassTeacherId('');
    setClassDescription('');
    setClassMaxStudents(35);
    setClassIsActive(true);
    setClassroomError(null);
    setShowClassroomModal(true);
  };

  const handleOpenEditClassroom = (c: Classroom) => {
    setEditingClassroom(c);
    setClassCode(c.code);
    setClassName(c.name);
    setClassSubjectId(c.subjectId);
    setClassTeacherId(c.teacherId || '');
    setClassDescription(c.description || '');
    setClassMaxStudents(c.maxStudents || 35);
    setClassIsActive(c.isActive !== false);
    setClassroomError(null);
    setShowClassroomModal(true);
  };

  const handleSaveClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classCode || !className || !classSubjectId) {
      setClassroomError('Código, nombre y materia asignada son obligatorios');
      return;
    }

    try {
      setSavingClassroom(true);
      setClassroomError(null);

      const isEdit = Boolean(editingClassroom);
      const res = await fetch('/api/admin/classrooms', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClassroom ? editingClassroom.id : undefined,
          code: classCode.trim().toUpperCase(),
          name: className.trim(),
          subjectId: classSubjectId,
          teacherId: classTeacherId || null,
          description: classDescription.trim(),
          maxStudents: classMaxStudents,
          isActive: classIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setClassroomError(data.error || 'Error al guardar aula');
        return;
      }

      setShowClassroomModal(false);
      await loadData();
    } catch {
      setClassroomError('Error de red al guardar aula');
    } finally {
      setSavingClassroom(false);
    }
  };

  const handleOpenMembersModal = async (c: Classroom) => {
    setInspectingClassroom(c);
    setMemberUserId('');
    setMemberRole('student');
    setMemberError(null);
    setLoadingMembers(true);

    try {
      const res = await fetch(`/api/admin/classrooms/${c.id}/members`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      setMemberError('Error al cargar integrantes del aula');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingClassroom || !memberUserId) return;

    try {
      setAddingMember(true);
      setMemberError(null);

      const res = await fetch(`/api/admin/classrooms/${inspectingClassroom.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: memberUserId,
          roleInClass: memberRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMemberError(data.error || 'Error al inscribir usuario');
        return;
      }

      setMembers(data.members || []);
      setMemberUserId('');
    } catch {
      setMemberError('Error de conexión al inscribir usuario');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!inspectingClassroom) return;
    try {
      const res = await fetch(
        `/api/admin/classrooms/${inspectingClassroom.id}/members?userId=${userId}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al desmatricular usuario');
        return;
      }
      setMembers(data.members || []);
    } catch {
      alert('Error de conexión al desmatricular usuario');
    }
  };

  const filteredClassrooms = classrooms.filter((c) => {
    if (selectedSubjectId !== 'ALL' && c.subjectId !== selectedSubjectId) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* SECCIÓN 1: MATERIAS DEL CURSO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Materias del Curso Lectivo
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Gestión de asignaturas y módulos (CIM-10 Troncal, Documentación Sanitaria, etc.) con materiales y exámenes independientes.
            </p>
          </div>

          <button
            onClick={handleOpenNewSubject}
            className="flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Materia</span>
          </button>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-sm transition space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: s.color || '#2563eb' }}
                  />
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {s.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {s.isActive !== false ? (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Activa
                    </span>
                  ) : (
                    <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                      Inactiva
                    </span>
                  )}
                  <button
                    onClick={() => handleOpenEditSubject(s)}
                    className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                    title="Editar materia"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2">
                {s.description || 'Sin descripción detallada registrada.'}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Aulas asociadas:{' '}
                  <strong>{classrooms.filter((c) => c.subjectId === s.id).length}</strong>
                </span>
                <button
                  onClick={() => setSelectedSubjectId(s.id)}
                  className="text-brand-700 hover:text-brand-900 font-bold"
                >
                  Ver aulas →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: AULAS POR MATERIA */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                <School className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Aulas y Grupos por Materia
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Despliegue de múltiples aulas por materia con asignación de docentes y alumnos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Filtrar por Materia:</span>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none max-w-[200px]"
              >
                <option value="ALL">Todas las Materias</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleOpenNewClassroom}
              className="flex items-center gap-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nueva Aula</span>
            </button>
          </div>
        </div>

        {/* Classrooms Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Código / Nombre</th>
                <th className="py-3 px-4">Materia Asignada</th>
                <th className="py-3 px-4">Docente Titular</th>
                <th className="py-3 px-4">Capacidad</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredClassrooms.map((c) => {
                const subject = subjects.find((s) => s.id === c.subjectId);
                const teacher = allUsers.find((u) => u.id === c.teacherId);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">
                        {subject ? subject.name : c.subjectName || 'CIM-10 Troncal'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-purple-900 font-medium">
                        {teacher ? teacher.fullName : 'Profesorado FHSJD'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 font-semibold">
                        Máx. {c.maxStudents || 35} alumnos
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3 text-slate-400" />
                          Cerrada
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenMembersModal(c)}
                          className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition flex items-center gap-1"
                          title="Gestionar alumnos y profesores del aula"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Alumnos / Miembros</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditClassroom(c)}
                          className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                          title="Editar aula"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CREAR / EDITAR MATERIA */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingSubject ? `Editar Materia: ${editingSubject.name}` : 'Registrar Nueva Materia'}
                </h3>
              </div>
              <button
                onClick={() => setShowSubjectModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {subjectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {subjectError}
              </div>
            )}

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Código de Materia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. CIM10, DOCSAN, FOL, INGLES"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-brand-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre Completo de la Materia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Codificación Clínica CIM-10 · MEAP"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción / Objetivos</label>
                <textarea
                  rows={3}
                  placeholder="Detalles formativos del módulo docente..."
                  value={subjDescription}
                  onChange={(e) => setSubjDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Color Distintivo</label>
                  <input
                    type="color"
                    value={subjColor}
                    onChange={(e) => setSubjColor(e.target.value)}
                    className="w-full h-9 p-1 border border-slate-300 rounded-xl cursor-pointer"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={subjIsActive}
                      onChange={(e) => setSubjIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                    />
                    <span>Materia Activa</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingSubject}
                  className="px-5 py-2 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {savingSubject && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Materia</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR AULA */}
      {showClassroomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {editingClassroom ? `Editar Aula: ${editingClassroom.name}` : 'Registrar Nueva Aula'}
                </h3>
              </div>
              <button
                onClick={() => setShowClassroomModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {classroomError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {classroomError}
              </div>
            )}

            <form onSubmit={handleSaveClassroom} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Código de Aula *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. DAS-1A, DAS-1B"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold font-mono focus:ring-2 focus:ring-purple-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materia Asignada *</label>
                  <select
                    required
                    value={classSubjectId}
                    onChange={(e) => setClassSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Selecciona materia...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Aula *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aula DAS 26/27 - Grupo A (Mañana)"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Docente Titular</label>
                  <select
                    value={classTeacherId}
                    onChange={(e) => setClassTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="">Selecciona docente...</option>
                    {allUsers
                      .filter((u) => u.role === 'teacher' || u.role === 'admin')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.role})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacidad Máxima</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={classMaxStudents}
                    onChange={(e) => setClassMaxStudents(parseInt(e.target.value) || 35)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Observaciones</label>
                <textarea
                  rows={2}
                  placeholder="Horarios, ubicación o especificaciones..."
                  value={classDescription}
                  onChange={(e) => setClassDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={classIsActive}
                    onChange={(e) => setClassIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Aula Activa para el curso lectivo</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClassroomModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingClassroom}
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {savingClassroom && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Aula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GESTIONAR INTEGRANTES DEL AULA */}
      {inspectingClassroom && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Integrantes del Aula: {inspectingClassroom.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Código: {inspectingClassroom.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingClassroom(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {memberError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {memberError}
              </div>
            )}

            {/* Inscribir Nuevo Integrante */}
            <form onSubmit={handleAddMember} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Inscribir Alumno o Profesor al Aula
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <select
                    required
                    value={memberUserId}
                    onChange={(e) => setMemberUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium bg-white"
                  >
                    <option value="">Selecciona usuario a inscribir...</option>
                    {allUsers
                      .filter((u) => !members.some((m) => m.userId === u.id))
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.username} · {u.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <select
                    value={memberRole}
                    onChange={(e) => setMemberRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                  >
                    <option value="student">Alumno</option>
                    <option value="teacher">Profesor Asistente</option>
                    <option value="coordinator">Coordinador de Aula</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingMember || !memberUserId}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {addingMember ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Inscribir en Aula</span>
                </button>
              </div>
            </form>

            {/* Members List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Miembros Matriculados ({members.length})</span>
              </div>

              {loadingMembers ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-indigo-600" />
                  Cargando integrantes...
                </div>
              ) : members.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
                  No hay alumnos ni profesores asignados aún a esta aula.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {members.map((m) => (
                    <div key={m.userId} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                      <div>
                        <div className="font-bold text-slate-900">{m.fullName || m.userId}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {m.maskedDni || m.dniNie || m.username || '—'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.roleInClass === 'coordinator'
                              ? 'bg-purple-100 text-purple-800'
                              : m.roleInClass === 'teacher'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {m.roleInClass === 'coordinator'
                            ? 'Coordinador'
                            : m.roleInClass === 'teacher'
                            ? 'Docente'
                            : 'Alumno'}
                        </span>

                        <button
                          onClick={() => handleRemoveMember(m.userId)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Dar de baja del aula"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingClassroom(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition text-xs"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
