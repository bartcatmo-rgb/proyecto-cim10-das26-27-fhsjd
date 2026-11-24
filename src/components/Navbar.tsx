'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Stethoscope,
  BookOpen,
  Award,
  History,
  User as UserIcon,
  Shield,
  LogOut,
  Menu,
  X,
  FileSpreadsheet,
  Sparkles,
  Sliders,
  Monitor,
  Tv,
  Zap,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';
import { User } from '@/types';
import { maskDni } from '@/lib/auth/validation';
import BrandLogo from '@/components/BrandLogo';

interface NavbarProps {
  user?: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const handleToggleRole = async () => {
    if (!user?.canSwitchRole || switchingRole) return;
    setSwitchingRole(true);
    try {
      const nextRole = user.activeRole === 'admin' ? 'student' : 'admin';
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole: nextRole }),
      });
      if (res.ok) {
        router.refresh();
        if (nextRole === 'student') {
          router.push('/');
        }
      }
    } finally {
      setSwitchingRole(false);
    }
  };

  const effectiveRole = user?.activeRole || user?.role;

  const navLinks = [
    { href: '/', label: 'Panel', icon: BookOpen },
    { href: '/entrenamiento', label: 'Entrenar MEAP', icon: Award },
    { href: '/test/inversa', label: 'Cod. Inversa', icon: ShieldAlert },
    { href: '/kahoot', label: 'Kahoot (10-20)', icon: Zap },
    { href: '/examenes-realizados', label: 'Pruebas Curso', icon: History },
    { href: '/catalogo', label: 'Catálogo', icon: FileSpreadsheet },
    { href: '/chat', label: 'Chat Aula', icon: MessageSquare },
    { href: '/manuales', label: 'Manuales', icon: BookOpen },
  ];

  if (effectiveRole === 'admin') {
    navLinks.push(
      { href: '/admin/pruebas', label: 'Configurar Pruebas', icon: Sliders },
      { href: '/admin/en-vivo', label: 'Monitor Aula', icon: Monitor },
      { href: '/presentacion', label: 'Presentación', icon: Tv },
      { href: '/admin', label: 'Gestión', icon: Shield }
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-12">
          
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <BrandLogo size="sm" />
          </Link>

          {/* Desktop Nav */}
          {user ? (
            <nav className="hidden xl:flex items-center space-x-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="text-xs font-semibold text-slate-500">
              Campus Docent Sant Joan de Déu · Acceso Identificado
            </div>
          )}

          {/* User profile info & Logout for shared PCs */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            {effectiveRole === 'admin' && (
              <Link
                href="/pizarra"
                target="_blank"
                title="Abrir Pizarra Digital de Proyección para Aula"
                className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200 rounded-md transition-colors"
              >
                <Tv className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pizarra</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
                <div className="text-right leading-tight">
                  <div className="font-bold text-slate-900 flex items-center justify-end gap-1 text-xs">
                    <span className="truncate max-w-[130px]">{user.fullName}</span>
                    {effectiveRole === 'admin' ? (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 border border-purple-200">
                        DOCENTE
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ALUMNO
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[130px]">
                    {user.academicGroup}
                  </div>
                </div>

                {user.canSwitchRole && (
                  <button
                    type="button"
                    onClick={handleToggleRole}
                    disabled={switchingRole}
                    title="Alternar entre perfil Docente y Alumno"
                    className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded transition-colors shadow-2xs"
                  >
                    <span>⇄</span>
                    <span>{switchingRole ? '...' : effectiveRole === 'admin' ? 'Alumno' : 'Docente'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  title="Cerrar sesión en este equipo compartido"
                  className="flex items-center gap-1 px-2 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                  <span>{loggingOut ? 'Saliendo...' : 'Salir'}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                  <Shield className="w-3 h-3 text-brand-600" />
                  <span>Acceso Identificado · FHSJD</span>
                </span>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center space-x-2">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="p-2 text-rose-700 bg-rose-50 rounded-lg border border-rose-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  aria-label="Abrir menú"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-brand-50 text-brand-800 border border-brand-200">
                <Shield className="w-3 h-3 text-brand-600" />
                <span>DAS 26/27</span>
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && user && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2">
            <div className="text-sm font-semibold text-slate-900">{user.fullName}</div>
            <div className="text-xs text-slate-500">{user.academicGroup} · DNI: {maskDni(user.dniNie)}</div>
          </div>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
