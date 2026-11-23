'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';
import { validateDniNie } from '@/lib/auth/validation';

export default function PublicLandingView() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register State
  const [regData, setRegData] = useState({
    fullName: '',
    dniNie: '',
    academicGroup: 'DAS 26/27 - Grupo A',
    email: '',
    phone: '',
    username: '',
    password: '',
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const dniCheck = regData.dniNie.trim().length >= 8 ? validateDniNie(regData.dniNie) : null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: loginIdentifier,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Credenciales no válidas. Revise su usuario/DNI y contraseña.');
        setLoginLoading(false);
        return;
      }

      // Success: reload/refresh home page
      router.push('/');
      router.refresh();
    } catch {
      setLoginError('Error de comunicación con el servidor del aula.');
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (dniCheck && !dniCheck.valid) {
      setRegError(dniCheck.error || 'El DNI/NIE no cumple con el algoritmo oficial español.');
      return;
    }

    if (regData.password.length < 8) {
      setRegError('La contraseña debe contener al menos 8 caracteres.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });

      const data = await res.json();
      if (!res.ok) {
        setRegError(data.error || 'Error al completar el registro.');
        setRegLoading(false);
        return;
      }

      // Success: reload/refresh home page
      router.push('/');
      router.refresh();
    } catch {
      setRegError('Error al conectar con el servidor.');
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl w-full space-y-6">
        
        {/* Institutional Branding Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-700 border border-brand-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Fundación Hospital San Juan de Dios · Promoción DAS 26/27</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Aula Virtual de Codificación CIM-10
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Plataforma docente especializada en entrenamiento <strong className="text-slate-800">MEAP</strong>, 
            auditoría de errores y seguimiento por niveles para el Ciclo de Documentación y Administración Sanitarias.
          </p>
        </div>

        {/* Tab Selection Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="flex border-b border-slate-200 bg-slate-50/80">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setLoginError(null);
              }}
              className={`flex-1 py-3.5 text-xs sm:text-sm font-bold text-center transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'login'
                  ? 'border-brand-600 text-brand-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Iniciar Sesión</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setRegError(null);
              }}
              className={`flex-1 py-3.5 text-xs sm:text-sm font-bold text-center transition-all flex items-center justify-center gap-2 border-b-2 ${
                activeTab === 'register'
                  ? 'border-brand-600 text-brand-700 bg-white shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Alta de Nuevo Alumno</span>
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: INICIAR SESIÓN */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Usuario o Documento (DNI / NIE)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="Ej. alumno o 12345678Z"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
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
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 transition-all shadow-md shadow-brand-700/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <span>Validando credenciales...</span>
                  ) : (
                    <>
                      <span>Acceder al Aula Virtual</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400">
                    ¿No tienes cuenta todavía?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('register')}
                      className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
                    >
                      Regístrate como alumno del curso
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* TAB 2: ALTA DE NUEVO ALUMNO */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4" autoComplete="off">
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{regError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={regData.fullName}
                      onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                      placeholder="Ej. Laura Gómez Fernández"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        DNI / NIE *
                      </label>
                      {dniCheck && (
                        <span
                          className={`text-[10px] font-bold ${
                            dniCheck.valid ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {dniCheck.valid ? '✓ Válido' : '✕ Inválido'}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={regData.dniNie}
                      onChange={(e) => setRegData({ ...regData, dniNie: e.target.value.toUpperCase() })}
                      placeholder="12345678Z o X1234567L"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      placeholder="alumno@hospital.org"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Grupo Académico *
                    </label>
                    <select
                      value={regData.academicGroup}
                      onChange={(e) => setRegData({ ...regData, academicGroup: e.target.value })}
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    >
                      <option value="DAS 26/27 - Grupo A">DAS 26/27 - Grupo A (Mañana)</option>
                      <option value="DAS 26/27 - Grupo B">DAS 26/27 - Grupo B (Tarde)</option>
                      <option value="DAS 26/27 - Repaso">DAS 26/27 - Repaso / Especial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre de Usuario *
                    </label>
                    <input
                      type="text"
                      required
                      autoComplete="off"
                      value={regData.username}
                      onChange={(e) => setRegData({ ...regData, username: e.target.value.toLowerCase() })}
                      placeholder="ej. lgomez"
                      className="block w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contraseña * (Mínimo 8 caracteres)
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        autoComplete="new-password"
                        value={regData.password}
                        onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                        placeholder="••••••••"
                        className="block w-full px-3 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 disabled:opacity-50 transition-all shadow-md shadow-brand-700/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {regLoading ? (
                    <span>Registrando alumno...</span>
                  ) : (
                    <>
                      <span>Completar Registro Oficial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <p className="text-[11px] text-slate-400">
                    ¿Ya estás registrado?{' '}
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className="font-bold text-brand-700 hover:text-brand-800 underline underline-offset-2"
                    >
                      Inicia sesión con tu cuenta
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Security & Academic Notice Footer Card */}
        <div className="bg-slate-100/80 rounded-xl border border-slate-200/80 p-4 text-center space-y-1 text-slate-500 text-[11px] leading-relaxed">
          <div className="flex items-center justify-center gap-1.5 font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Acceso Restringido · Entorno Docente Blindado</span>
          </div>
          <p>
            Uso reservado exclusivamente a alumnos matriculados y profesorado de la Fundación Hospital San Juan de Dios.
            Sesión segura con HMAC-SHA256 y protección de datos conforme a la normativa vigente.
          </p>
        </div>

      </div>
    </div>
  );
}
