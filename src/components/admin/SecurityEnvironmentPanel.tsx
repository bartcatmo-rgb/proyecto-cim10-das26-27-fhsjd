'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Globe,
  Database,
  FileCheck2,
  RefreshCw,
  Download,
  LogOut,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Server,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Info,
  BellRing,
} from 'lucide-react';
import { User, SecurityOverviewResponse, SecurityAuditLog } from '@/types';

interface Props {
  adminUser: User;
}

export default function SecurityEnvironmentPanel({ adminUser }: Props) {
  const [data, setData] = useState<SecurityOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Time window toggle: 24h vs 7d
  const [timeWindow, setTimeWindow] = useState<'24h' | '7d'>('24h');

  // Table filtering and search
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'WARN' | 'INFO'>('ALL');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Modal for revoking sessions
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);
  const [revokeSuccessMessage, setRevokeSuccessMessage] = useState<string | null>(null);

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Test Alert state
  const [isTestingAlert, setIsTestingAlert] = useState(false);
  const [testAlertMessage, setTestAlertMessage] = useState<string | null>(null);

  // Fetch overview data from API
  const fetchOverview = async (page = currentPage) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '40');
      if (severityFilter !== 'ALL') params.set('severity', severityFilter);
      if (eventTypeFilter !== 'ALL') params.set('eventType', eventTypeFilter);
      if (searchTerm.trim()) params.set('search', searchTerm.trim());

      const res = await fetch(`/api/admin/security/overview?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('No tienes permisos de Administrador SOC para ver este panel.');
        }
        throw new Error('Error al consultar telemetría de seguridad SOC.');
      }

      const json: SecurityOverviewResponse = await res.json();
      setData(json);
      setCurrentPage(page);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el centro de ciberseguridad.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(1);
  }, [severityFilter, eventTypeFilter]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOverview(1);
  };

  // Revoke active sessions action
  const handleRevokeSessions = async () => {
    try {
      setIsRevoking(true);
      setError(null);
      const res = await fetch('/api/admin/security/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REVOKE_SESSIONS' }),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || 'No se pudieron revocar las sesiones activas.');
      }

      const resData = await res.json();
      setShowRevokeModal(false);
      setRevokeSuccessMessage(`Todas las sesiones activas han sido invalidadas (versión de sesión v${resData.newSessionVersion}).`);
      setTimeout(() => setRevokeSuccessMessage(null), 8000);
      fetchOverview(1);
    } catch (err: any) {
      setError(err.message || 'Error al ejecutar revocación global de sesiones.');
    } finally {
      setIsRevoking(false);
    }
  };

  // Export DPD JSON
  const handleExportDPD = async () => {
    try {
      setIsExporting(true);
      const res = await fetch('/api/admin/security/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXPORT_AUDIT_LOGS' }),
      });

      if (!res.ok) {
        throw new Error('No se pudo generar la exportación de auditoría DPD.');
      }

      const exportPayload = await res.json();
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-dpd-aulacim10-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al descargar registro de auditoría DPD.');
    } finally {
      setIsExporting(false);
    }
  };

  // Test Alert handler
  const handleTestAlert = async () => {
    try {
      setIsTestingAlert(true);
      setError(null);
      const res = await fetch('/api/admin/security/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TEST_ALERT' }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Fallo al disparar alerta de prueba.');
      }
      setTestAlertMessage(resData.message || 'Prueba de alerta procesada correctamente.');
      setTimeout(() => setTestAlertMessage(null), 8000);
      fetchOverview(currentPage);
    } catch (err: any) {
      setError(err.message || 'Error al solicitar prueba de alerta.');
    } finally {
      setIsTestingAlert(false);
    }
  };

  const kpis = timeWindow === '24h' ? data?.kpis24h : data?.kpis7d;

  // Render SVG Timeline graph
  const timelineData = data?.timeDistribution || [];
  const maxEvents = useMemo(() => {
    if (!timelineData.length) return 10;
    const maxVal = Math.max(...timelineData.map((b) => b.total));
    return maxVal === 0 ? 10 : Math.ceil(maxVal * 1.25);
  }, [timelineData]);

  return (
    <div className="space-y-6">
      {/* 1. Header with SOC Title, Semáforo Status and Primary Actions */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Centro de Operaciones de Ciberseguridad (SOC) · FHSJD</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Seguridad, Amenazas y Gobernanza de Datos</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Monitor de telemetría defensiva en tiempo real, verificación de cifrado AES-256-GCM, soberanía EEE (cdg1 París) y control estricto de sesiones bajo estándar BancActiu Zero-Trust.
            </p>
          </div>

          {/* Status Semáforo Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div
              className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border text-sm font-bold shadow-sm ${
                data?.globalStatus === 'ALERTA CRÍTICA'
                  ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
                  : data?.globalStatus === 'VIGILANCIA'
                  ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                  : 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
              }`}
            >
              {data?.globalStatus === 'ALERTA CRÍTICA' ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              ) : data?.globalStatus === 'VIGILANCIA' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-normal">Semáforo SOC Global</span>
                <span className="leading-tight">{data?.globalStatus || 'NORMAL'}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchOverview(currentPage)}
                disabled={loading}
                title="Actualizar telemetría"
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={handleTestAlert}
                disabled={isTestingAlert}
                title="Probar Alertas de Intrusión (Telegram / Webhook / Email)"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
              >
                <BellRing className={`w-4 h-4 ${isTestingAlert ? 'animate-bounce' : ''}`} />
                <span className="hidden sm:inline">Probar Alerta Admin</span>
              </button>

              <button
                type="button"
                onClick={handleExportDPD}
                disabled={isExporting}
                title="Exportar Registro de Auditoría para el DPD (RGPD / APDCAT)"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exportar Auditoría DPD</span>
              </button>

              <button
                type="button"
                onClick={() => setShowRevokeModal(true)}
                title="Revocar todas las sesiones activas en el centro educativo"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Revocar Sesiones</span>
              </button>
            </div>
          </div>
        </div>

        {/* Global Success Notification */}
        {revokeSuccessMessage && (
          <div className="mt-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{revokeSuccessMessage}</span>
          </div>
        )}

        {/* Test Alert Notification */}
        {testAlertMessage && (
          <div className="mt-4 p-3.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{testAlertMessage}</span>
          </div>
        )}

        {/* Global Error Notification */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-500/20 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 2. Environment Status & Cloud Sovereignty (6 Checkcards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: AES-256-GCM */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Cifrado AES-256-GCM</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                {data?.environment.dataEncryptionKeyConfigured ? 'ACTIVO' : 'FALLBACK'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Campos sensibles (DNI/NIE) cifrados con auth tag de 128 bits e IV aleatorio de 96 bits (NIST SP 800-38D).
            </p>
          </div>
        </div>

        {/* Card 2: Blind Indexing */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Blind Indexing (HMAC)</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-100 text-indigo-800">
                ACTIVO
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Búsquedas exactas seguras mediante HMAC-SHA256 sin descifrar la base de datos completa.
            </p>
          </div>
        </div>

        {/* Card 3: Soberanía de Datos EEE */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Globe className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Soberanía de Datos EEE</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-800">
                {data?.environment.region || 'cdg1 (París)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Región de ejecución fijada en Unión Europea. Cero transferencias internacionales de datos (RGPD).
            </p>
          </div>
        </div>

        {/* Card 4: Muro Zero-Trust BancActiu */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Muro Zero-Trust</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-800">
                ESTRICTO
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sin sesión no se monta ningún módulo funcional; bloqueo estricto 401/403 en todas las rutas de API.
            </p>
          </div>
        </div>

        {/* Card 5: Higienización Anti-PII en IA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Higienización IA (Anti-PII)</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                BLINDADO
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sanitización automática previa de prompts; prohibida cualquier fuga de identificadores hacia LLMs.
            </p>
          </div>
        </div>

        {/* Card 6: Cabeceras y Motor BD */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800">Cabeceras HSTS & CSP</h3>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-teal-100 text-teal-800">
                v{data?.environment.globalSessionVersion || 1}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              HSTS 2 años, CSP estricto, nosniff, DENY y versión de sesión global sincronizada en base de datos.
            </p>
          </div>
        </div>

        {/* Card 7: Canales de Alerta 100% Gratuitos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-3.5 sm:col-span-2 lg:col-span-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-800">Alertas de Intrusión 100% Gratuitas (Push / Webhook / Email)</h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  (data?.environment.alertChannels?.channelsCount || 0) > 0
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {(data?.environment.alertChannels?.channelsCount || 0) > 0
                    ? `${data?.environment.alertChannels?.channelsCount} canal(es) activo(s)`
                    : 'Modo pasivo (sin canales)'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Timeout 4s · Cooldown 10m · Cero SMS / Coste 0 €</span>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 ${
                data?.environment.alertChannels?.telegramConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data?.environment.alertChannels?.telegramConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Telegram Bot: {data?.environment.alertChannels?.telegramConfigured ? 'ACTIVO (Móvil Instantáneo)' : 'NO CONFIGURADO'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 ${
                data?.environment.alertChannels?.webhookConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data?.environment.alertChannels?.webhookConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Webhook / ntfy: {data?.environment.alertChannels?.webhookConfigured ? 'ACTIVO' : 'NO CONFIGURADO'}
              </span>

              <span className={`px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5 ${
                data?.environment.alertChannels?.emailConfigured
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${data?.environment.alertChannels?.emailConfigured ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                Email (Resend/SMTP): {data?.environment.alertChannels?.emailConfigured ? 'ACTIVO' : 'NO CONFIGURADO'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KPI Cards with Time Window Selector */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Indicadores Clave de Riesgo y Ciberseguridad (KPIs)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Monitoreo perimetral y trazabilidad de eventos según severidad operativa.
            </p>
          </div>

          {/* 24h vs 7d toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeWindow('24h')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeWindow === '24h'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimas 24 Horas
            </button>
            <button
              type="button"
              onClick={() => setTimeWindow('7d')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeWindow === '7d'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos 7 Días
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* KPI 1: Bloqueos 401/403 */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Bloqueos 401 / 403</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{kpis?.blocks401_403 ?? 0}</div>
            <span className="text-[10px] text-slate-400">Peticiones no autorizadas</span>
          </div>

          {/* KPI 2: Fallos Login & Rate Limit */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Fallos Login / Rate</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{kpis?.loginFailuresRateLimit ?? 0}</div>
            <span className="text-[10px] text-slate-400">Autenticaciones fallidas</span>
          </div>

          {/* KPI 3: IDOR & Escalada de Privilegios */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">IDOR / Escalada</span>
            <div className={`text-2xl font-black mt-1 ${(kpis?.idorPrivilegeEscalation ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {kpis?.idorPrivilegeEscalation ?? 0}
            </div>
            <span className="text-[10px] text-slate-400">Intentos de traspaso</span>
          </div>

          {/* KPI 4: Alertas Críticas */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Alertas Críticas</span>
            <div className={`text-2xl font-black mt-1 ${(kpis?.criticalAlerts ?? 0) > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {kpis?.criticalAlerts ?? 0}
            </div>
            <span className="text-[10px] text-slate-400">Severidad CRITICAL</span>
          </div>

          {/* KPI 5: Acciones RGPD */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Acciones RGPD</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">{kpis?.rgpdActions ?? 0}</div>
            <span className="text-[10px] text-slate-400">Portabilidad y supresión</span>
          </div>

          {/* KPI 6: Total Eventos */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider">Eventos Totales</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{kpis?.totalEvents ?? 0}</div>
            <span className="text-[10px] text-slate-400">Registros de telemetría</span>
          </div>
        </div>
      </div>

      {/* 4. Native SVG Incident Timeline Chart (No external libraries) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Cronología de Incidentes por Franja Temporal (24 Horas)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Distribución de volumen de eventos agregados en intervalos de 2 horas.
            </p>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500 inline-block" />
              <span className="text-slate-600 font-medium">Crítico</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400 inline-block" />
              <span className="text-slate-600 font-medium">Advertencia</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-indigo-500 inline-block" />
              <span className="text-slate-600 font-medium">Informativo</span>
            </div>
          </div>
        </div>

        {/* Responsive Native SVG Graph */}
        <div className="w-full h-48 sm:h-56 bg-slate-50/60 rounded-2xl p-4 border border-slate-100 flex items-center justify-center">
          {timelineData.length === 0 ? (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Sin eventos recientes registrados en la franja temporal.</span>
            </div>
          ) : (
            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
              {/* Horizontal background grid lines */}
              <line x1="0" y1="30" x2="600" y2="30" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="75" x2="600" y2="75" stroke="#e2e8f0" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#e2e8f0" strokeDasharray="3 3" />

              {/* Render Stacked Bars for each bucket */}
              {timelineData.map((bucket, idx) => {
                const totalBuckets = timelineData.length;
                const slotWidth = 600 / totalBuckets;
                const barWidth = Math.max(16, slotWidth * 0.55);
                const x = idx * slotWidth + (slotWidth - barWidth) / 2;

                const maxChartHeight = 110;
                const totalH = Math.min(maxChartHeight, Math.max(4, (bucket.total / maxEvents) * maxChartHeight));

                const critRatio = bucket.total > 0 ? bucket.critical / bucket.total : 0;
                const warnRatio = bucket.total > 0 ? bucket.warn / bucket.total : 0;
                const infoRatio = bucket.total > 0 ? bucket.info / bucket.total : 0;

                const critH = totalH * critRatio;
                const warnH = totalH * warnRatio;
                const infoH = totalH * infoRatio;

                const baseY = 135;
                const critY = baseY - critH;
                const warnY = critY - warnH;
                const infoY = warnY - infoH;

                return (
                  <g key={bucket.period} className="transition-all duration-300">
                    {/* Info segment */}
                    {infoH > 0 && (
                      <rect
                        x={x}
                        y={infoY}
                        width={barWidth}
                        height={infoH}
                        fill="#6366f1"
                        rx="2"
                      />
                    )}
                    {/* Warn segment */}
                    {warnH > 0 && (
                      <rect
                        x={x}
                        y={warnY}
                        width={barWidth}
                        height={warnH}
                        fill="#f59e0b"
                        rx="2"
                      />
                    )}
                    {/* Critical segment */}
                    {critH > 0 && (
                      <rect
                        x={x}
                        y={critY}
                        width={barWidth}
                        height={critH}
                        fill="#f43f5e"
                        rx="2"
                      />
                    )}

                    {/* Default empty indicator */}
                    {bucket.total === 0 && (
                      <rect
                        x={x}
                        y={baseY - 4}
                        width={barWidth}
                        height={4}
                        fill="#cbd5e1"
                        rx="2"
                      />
                    )}

                    {/* Time Label */}
                    <text
                      x={x + barWidth / 2}
                      y="152"
                      textAnchor="middle"
                      fontSize="9"
                      fill="#64748b"
                      fontWeight="600"
                    >
                      {bucket.label}
                    </text>

                    {/* Count on top of bar */}
                    {bucket.total > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={baseY - totalH - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#1e293b"
                        fontWeight="700"
                      >
                        {bucket.total}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>

      {/* 5. Real-Time Filterable Audit Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-brand-600" />
              <span>Registro de Auditoría de Ciberseguridad (CERO PII)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Eventos defensivos registrados con IP seudonimizada mediante HMAC y sanitización estricta.
            </p>
          </div>

          {/* Filtering Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Buscar por ruta o detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Severity filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">Todas las severidades</option>
              <option value="CRITICAL">Solo Crítico (CRITICAL)</option>
              <option value="WARN">Solo Advertencias (WARN)</option>
              <option value="INFO">Solo Informativo (INFO)</option>
            </select>

            {/* Event type filter */}
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              <option value="ALL">Todos los tipos de evento</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="RATE_LIMIT_BLOCKED">RATE_LIMIT_BLOCKED</option>
              <option value="UNAUTHORIZED_401">UNAUTHORIZED_401</option>
              <option value="FORBIDDEN_403">FORBIDDEN_403</option>
              <option value="PRIVILEGE_ESCALATION_ATTEMPT">PRIVILEGE_ESCALATION_ATTEMPT</option>
              <option value="IDOR_BLOCKED">IDOR_BLOCKED</option>
              <option value="INVALID_PDF_UPLOAD">INVALID_PDF_UPLOAD</option>
              <option value="RGPD_EXPORT">RGPD_EXPORT</option>
              <option value="RGPD_ANONYMIZE">RGPD_ANONYMIZE</option>
              <option value="SESSION_REVOKED">SESSION_REVOKED</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Severidad</th>
                <th className="py-3 px-4">Tipo de Evento</th>
                <th className="py-3 px-4">Ruta / Endpoint</th>
                <th className="py-3 px-4">IP Hash (HMAC)</th>
                <th className="py-3 px-4">Cliente / OS</th>
                <th className="py-3 px-4">Detalles Operativos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (!data?.recentLogs || data.recentLogs.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                    <span>Cargando telemetría defensiva...</span>
                  </td>
                </tr>
              ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                    <span>No hay eventos registrados con los filtros seleccionados.</span>
                  </td>
                </tr>
              ) : (
                data.recentLogs.map((log) => {
                  const isCrit = log.severity === 'CRITICAL';
                  const isWarn = log.severity === 'WARN' || log.severity === 'WARNING';
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      {/* Severity */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCrit
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : isWarn
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCrit ? 'bg-rose-600' : isWarn ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                          />
                          {log.severity}
                        </span>
                      </td>

                      {/* Event Type */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-semibold text-[11px] text-slate-800">
                        {log.eventType}
                      </td>

                      {/* Route */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                        {log.route || '—'}
                      </td>

                      {/* IP Hash / Masked */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500" title={log.ipAddress || ''}>
                        {log.ipHash || 'ip_anon'}
                      </td>

                      {/* Client User Agent */}
                      <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-600">
                        {log.userAgentSummary || 'Navegador Estándar'}
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-[11px] text-slate-700 max-w-xs sm:max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {data?.pagination && data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 text-xs text-slate-500">
            <span>
              Página <strong className="text-slate-800">{data.pagination.page}</strong> de{' '}
              <strong className="text-slate-800">{data.pagination.totalPages}</strong> ({data.pagination.total} registros)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchOverview(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>
              <button
                type="button"
                onClick={() => fetchOverview(currentPage + 1)}
                disabled={currentPage >= data.pagination.totalPages || loading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Revocation Confirmation Modal */}
      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">¿Revocar Todas las Sesiones?</h3>
                <p className="text-xs text-slate-500">Acción global de contención defensiva SOC</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción incrementará de forma inmediata la versión de sesión global en base de datos.
              <strong> Todos los alumnos y docentes con sesión iniciada en cualquier dispositivo serán desconectados</strong> y deberán autenticarse de nuevo.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div>• Administrador responsable: <strong>{adminUser.username}</strong></div>
              <div>• Acción auditada en: <strong>`security_audit_logs`</strong></div>
              <div>• Nivel de severidad: <strong>CRITICAL</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRevokeModal(false)}
                disabled={isRevoking}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRevokeSessions}
                disabled={isRevoking}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md shadow-rose-600/30 transition-colors disabled:opacity-50"
              >
                {isRevoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                <span>Confirmar Revocación</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
