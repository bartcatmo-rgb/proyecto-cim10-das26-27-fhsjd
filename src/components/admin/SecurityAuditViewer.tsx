'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Lock, Terminal } from 'lucide-react';
import { SecurityAuditLog } from '@/types';

export default function SecurityAuditViewer() {
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/security-logs');
      if (!res.ok) {
        throw new Error('No se pudieron recuperar los registros de seguridad.');
      }
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-600" />
            Auditoría de Ciberseguridad y Registro de Eventos (CISO)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Trazabilidad criptográfica de accesos, prevención IDOR, intentos de escalada de rol y anomalías en SQLite (CERO PII).
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </button>
      </div>

      {error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {error}
        </div>
      ) : loading && logs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Cargando registros de auditoría...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No hay anomalías de seguridad registradas.</p>
          <p className="text-[11px] text-slate-400 mt-1">El sistema opera con blindaje perimetral C1-C6 íntegro.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4">Evento</th>
                  <th className="py-3 px-4">Usuario / IP</th>
                  <th className="py-3 px-4">Detalles Operativos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const isCritical = log.severity === 'CRITICAL';
                  const isWarning = log.severity === 'WARNING';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isCritical
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-slate-900">
                        {log.eventType}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {log.userId || 'Anónimo'} {log.ipAddress ? `(${log.ipAddress})` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
