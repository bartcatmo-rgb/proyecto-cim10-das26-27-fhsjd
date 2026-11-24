import React from 'react';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-[11px] py-2 border-t border-slate-800 print:hidden flex-shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">AulaCIM-10 · FHSJD (DAS 26/27)</span>
            <span className="text-slate-500 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline">Fundación Hospital San Juan de Dios · Ciclo CFGS DAS</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-300">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              <HardDrive className="w-3 h-3 text-teal-400" />
              SQLite Local
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              <Lock className="w-3 h-3 text-amber-400" />
              Zero PII
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              RGPD / APDCAT
            </span>
            <span className="text-slate-500 pl-1">
              © {new Date().getFullYear()} FHSJD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
