'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { Topic } from '@/lib/db/topics';

interface AdminTopic extends Topic {
  summariesCount: number;
  questionsCount: number;
}

export default function TopicManagerPanel() {
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PDF Upload Form
  const [file, setFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('Documentación Sanitaria');
  const [isNewCategoryMode, setIsNewCategoryMode] = useState(false);
  const [newCustomCategoryName, setNewCustomCategoryName] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [engineUsed, setEngineUsed] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic categories collected from database topics + default categories
  const dynamicCategories = Array.from(
    new Set([
      'Documentación Sanitaria',
      'Codificación Clínica Sanitaria',
      'Sistemas de Información Clínica',
      'Gestión de Archivo y Admisión',
      'Terminología Médica',
      'Atención Primaria y Comunitaria',
      'Urgencias y Emergencias Sanitarias',
      'Normativa y Gestión Hospitalaria',
      ...topics.map((t) => t.category).filter(Boolean),
    ])
  );

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/topics');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTopics(data.topics || []);
    } catch (err: any) {
      setError('No se pudieron cargar los temarios administrativos.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (topicId: string, currentStatus: number) => {
    const newStatus = currentStatus === 1 ? 0 : 1;
    // Optimistic
    setTopics((prev) =>
      prev.map((t) => (t.id === topicId ? { ...t, is_published: newStatus } : t))
    );

    try {
      await fetch(`/api/admin/topics/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: newStatus })
      });
    } catch {
      fetchTopics();
    }
  };

  const handleDeleteTopic = async (topicId: string, title: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar el temario "${title}" y todas sus lecciones y preguntas asociadas?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/topics/${topicId}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const d = await res.json();
        alert(d.error || 'Error al eliminar el temario');
        return;
      }
      setTopics((prev) => prev.filter((t) => t.id !== topicId));
    } catch {
      alert('Error de red al eliminar el temario');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        alert('Por favor selecciona un archivo con extensión .pdf');
        return;
      }
      setFile(selected);
      if (!customTitle) {
        setCustomTitle(selected.name.replace(/\.pdf$/i, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Selecciona un archivo PDF.');
      return;
    }

    setUploading(true);
    setUploadStatus('1/3: Extrayendo contenido textual mediante parser nativo...');
    setEngineUsed(null);

    const effectiveCategory =
      isNewCategoryMode && newCustomCategoryName.trim()
        ? newCustomCategoryName.trim()
        : customCategory.trim() || 'Documentación Sanitaria';

    const formData = new FormData();
    formData.append('file', file);
    if (customTitle.trim()) formData.append('title', customTitle.trim());
    formData.append('category', effectiveCategory);
    formData.append('is_published', isPublished ? '1' : '0');

    try {
      setTimeout(() => {
        setUploadStatus('2/3: Estructurando resúmenes, directrices y preguntas con el Motor de 3 Niveles...');
      }, 1000);

      const res = await fetch('/api/admin/topics/import-pdf', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el PDF');
      }

      setEngineUsed(data.engineUsed);
      setUploadStatus(`✅ Temario importado con éxito: ${data.topic.summariesCount} lecciones y ${data.topic.questionsCount} preguntas creadas.`);

      // Reset form
      setFile(null);
      setCustomTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh list
      fetchTopics();
    } catch (err: any) {
      setUploadStatus(`❌ ${err.message || 'Error en la importación'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: PDF IMPORT FORM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Cargar y Procesar Nuevo Temario en PDF
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracción nativa de texto y generación automática de resúmenes, directrices y preguntas con IA en 3 niveles
            </p>
          </div>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* File selector */}
            <div className="md:col-span-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Documento PDF Oficial *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-200 rounded-xl p-1 bg-slate-50"
              />
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título del Módulo / Tema (opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Tema 6: Procedimientos Quirúrgicos..."
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                disabled={uploading}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category / Thematic selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Temática / Categoría Académica
                </label>
                <button
                  type="button"
                  onClick={() => setIsNewCategoryMode(!isNewCategoryMode)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline transition"
                >
                  {isNewCategoryMode ? '← Elegir de existentes' : '+ Añadir nueva temática'}
                </button>
              </div>

              {isNewCategoryMode ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    placeholder="Escribe el nombre de la nueva temática..."
                    value={newCustomCategoryName}
                    onChange={(e) => setNewCustomCategoryName(e.target.value)}
                    disabled={uploading}
                    className="w-full text-xs bg-indigo-50/60 border border-indigo-300 rounded-xl px-3 py-2 text-indigo-950 font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-indigo-400"
                  />
                  <p className="text-[10px] text-slate-500">
                    Esta nueva temática se creará y quedará disponible para organizar todos los temas del curso.
                  </p>
                </div>
              ) : (
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  disabled={uploading}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {dynamicCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                disabled={uploading}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              Publicar inmediatamente para todos los alumnos del curso
            </label>

            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando PDF...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span>Importar y Generar Contenidos</span>
                </>
              )}
            </button>
          </div>

          {/* Status feedback */}
          {uploadStatus && (
            <div className={`p-3.5 rounded-xl text-xs font-medium border flex items-center justify-between ${
              uploadStatus.startsWith('✅')
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : uploadStatus.startsWith('❌')
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span>{uploadStatus}</span>
              {engineUsed && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  engineUsed === 'ollama-local' ? 'bg-purple-100 text-purple-800' :
                  engineUsed === 'cloud-ai' ? 'bg-sky-100 text-sky-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {engineUsed === 'ollama-local' ? '🤖 Ollama Local' :
                   engineUsed === 'cloud-ai' ? '☁️ Cloud AI' :
                   '⚡ Motor Clínico Offline'}
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* SECTION 2: TOPICS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Catálogo de Temarios Registrados ({topics.length})</h3>
            <p className="text-xs text-slate-500 mt-0.5">Control de publicación, lecciones estructuradas y bancos de preguntas</p>
          </div>
          <button
            onClick={fetchTopics}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Cargando temarios...</div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs">{error}</div>
        ) : topics.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No hay temarios disponibles.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Temario / Título</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-center">Lecciones</th>
                  <th className="px-4 py-3 text-center">Preguntas</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topics.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t.title}</span>
                        {t.is_core === 1 && (
                          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                            ⭐ Troncal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">/tema/{t.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{t.category}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{t.summariesCount}</td>
                    <td className="px-4 py-3 text-center font-semibold text-slate-700">{t.questionsCount}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleTogglePublish(t.id, t.is_published)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                          t.is_published === 1
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {t.is_published === 1 ? 'Publicado' : 'Borrador'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <a
                        href={`/tema/${t.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition inline-block"
                      >
                        Ver Módulo ↗
                      </a>
                      {t.is_core !== 1 && (
                        <button
                          onClick={() => handleDeleteTopic(t.id, t.title)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-medium transition"
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
