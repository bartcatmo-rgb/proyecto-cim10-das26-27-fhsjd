'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Stethoscope, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('Error de conexión con el servidor del aula.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mb-3">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Acceso a AulaCIM-10
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            FHSJD · Ciclo Superior DAS 26/27 (Documentación y Administración Sanitarias)
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuario o DNI / NIE
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Ej. alumno o 12345678Z"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Classroom seed hint for instant demo */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 space-y-2 bg-slate-50 p-3 rounded-xl border">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Accesos docentes preconfigurados de prueba:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="font-medium text-slate-700">Alumno:</span>{' '}
                <code className="text-brand-800 bg-brand-50 px-1 py-0.5 rounded">alumno</code> /{' '}
                <code className="text-slate-600">Alumno2026!</code>
              </div>
              <div>
                <span className="font-medium text-slate-700">Profesor:</span>{' '}
                <code className="text-purple-800 bg-purple-50 px-1 py-0.5 rounded">profesor</code> /{' '}
                <code className="text-slate-600">Profesor2026!</code>
              </div>
            </div>
          </div>

          <div className="mt-5 text-center text-xs text-slate-600">
            ¿Aún no tienes cuenta de alumno?{' '}
            <Link href="/registro" className="font-bold text-brand-700 hover:underline">
              Crear ficha en el aula
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
