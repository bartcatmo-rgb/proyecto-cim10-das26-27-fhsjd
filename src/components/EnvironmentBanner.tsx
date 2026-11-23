'use client';

import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function EnvironmentBanner() {
  const envLabel = process.env.NEXT_PUBLIC_APP_ENV_LABEL;
  if (!envLabel) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 print:hidden flex items-center justify-between shadow-inner">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold tracking-wide text-white">{envLabel}</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">· Entorno Oficial DAS 26/27</span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 font-mono text-[10px] bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
            <ShieldCheck className="w-3 h-3 text-teal-400" /> CISO Blindado
          </span>
          <span className="hidden md:inline text-slate-400">Campus Docent Sant Joan de Déu</span>
        </div>
      </div>
    </div>
  );
}
