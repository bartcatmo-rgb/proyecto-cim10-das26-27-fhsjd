'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GraduationCap,
  ShieldAlert,
  Server,
  Download,
  Printer,
  Sparkles,
  ArrowLeft,
  Tv,
  FileText,
  Search,
  ExternalLink,
} from 'lucide-react';
import MarkdownViewer from '@/components/MarkdownViewer';
import PresentationViewer from '@/components/PresentationViewer';

export interface ManualItem {
  id: 'alumnos' | 'profesores' | 'administradores' | 'instituto_it';
  title: string;
  category: string;
  description: string;
  filename: string;
  content: string;
}

interface ManualsCenterProps {
  profile: 'student' | 'teacher' | 'admin';
  manuals: ManualItem[];
  canWatchPresentation: boolean;
}

const MANUAL_ICONS = {
  alumnos: GraduationCap,
  profesores: BookOpen,
  administradores: ShieldAlert,
  instituto_it: Server,
};

export default function ManualsCenter({
  profile,
  manuals,
  canWatchPresentation,
}: ManualsCenterProps) {
  const [activeTab, setActiveTab] = useState<string>(
    manuals[0]?.id || 'alumnos'
  );
  const [searchFilter, setSearchFilter] = useState('');

  const activeManual = manuals.find((m) => m.id === activeTab);
  const isPresentationActive = activeTab === 'presentacion';

  const handleDownload = (id: string, filename: string) => {
    window.location.href = `/api/manuals?id=${id}&download=1`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Centro de Manuales */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mb-1">
            <Link href="/" className="hover:text-brand-600 transition">Inicio</Link>
            <span>/</span>
            <span className="text-slate-800">Centro de Documentación</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-600" />
            Manuales Oficiales y Recursos Pedagógicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Documentación técnica, metodológica y operativa adaptada a tu perfil institucional (
            <span className="font-bold text-slate-800 uppercase text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
              {profile === 'admin' ? 'Administrador' : profile === 'teacher' ? 'Docente' : 'Estudiante'}
            </span>
            ).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canWatchPresentation && (
            <Link
              href="/presentacion"
              className="px-3.5 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 shadow-sm shadow-brand-500/20"
            >
              <Tv className="w-4 h-4" />
              <span>Ver Presentación Completa</span>
            </Link>
          )}

          <Link
            href="/"
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition inline-flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Aula
          </Link>
        </div>
      </div>

      {/* Pestañas de Navegación Filtradas por Rol */}
      <div className="flex flex-wrap border-b border-slate-200 gap-2">
        {manuals.map((manual) => {
          const Icon = MANUAL_ICONS[manual.id] || FileText;
          const isActive = activeTab === manual.id;
          return (
            <button
              key={manual.id}
              type="button"
              onClick={() => setActiveTab(manual.id)}
              className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
                isActive
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{manual.category}</span>
            </button>
          );
        })}

        {/* Pestaña de Presentación Multimedia: Exclusiva para Admin y Docente */}
        {canWatchPresentation && (
          <button
            type="button"
            onClick={() => setActiveTab('presentacion')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
              isPresentationActive
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-indigo-500 hover:text-indigo-800'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span className="flex items-center gap-1.5">
              <span>Presentación Multimedia</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-mono">
                Voz Neural
              </span>
            </span>
          </button>
        )}
      </div>

      {/* Vista de Presentación Multimedia */}
      {isPresentationActive && canWatchPresentation ? (
        <div className="space-y-4">
          <PresentationViewer />
        </div>
      ) : activeManual ? (
        /* Vista del Manual Activo */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Barra de Acciones del Manual */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[11px] uppercase font-bold text-brand-600 tracking-wider">
                {activeManual.category} · AulaCIM-10
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                {activeManual.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {activeManual.description}
              </p>
            </div>

            <div className="flex items-center gap-2 print:hidden">
              <button
                type="button"
                onClick={() => handleDownload(activeManual.id, activeManual.filename)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                title="Descargar archivo en Markdown nativo (.md)"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Descargar (.md)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-slate-200"
                title="Imprimir o guardar como PDF"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>

          {/* Renderizado del contenido Markdown */}
          <div className="pt-2">
            <MarkdownViewer content={activeManual.content} />
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          No hay manual seleccionado o no tiene permisos para este documento.
        </div>
      )}
    </div>
  );
}
