import React from 'react';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-white">
              AulaCIM-10 · FHSJD (DAS 26/27)
            </div>
            <div className="mt-1 text-slate-400">
              Plataforma docente de Codificación Clínica CIM-10 para Ciclos Formativos de Grado Superior en Documentación y Administración Sanitarias.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <HardDrive className="w-3.5 h-3.5 text-teal-400" />
              Persistencia SQLite WAL Local
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Zero PII / Sesión HMAC Blindada
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cumplimiento ENS / RGPD
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400">
          <div>
            © {new Date().getFullYear()} Fundación Hospital San Juan de Dios · Promoción DAS 26/27.
          </div>
          <div>
            Diseñado para uso en aula local (LAN) y acceso seguro en red docente.
          </div>
        </div>
      </div>
    </footer>
  );
}
