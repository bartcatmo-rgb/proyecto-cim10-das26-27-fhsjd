import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth/session';
import { searchCim10Codes } from '@/lib/db/queries';
import { FileSpreadsheet, Search, Info, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ q?: string; chapter?: string }>;
}

export default async function CatalogPage({ searchParams }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  const params = await searchParams;
  const query = params.q || '';
  const chapterFilter = params.chapter || '';

  const codes = searchCim10Codes(query, chapterFilter, 60);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-700 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Catálogo Clínico CIM-10 · FHSJD
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Buscador normativo de códigos, notas de inclusión, exclusión 1 y 2, y reglas de 7º carácter.
          </p>
        </div>

        <div className="text-xs bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-slate-600">
          Mostrando <strong className="text-slate-900">{codes.length}</strong> códigos en catálogo activo
        </div>
      </div>

      {/* Search Bar Form */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form method="GET" action="/catalogo" className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Buscar por código (ej. I21, E11.22), término clínico (infarto, apendicitis)..."
              className="block w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              name="chapter"
              defaultValue={chapterFilter}
              className="block w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Todos los Capítulos</option>
              <option value="Capítulo 1">Cap. 1: Infecciosas (A00-B99)</option>
              <option value="Capítulo 2">Cap. 2: Neoplasias (C00-D49)</option>
              <option value="Capítulo 4">Cap. 4: Endocrinas y Metabólicas (E00-E89)</option>
              <option value="Capítulo 5">Cap. 5: Trastornos Mentales (F01-F99)</option>
              <option value="Capítulo 9">Cap. 9: Circulatorio (I00-I99)</option>
              <option value="Capítulo 10">Cap. 10: Respiratorio (J00-J99)</option>
              <option value="Capítulo 11">Cap. 11: Digestivo (K00-K95)</option>
              <option value="Capítulo 14">Cap. 14: Genitourinario (N00-N99)</option>
              <option value="Capítulo 15">Cap. 15: Embarazo y Parto (O00-O9A)</option>
              <option value="Capítulo 19">Cap. 19: Traumatismos y Causas Ext. (S00-T88)</option>
              <option value="Capítulo 21">Cap. 21: Factores y Códigos Z (Z00-Z99)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white bg-brand-700 hover:bg-brand-800 rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Code List */}
      <div className="space-y-4">
        {codes.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-base font-semibold text-slate-700">No se encontraron códigos coincidentes</div>
            <p className="text-xs text-slate-400">
              Prueba con otro término de búsqueda o restablece los filtros del catálogo.
            </p>
            <div className="pt-2">
              <Link
                href="/catalogo"
                className="text-xs font-semibold text-brand-700 hover:underline"
              >
                Ver todos los códigos
              </Link>
            </div>
          </div>
        ) : (
          codes.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-black px-2.5 py-1 bg-slate-900 text-teal-400 rounded-md">
                    {item.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.chapter}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    Cat: {item.category}
                  </span>
                  {item.isBillable && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Codificable directo
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {item.description}
                </h2>
              </div>

              {/* Notes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                {item.includesNotes && (
                  <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200/70 text-slate-700 space-y-1">
                    <span className="font-bold text-teal-900 flex items-center gap-1 text-[11px]">
                      <Info className="w-3.5 h-3.5 text-teal-700" />
                      Incluye:
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-700">{item.includesNotes}</p>
                  </div>
                )}

                {item.excludes1Notes && (
                  <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200 text-slate-700 space-y-1">
                    <span className="font-bold text-rose-900 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-700" />
                      Excluye 1 (No se codifica junto):
                    </span>
                    <p className="text-[11px] leading-relaxed text-rose-950 font-medium">{item.excludes1Notes}</p>
                  </div>
                )}

                {item.excludes2Notes && (
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200 text-slate-700 space-y-1">
                    <span className="font-bold text-amber-900 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                      Excluye 2 (No incluida aquí):
                    </span>
                    <p className="text-[11px] leading-relaxed text-amber-950">{item.excludes2Notes}</p>
                  </div>
                )}

                {item.rulesNotes && (
                  <div className="p-3 rounded-lg bg-indigo-50/60 border border-indigo-200 text-slate-700 space-y-1">
                    <span className="font-bold text-indigo-900 flex items-center gap-1 text-[11px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
                      Instrucción / Regla de Codificación:
                    </span>
                    <p className="text-[11px] leading-relaxed text-slate-700">{item.rulesNotes}</p>
                  </div>
                )}
              </div>

              {item.lateralitySeventhChar && (
                <div className="pt-2 text-xs flex items-center gap-2 text-slate-600">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">Lateralidad / 7º Carácter:</span>
                  <span className="text-slate-600">{item.lateralitySeventhChar}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}
