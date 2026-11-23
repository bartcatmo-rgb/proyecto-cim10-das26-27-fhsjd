'use client';

import { useState, useEffect } from 'react';

interface UseExamLockdownOptions {
  enabled?: boolean;
  examCode?: string;
  onSecurityAlert?: (message: string) => void;
}

export function useExamLockdown({
  enabled = true,
  examCode = 'MEAP_RUNNER',
  onSecurityAlert,
}: UseExamLockdownOptions = {}) {
  const [blurCount, setBlurCount] = useState(0);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const reportEvent = async (eventType: string, details: string) => {
    try {
      await fetch('/api/test/security-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          details,
          examCode,
        }),
      });
    } catch {
      // Non-blocking report
    }
  };

  const triggerAlert = (msg: string, eventType: string, details: string) => {
    setWarningMessage(msg);
    if (onSecurityAlert) {
      onSecurityAlert(msg);
    }
    reportEvent(eventType, details);
  };

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Block Context Menu (Right Click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerAlert(
        'El menú contextual (clic derecho) está inhabilitado durante el examen.',
        'CONTEXT_MENU_BLOCKED',
        'Intento de apertura de menú contextual / clic derecho en prueba.'
      );
    };

    // 2. Block Keyboard Shortcuts (Ctrl+C, Ctrl+S, Ctrl+U, Ctrl+P, F12, PrintScreen)
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (e.ctrlKey && (key === 'c' || key === 's' || key === 'u' || key === 'p' || key === 'a')) {
        e.preventDefault();
        triggerAlert(
          `La combinación de teclas Ctrl+${key.toUpperCase()} está inhabilitada en modo examen.`,
          'SHORTCUT_BLOCKED',
          `Intento de pulsar Ctrl+${key.toUpperCase()} durante la realización del examen.`
        );
        return;
      }

      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (key === 'i' || key === 'j' || key === 'c'))) {
        e.preventDefault();
        triggerAlert(
          'El acceso a herramientas de inspección o consola está restringido.',
          'DEVTOOLS_SHORTCUT_BLOCKED',
          'Intento de apertura de herramientas de desarrollo (F12 / Ctrl+Shift+I/J).'
        );
        return;
      }

      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerAlert(
          'La captura de pantalla está restringida durante la evaluación oficial.',
          'PRINTSCREEN_BLOCKED',
          'Pulsación de tecla ImprPant / PrintScreen detectada.'
        );
        return;
      }
    };

    // 3. Tab Switch & Window Blur Detection
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setBlurCount((prev) => prev + 1);
        triggerAlert(
          'AVISO DE INTEGRIDAD: Has cambiado de pestaña o minimizado la ventana del examen. Esta incidencia queda registrada en la auditoría docente.',
          'WINDOW_BLUR_TAB_SWITCH',
          'Pestaña minimizada o cambio de ventana del navegador durante el examen activo.'
        );
      }
    };

    const handleWindowBlur = () => {
      // Triggers if focus moves out of window
      setBlurCount((prev) => prev + 1);
      triggerAlert(
        'AVISO DE INTEGRIDAD: Foco del navegador perdido. Recuerda no alternar aplicaciones.',
        'WINDOW_BLUR_FOCUS_LOST',
        'Pérdida de foco de la ventana del navegador.'
      );
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [enabled, examCode]);

  const dismissWarning = () => setWarningMessage(null);

  return {
    warningMessage,
    dismissWarning,
    blurCount,
  };
}
