'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { TopicWithProgress } from '@/lib/db/topics';
import LearningPerformanceChart from './LearningPerformanceChart';

interface TopicIndexViewProps {
  onSelectTopic?: (slug: string) => void;
  onOpenTraining?: () => void;
  onOpenReverse?: () => void;
  onOpenKahoot?: () => void;
}

export default function TopicIndexView({
  onSelectTopic,
  onOpenTraining,
  onOpenReverse,
  onOpenKahoot
}: TopicIndexViewProps) {
  const [topics, setTopics] = useState<TopicWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topics' | 'chart'>('topics');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/topics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      setError('No se pudieron cargar los temarios. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...Array.from(new Set(topics.map((t) => t.category)))];

  const filteredTopics = topics.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* View Switcher: Temarios vs Rendimiento */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'topics'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Índice de Temarios ({topics.length})
          </button>
          <button
            onClick={() => setActiveTab('chart')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'chart'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Mi Curva de Aprendizaje y Rendimiento
          </button>
        </div>

        {activeTab === 'topics' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar temario o directriz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-64 pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-2.5 top-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {categories.length > 2 && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'Todas las categorías' : c}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'chart' ? (
        <LearningPerformanceChart />
      ) : loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent mb-3" />
          <p className="text-sm font-medium text-slate-600">Cargando temarios oficiales del centro...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchTopics}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
          >
            Reintentar
          </button>
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm text-slate-500">
          <p className="text-sm font-medium">No se encontraron temarios que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                topic.is_core === 1
                  ? 'border-indigo-300 ring-1 ring-indigo-100 bg-gradient-to-b from-indigo-50/20 to-white'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {topic.category}
                  </span>
                  {topic.is_core === 1 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      ⭐ Troncal Oficial
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {topic.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5">
                  <span>Progreso: {topic.progressPercentage}%</span>
                  <span>{topic.completedSummariesCount}/{topic.summariesCount} lecciones</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      topic.progressPercentage >= 80 ? 'bg-emerald-500' :
                      topic.progressPercentage >= 40 ? 'bg-indigo-600' :
                      topic.progressPercentage > 0 ? 'bg-amber-500' : 'bg-slate-200'
                    }`}
                    style={{ width: `${topic.progressPercentage}%` }}
                  />
                </div>

                {/* Score badge if available */}
                {typeof topic.averageScore === 'number' && topic.averageScore > 0 && (
                  <div className="text-[11px] text-slate-600 mb-3 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
                    <span className="text-slate-500">Nota media:</span>
                    <span className="font-bold text-indigo-900">
                      {topic.averageScore.toFixed(1)} / 10 ({topic.attemptsCount} pruebas)
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link
                    href={`/tema/${topic.slug}`}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      topic.is_core === 1
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    <span>Entrar al Tema</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>

                  {/* Submenu Quick Links */}
                  <div className="grid grid-cols-4 gap-1 text-[10px] text-center font-medium">
                    <Link
                      href={`/tema/${topic.slug}?tab=temario`}
                      className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/60 transition truncate"
                      title="Temario y Resúmenes"
                    >
                      📖 Temario
                    </Link>
                    <Link
                      href={`/tema/${topic.slug}?tab=examen`}
                      className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/60 transition truncate"
                      title="Pruebas y Exámenes"
                    >
                      ✍️ Examen
                    </Link>
                    <Link
                      href={`/tema/${topic.slug}?tab=inversa`}
                      className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/60 transition truncate"
                      title="Práctica Activa / Inversa"
                    >
                      🔍 Auditoría
                    </Link>
                    <Link
                      href={`/tema/${topic.slug}?tab=kahoot`}
                      className="py-1 px-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 rounded-lg border border-slate-200/60 transition truncate"
                      title="Kahoot"
                    >
                      🏆 Kahoot
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
