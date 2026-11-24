'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Edit2,
  Trash2,
  Key,
  Plus,
  X,
  BookOpen,
  School,
  RefreshCw,
} from 'lucide-react';
import { User, UserRole, CourseSubject, Classroom } from '@/types';

interface ExtendedUser extends User {
  maskedDni?: string;
  roles?: UserRole[];
  subjectName?: string;
  classroomName?: string;
  totalAttempts?: number;
  avgScore?: number;
}

export default function UserManagerPanel() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [subjects, setSubjects] = useState<CourseSubject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [subjectFilter, setSubjectFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Create User Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createFullName, setCreateFullName] = useState('');
  const [createFirstName, setCreateFirstName] = useState('');
  const [createLastName, setCreateLastName] = useState('');
  const [createDniNie, setCreateDniNie] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('student');
  const [createCanSwitch, setCreateCanSwitch] = useState(false);
  const [createSubjectId, setCreateSubjectId] = useState('');
  const [createClassroomId, setCreateClassroomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit User Modal
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editDniNie, setEditDniNie] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('student');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editCanSwitch, setEditCanSwitch] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState('');
  const [editClassroomId, setEditClassroomId] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [roleActionLoading, setRoleActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersRes, subjectsRes, classroomsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/subjects'),
        fetch('/api/classrooms'),
      ]);

      if (!usersRes.ok) throw new Error('Error al cargar la lista de usuarios');

      const usersData = await usersRes.json();
      setUsers(usersData.users || []);

      if (subjectsRes.ok) {
        const subData = await subjectsRes.json();
        setSubjects(subData.subjects || []);
      }

      if (classroomsRes.ok) {
        const classData = await classroomsRes.json();
        setClassrooms(classData.classrooms || []);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: ExtendedUser) => {
    setEditingUser(user);
    setEditFullName(user.fullName || '');
    setEditFirstName(user.firstName || '');
    setEditLastName(user.lastName || '');
    setEditDniNie(user.dniNie || '');
    setEditEmail(user.email || '');
    setEditRole(user.role);
    setEditIsActive(user.isActive !== false);
    setEditCanSwitch(Boolean(user.canSwitchRole));
    setEditSubjectId(user.defaultSubjectId || '');
    setEditClassroomId(user.defaultClassroomId || '');
    setEditNewPassword('');
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSavingUser(true);
      setEditError(null);

      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName,
          firstName: editFirstName,
          lastName: editLastName,
          dniNie: editDniNie,
          email: editEmail,
          role: editRole,
          isActive: editIsActive,
          canSwitchRole: editCanSwitch,
          defaultSubjectId: editSubjectId || null,
          defaultClassroomId: editClassroomId || null,
          newPassword: editNewPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || 'Error al actualizar usuario');
        return;
      }

      setEditingUser(null);
      await loadData();
    } catch {
      setEditError('Error de red al actualizar usuario');
    } finally {
      setSavingUser(false);
    }
  };

  const handleAssignRole = async (targetRole: UserRole) => {
    if (!editingUser) return;
    try {
      setRoleActionLoading(true);
      const res = await fetch(`/api/admin/users/${editingUser.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: targetRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al asignar rol');
        return;
      }

      // Update current user roles in modal state and main list
      const updatedRoles = data.roles as UserRole[];
      setEditingUser((prev) => (prev ? { ...prev, roles: updatedRoles } : null));
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, roles: updatedRoles } : u))
      );
    } catch {
      alert('Error de conexión al asignar rol');
    } finally {
      setRoleActionLoading(false);
    }
  };

  const handleRevokeRole = async (targetRole: UserRole) => {
    if (!editingUser) return;
    if (
      targetRole === 'admin' &&
      !window.confirm(
        '¿Confirmas la revocación del rol de Administrador? Se verificará que quede al menos otro administrador activo.'
      )
    ) {
      return;
    }

    try {
      setRoleActionLoading(true);
      const res = await fetch(
        `/api/admin/users/${editingUser.id}/roles?role=${targetRole}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al revocar rol');
        return;
      }

      const updatedRoles = data.roles as UserRole[];
      setEditingUser((prev) => (prev ? { ...prev, roles: updatedRoles } : null));
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, roles: updatedRoles } : u))
      );
    } catch {
      alert('Error de conexión al revocar rol');
    } finally {
      setRoleActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !window.confirm(
        `¿Confirmas la desactivación y supresión del usuario "${userName}"? No se permitirá si es el único administrador.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar usuario');
        return;
      }
      alert(data.message || 'Usuario eliminado o desactivado con éxito.');
      if (editingUser?.id === userId) {
        setEditingUser(null);
      }
      await loadData();
    } catch {
      alert('Error de conexión al eliminar usuario');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername || !createFullName) {
      setCreateError('Nombre completo y usuario/DNI son obligatorios');
      return;
    }

    try {
      setCreating(true);
      setCreateError(null);

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createUsername,
          fullName: createFullName,
          firstName: createFirstName,
          lastName: createLastName,
          dniNie: createDniNie || createUsername,
          email: createEmail || `${createUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@centro.local`,
          password: createPassword || '1234',
          role: createRole,
          roles: [createRole],
          canSwitchRole: createCanSwitch,
          defaultSubjectId: createSubjectId || null,
          defaultClassroomId: createClassroomId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || 'Error al crear usuario');
        return;
      }

      setShowCreateModal(false);
      setCreateUsername('');
      setCreateFullName('');
      setCreateFirstName('');
      setCreateLastName('');
      setCreateDniNie('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('student');
      setCreateCanSwitch(false);
      setCreateSubjectId('');
      setCreateClassroomId('');

      await loadData();
    } catch {
      setCreateError('Error de red al registrar usuario');
    } finally {
      setCreating(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    // Role filter
    if (roleFilter !== 'ALL') {
      const userRoles = u.roles || [u.role];
      if (!userRoles.includes(roleFilter) && u.role !== roleFilter) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE' && u.isActive === false) return false;
    if (statusFilter === 'INACTIVE' && u.isActive !== false) return false;

    // Subject filter
    if (subjectFilter !== 'ALL' && u.defaultSubjectId !== subjectFilter) return false;

    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchUser = u.username?.toLowerCase().includes(q);
      const matchDni = u.dniNie?.toLowerCase().includes(q) || u.maskedDni?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchDni && !matchEmail) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Gestión Integral de Usuarios, Docentes y Roles
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Control centralizado de altas, asignación y revocación segura de roles (Alumnos, Profesores, Administradores), materias y aulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
            title="Refrescar usuarios"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Usuario / Docente</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, usuario o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Rol:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none"
            >
              <option value="ALL">Todos los Roles</option>
              <option value="student">Alumnos (student)</option>
              <option value="teacher">Profesores (teacher)</option>
              <option value="admin">Administradores (admin)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span>Estado:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none"
            >
              <option value="ALL">Todos</option>
              <option value="ACTIVE">Activos</option>
              <option value="INACTIVE">Inactivos</option>
            </select>
          </div>

          {subjects.length > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <span>Materia:</span>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-800 font-semibold focus:outline-none max-w-[180px] truncate"
              >
                <option value="ALL">Todas las Materias</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Mostrando <strong>{filteredUsers.length}</strong> de {users.length} usuarios
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden max-h-[calc(100vh-270px)] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Cargando usuarios y roles...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs font-bold">{error}</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No se encontraron usuarios coincidentes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2 px-3">Usuario / DNI</th>
                  <th className="py-2 px-3">Nombre Completo</th>
                  <th className="py-2 px-3">Roles Activos</th>
                  <th className="py-2 px-3">Materia / Aula</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredUsers.map((u) => {
                  const userRoles = u.roles && u.roles.length > 0 ? u.roles : [u.role];
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-slate-900">{u.username}</div>
                        <div className="text-[10px] text-slate-400">{u.maskedDni || u.dniNie || '—'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <div className="text-slate-900 font-bold">{u.fullName}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {userRoles.map((r) => (
                            <span
                              key={r}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                r === 'admin'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : r === 'teacher'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {r === 'admin' && <Shield className="w-3 h-3" />}
                              {r === 'teacher' && <Briefcase className="w-3 h-3" />}
                              {r === 'student' && <GraduationCap className="w-3 h-3" />}
                              <span>{r === 'admin' ? 'Admin' : r === 'teacher' ? 'Docente' : 'Alumno'}</span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-semibold truncate max-w-[180px]">
                          {u.subjectName || subjects.find((s) => s.id === u.defaultSubjectId)?.name || 'CIM-10 Troncal'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {u.classroomName || classrooms.find((c) => c.id === u.defaultClassroomId)?.name || 'Aula Principal'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                            title="Editar usuario y roles"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 transition"
                            title="Desactivar o eliminar usuario"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Dar de Alta Nuevo Usuario / Docente</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Dra. Carmen Blanco"
                    value={createFullName}
                    onChange={(e) => setCreateFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Usuario / DNI Login *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 12345678Z o cblanco"
                    value={createUsername}
                    onChange={(e) => setCreateUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de Pila</label>
                  <input
                    type="text"
                    placeholder="Ej. Carmen"
                    value={createFirstName}
                    onChange={(e) => setCreateFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    placeholder="Ej. Blanco Fernández"
                    value={createLastName}
                    onChange={(e) => setCreateLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DNI / NIE</label>
                  <input
                    type="text"
                    placeholder="Ej. 12345678Z"
                    value={createDniNie}
                    onChange={(e) => setCreateDniNie(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="usuario@fhsjd.edu.es"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contraseña Inicial</label>
                  <input
                    type="text"
                    placeholder="Por defecto: 1234"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol Principal *</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="student">Alumno (student)</option>
                    <option value="teacher">Profesor / Docente (teacher)</option>
                    <option value="admin">Administrador (admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materia por Defecto</label>
                  <select
                    value={createSubjectId}
                    onChange={(e) => setCreateSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="">Selecciona materia...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aula por Defecto</label>
                  <select
                    value={createClassroomId}
                    onChange={(e) => setCreateClassroomId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="">Selecciona aula...</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={createCanSwitch}
                    onChange={(e) => setCreateCanSwitch(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Permitir conmutar vista entre rol estudiante y rol activo (dual)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                >
                  {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Usuario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER & ROLES MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Editar Usuario y Gestión de Roles: {editingUser.fullName}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
                {editError}
              </div>
            )}

            {/* Role Assignment & Revocation Section */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Roles Asignados al Usuario
                </span>
                {roleActionLoading && (
                  <span className="text-[11px] text-indigo-600 flex items-center gap-1 font-semibold">
                    <Loader2 className="w-3 h-3 animate-spin" /> Actualizando rol...
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {(['student', 'teacher', 'admin'] as UserRole[]).map((r) => {
                  const hasRole = (editingUser.roles || [editingUser.role]).includes(r);
                  return (
                    <div
                      key={r}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        hasRole
                          ? r === 'admin'
                            ? 'bg-purple-100 border-purple-300 text-purple-900'
                            : r === 'teacher'
                            ? 'bg-blue-100 border-blue-300 text-blue-900'
                            : 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {r === 'admin' && <Shield className="w-3.5 h-3.5" />}
                      {r === 'teacher' && <Briefcase className="w-3.5 h-3.5" />}
                      {r === 'student' && <GraduationCap className="w-3.5 h-3.5" />}
                      <span>
                        {r === 'admin' ? 'Administrador' : r === 'teacher' ? 'Docente' : 'Alumno'}
                      </span>

                      {hasRole ? (
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(r)}
                          disabled={roleActionLoading}
                          title={`Revocar rol de ${r}`}
                          className="p-0.5 hover:bg-rose-200 text-rose-700 rounded transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAssignRole(r)}
                          disabled={roleActionLoading}
                          title={`Asignar rol de ${r}`}
                          className="p-0.5 hover:bg-indigo-100 text-indigo-700 rounded transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Haz clic en el icono <strong>+</strong> para asignar un rol adicional o en <strong>×</strong> para revocarlo. El sistema protege de forma irrevocable que nunca se quede sin al menos un administrador activo.
              </p>
            </div>

            {/* Edit details form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">DNI / NIE</label>
                  <input
                    type="text"
                    value={editDniNie}
                    onChange={(e) => setEditDniNie(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nombre de Pila</label>
                  <input
                    type="text"
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Apellidos</label>
                  <input
                    type="text"
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Rol Primario</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold bg-white"
                  >
                    <option value="student">Alumno (student)</option>
                    <option value="teacher">Profesor (teacher)</option>
                    <option value="admin">Administrador (admin)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Materia por Defecto</label>
                  <select
                    value={editSubjectId}
                    onChange={(e) => setEditSubjectId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="">Ninguna asignada</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aula por Defecto</label>
                  <select
                    value={editClassroomId}
                    onChange={(e) => setEditClassroomId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-medium bg-white"
                  >
                    <option value="">Ninguna asignada</option>
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Restablecer Contraseña (opcional)
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="Dejar en blanco para no modificar"
                    value={editNewPassword}
                    onChange={(e) => setEditNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Usuario Activo en Plataforma</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={editCanSwitch}
                    onChange={(e) => setEditCanSwitch(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Permitir alternar a rol Alumno (Dual)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteUser(editingUser.id, editingUser.fullName)}
                  className="px-3.5 py-2 border border-rose-200 text-rose-700 font-bold rounded-xl hover:bg-rose-50 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Usuario</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm"
                  >
                    {savingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
