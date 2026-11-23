'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, User, Mail, Phone, Lock, Hash, Users, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { validateDniNie } from '@/lib/auth/validation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    dniNie: '',
    academicGroup: 'DAS 26/27 - Grupo A',
    email: '',
    phone: '',
    username: '',
    password: '',
    privacyConsent: false,
    ageConsent: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dniCheck = formData.dniNie.trim().length >= 8 ? validateDniNie(formData.dniNie) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (dniCheck && !dniCheck.valid) {
      setError(dniCheck.error || 'El DNI/NIE no cumple con el algoritmo oficial español.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al completar el registro.');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Error al conectar con el servidor.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-3">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Ficha de Nuevo Alumno
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Registro oficial para seguimiento de competencias CIM-10 · Promoción DAS 26/27
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Carmen López Moreno"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                </div>
              </div>

              {/* DNI / NIE */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>DNI o NIE *</span>
                  {dniCheck && (
                    <span className={`text-[10px] font-bold ${dniCheck.valid ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {dniCheck.valid ? '✓ Válido' : '✗ Letra incorrecta'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.dniNie}
                    onChange={(e) => setFormData({ ...formData, dniNie: e.target.value.toUpperCase() })}
                    placeholder="Ej. 12345678Z"
                    className={`block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      dniCheck
                        ? dniCheck.valid
                          ? 'border-emerald-300 focus:ring-emerald-500'
                          : 'border-rose-300 focus:ring-rose-500'
                        : 'border-slate-200 focus:ring-brand-500'
                    }`}
                  />
                </div>
              </div>

              {/* Academic Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grupo Académico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.academicGroup}
                    onChange={(e) => setFormData({ ...formData, academicGroup: e.target.value })}
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="DAS 26/27 - Grupo A">DAS 26/27 - Grupo A (Mañana)</option>
                    <option value="DAS 26/27 - Grupo B">DAS 26/27 - Grupo B (Tarde)</option>
                    <option value="DAS 26/27 - Semipresencial">DAS 26/27 - Semipresencial</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="alumno@centro.local"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto (Opcional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    autoComplete="off"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="600000000"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre de Usuario *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                    placeholder="ej. carmen.lopez"
                    className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña de Acceso (mínimo 8 caracteres) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* RGPD / LOPDGDD / APDCAT Cláusula Informativa y Consentimientos Explícitos */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Protección de Datos (Capa 1):</strong> Los datos recabados serán tratados por <em>Fundació Hospital Sant Joan de Déu / Campus Docent</em> con la finalidad exclusiva de gestión académica y evaluación del ciclo DAS 26/27. Prohibida toda cesión comercial. Derechos ARSOPOL ante <code className="font-mono text-brand-700">dpo@fhsjd.local</code>. Consulta la{' '}
                  <Link href="/privacidad" target="_blank" className="font-bold text-brand-700 underline">
                    Política de Privacidad Completa (Capa 2) ↗
                  </Link>.
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    required
                    checked={formData.privacyConsent}
                    onChange={(e) => setFormData({ ...formData, privacyConsent: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    He leído y acepto expresamente el aviso de privacidad y el tratamiento de mis datos con fines estrictamente académicos. *
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    required
                    checked={formData.ageConsent}
                    onChange={(e) => setFormData({ ...formData, ageConsent: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span>
                    Confirmo que tengo al menos 14 años para formalizar este registro conforme al Art. 7 de la LOPDGDD 3/2018. *
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (dniCheck ? !dniCheck.valid : false) || !formData.privacyConsent || !formData.ageConsent}
              className="w-full mt-4 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Creando Ficha...' : 'Completar Registro en el Aula'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-600">
            ¿Ya tienes ficha registrada?{' '}
            <Link href="/login" className="font-bold text-brand-700 hover:underline">
              Iniciar sesión aquí
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
