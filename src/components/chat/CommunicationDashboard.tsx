'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Pin,
  EyeOff,
  Eye,
  Shield,
  User as UserIcon,
  RefreshCw,
  AlertCircle,
  Lock,
  Sparkles,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';
import { User, ChatChannel, ChatMessage } from '@/types';

interface Props {
  user: User;
}

export default function CommunicationDashboard({ user }: Props) {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessageText, setNewMessageText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = user.activeRole === 'admin' || user.role === 'admin';

  // 1. Fetch available channels
  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      setError(null);
      const res = await fetch('/api/chat/channels');
      if (!res.ok) {
        throw new Error('No se pudieron cargar los canales de comunicación.');
      }
      const data = await res.json();
      const loadedChannels: ChatChannel[] = data.channels || [];
      setChannels(loadedChannels);
      if (loadedChannels.length > 0 && !selectedChannelId) {
        setSelectedChannelId(loadedChannels[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al cargar canales.');
    } finally {
      setLoadingChannels(false);
    }
  };

  // 2. Fetch messages for selected channel
  const fetchMessages = async (channelId: string, silent = false) => {
    if (!channelId) return;
    try {
      if (!silent) setLoadingMessages(true);
      const res = await fetch(`/api/chat/messages?channelId=${encodeURIComponent(channelId)}`);
      if (!res.ok) {
        throw new Error('No se pudieron recuperar los mensajes del canal.');
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err: any) {
      if (!silent) setError(err.message || 'Error al obtener mensajes.');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannelId) {
      fetchMessages(selectedChannelId);
      // Auto-poll messages every 6 seconds for live classroom experience
      const interval = setInterval(() => {
        fetchMessages(selectedChannelId, true);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [selectedChannelId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle post message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedChannelId || sending) return;

    try {
      setSending(true);
      setError(null);
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannelId,
          content: newMessageText.trim(),
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'No se pudo enviar el mensaje.');
      }

      setNewMessageText('');
      // Append new message or refetch
      if (resData.message) {
        setMessages((prev) => [...prev, resData.message]);
      } else {
        fetchMessages(selectedChannelId, true);
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión al enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  // Moderation: Pin/Unpin
  const handleTogglePin = async (messageId: string, currentPinned: boolean) => {
    if (!isAdmin) return;
    try {
      const action = currentPinned ? 'unpin' : 'pin';
      const res = await fetch('/api/chat/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isPinned: !currentPinned } : m))
        );
        setStatusMessage(currentPinned ? 'Mensaje desfijado.' : 'Mensaje fijado en el canal.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      setError('Error al moderar mensaje.');
    }
  };

  // Moderation: Hide/Unhide
  const handleToggleHide = async (messageId: string, currentHidden: boolean) => {
    if (!isAdmin) return;
    try {
      const action = currentHidden ? 'unhide' : 'hide';
      const res = await fetch('/api/chat/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, action }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isHidden: !currentHidden } : m))
        );
        setStatusMessage(currentHidden ? 'Mensaje restaurado.' : 'Mensaje ocultado por moderación.');
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch {
      setError('Error al moderar mensaje.');
    }
  };

  const currentChannel = channels.find((c) => c.id === selectedChannelId);
  const isAnnouncementOnly = Boolean(currentChannel?.isAnnouncementOnly);
  const canPostInCurrentChannel = !isAnnouncementOnly || isAdmin;

  // Separate pinned and regular messages
  const pinnedMessages = messages.filter((m) => m.isPinned && !m.isHidden);
  const regularMessages = messages;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 text-brand-700 rounded-2xl">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Chat de Aula y Comunicación Docente
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800">
                DAS 26/27
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Canal interactivo seguro para consultas de codificación clínica CIM-10, tutorías y avisos oficiales de la FHSJD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-xs bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-slate-400" />
            <span>
              Conectado como: <strong>{user.fullName}</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                isAdmin ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {isAdmin ? 'Profesor / Docente' : 'Alumno'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => selectedChannelId && fetchMessages(selectedChannelId)}
            disabled={loadingMessages}
            title="Actualizar mensajes"
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status or error banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main Chat Layout: Channels Sidebar + Messages Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5 h-[calc(100vh-140px)] min-h-[450px]">
        {/* Left Column: Channels List */}
        <div className="lg:col-span-1 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Canales de Aula</span>
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              {channels.length}
            </span>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto">
            {loadingChannels ? (
              <div className="p-4 text-center text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1 text-brand-600" />
                <span>Cargando canales...</span>
              </div>
            ) : channels.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">No hay canales disponibles.</div>
            ) : (
              channels.map((chan) => {
                const isSelected = chan.id === selectedChannelId;
                return (
                  <button
                    key={chan.id}
                    type="button"
                    onClick={() => setSelectedChannelId(chan.id)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5">
                        {chan.isAnnouncementOnly ? (
                          <Lock className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-amber-600'}`} />
                        ) : (
                          <MessageSquare className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-300' : 'text-slate-400'}`} />
                        )}
                        <span>{chan.name}</span>
                      </span>
                      {chan.isAnnouncementOnly && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-amber-400/20 text-amber-200' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Avisos
                        </span>
                      )}
                    </div>
                    {chan.description && (
                      <p className={`text-[11px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                        {chan.description}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Quick Info Box */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-brand-600" />
              <span>Entorno Moderado</span>
            </div>
            <p>Los mensajes son auditados y se registran bajo estrictas normas de respeto docente y protección de datos.</p>
          </div>
        </div>

        {/* Right Column: Chat Messages & Input */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          {/* Channel Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {currentChannel?.name || 'Selecciona un canal'}
                </h2>
                {isAnnouncementOnly && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Solo Docentes</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{currentChannel?.description || ''}</p>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {messages.length} mensaje{messages.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Pinned Messages Banner (if any) */}
          {pinnedMessages.length > 0 && (
            <div className="p-3 bg-amber-50/80 border-b border-amber-200/60 text-xs text-amber-900 space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-amber-800">
                <Pin className="w-3.5 h-3.5" />
                <span>Mensajes Fijados en el Canal ({pinnedMessages.length})</span>
              </div>
              <div className="space-y-1.5">
                {pinnedMessages.map((pinMsg) => (
                  <div key={pinMsg.id} className="p-2 bg-white/80 rounded-xl border border-amber-200 text-[11px] flex items-start justify-between gap-2">
                    <div>
                      <strong>{pinMsg.userName}:</strong> {pinMsg.content}
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleTogglePin(pinMsg.id, true)}
                        className="text-[10px] text-amber-700 hover:text-amber-900 font-bold shrink-0"
                      >
                        Desfijar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[clamp(360px,55vh,650px)] min-h-[260px]">
            {loadingMessages && messages.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                <span>Cargando mensajes del canal...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="py-20 text-center text-xs text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">Este canal aún no tiene mensajes.</p>
                <p className="text-[11px]">¡Sé el primero en iniciar la conversación o consulta!</p>
              </div>
            ) : (
              regularMessages.map((msg) => {
                const isOwn = msg.userId === user.id;
                const isTeacher = msg.userRole === 'admin';
                const isHidden = msg.isHidden;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} ${
                      isHidden ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-[11px] font-bold text-slate-700">{msg.userName}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          isTeacher
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isTeacher ? 'Profesor' : 'Alumno'}
                      </span>
                      {msg.isPinned && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>Fijado</span>
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                        isOwn
                          ? 'bg-slate-900 text-white rounded-tr-none'
                          : isTeacher
                          ? 'bg-indigo-50/90 text-slate-900 border border-indigo-200 rounded-tl-none'
                          : 'bg-slate-100 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {isHidden ? (
                        <span className="italic text-slate-400">[Mensaje ocultado por moderación docente]</span>
                      ) : (
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>

                    {/* Teacher Moderation Bar */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(msg.id, msg.isPinned)}
                          className="hover:text-amber-600 transition-colors flex items-center gap-0.5"
                        >
                          <Pin className="w-2.5 h-2.5" />
                          <span>{msg.isPinned ? 'Desfijar' : 'Fijar'}</span>
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => handleToggleHide(msg.id, msg.isHidden)}
                          className="hover:text-rose-600 transition-colors flex items-center gap-0.5"
                        >
                          {msg.isHidden ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                          <span>{msg.isHidden ? 'Restaurar' : 'Ocultar'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <div className="p-4 border-t border-slate-100 bg-white">
            {canPostInCurrentChannel ? (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex items-end gap-2">
                  <textarea
                    rows={2}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Escribe un mensaje en #${currentChannel?.name || 'canal'}... (Enter para enviar)`}
                    maxLength={500}
                    className="flex-1 p-3 text-xs border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 resize-none text-slate-900"
                  />

                  <button
                    type="submit"
                    disabled={sending || !newMessageText.trim()}
                    className="inline-flex items-center justify-center p-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold transition-all shadow-md shadow-brand-600/30 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span>Presiona Shift + Enter para salto de línea</span>
                  <span>{newMessageText.length}/500</span>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Este canal está reservado exclusivamente para avisos del profesorado. Los alumnos tienen permisos de solo lectura.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
