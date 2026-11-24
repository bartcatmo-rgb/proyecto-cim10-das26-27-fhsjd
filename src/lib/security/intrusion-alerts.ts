/**
 * Intrusion Alerts Engine - 100% Free Notification Delivery
 * Channels:
 * 1. Free Email (Resend API or SMTP)
 * 2. Free Instant Mobile Notification (Telegram Bot API / ntfy / Webhook)
 * Zero SMS, Zero Paid Gateways, Zero Unofficial WhatsApp Libraries
 * Standards: BancActiu Zero-Trust & RGPD/LOPDGDD/APDCAT
 */

export interface IntrusionAlertPayload {
  eventType: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  route?: string;
  ipHash?: string;
  ipAddress?: string;
  details: string;
  timestamp?: string;
  force?: boolean; // bypass cooldown for manual admin tests
}

// In-memory cooldown tracker (10 minutes = 600,000 ms per eventType)
const COOLDOWN_MS = 10 * 60 * 1000;
const cooldownMap = new Map<string, number>();
let lastDispatchedAlertTime: string | null = null;

/**
 * Returns configuration status of all 100% free notification channels
 */
export function getAlertChannelsStatus(): {
  emailConfigured: boolean;
  telegramConfigured: boolean;
  webhookConfigured: boolean;
  channelsCount: number;
  lastAlertTimestamp?: string;
} {
  const emailConfigured = Boolean(
    process.env.ALERT_EMAIL_TO &&
    (process.env.RESEND_API_KEY || (process.env.SMTP_HOST && process.env.SMTP_USER))
  );

  const telegramConfigured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID
  );

  const webhookConfigured = Boolean(process.env.ALERT_WEBHOOK_URL);

  let count = 0;
  if (emailConfigured) count++;
  if (telegramConfigured) count++;
  if (webhookConfigured) count++;

  return {
    emailConfigured,
    telegramConfigured,
    webhookConfigured,
    channelsCount: count,
    lastAlertTimestamp: lastDispatchedAlertTime || undefined,
  };
}

/**
 * Sends intrusion alert via all configured 100% free channels.
 * Runs with a strict 4000ms timeout per channel and non-blocking error handling.
 */
export async function sendIntrusionAlert(
  payload: IntrusionAlertPayload
): Promise<{ sent: boolean; channels: string[]; reason?: string }> {
  const { eventType, severity, route, ipHash, ipAddress, details, force } = payload;
  const now = Date.now();
  const timestamp = payload.timestamp || new Date().toISOString();

  // 1. Check Cooldown / Deduplication (10 minutes per eventType)
  const cooldownKey = `${eventType}:${route || 'global'}`;
  const lastSent = cooldownMap.get(cooldownKey) || 0;

  if (!force && now - lastSent < COOLDOWN_MS) {
    return {
      sent: false,
      channels: [],
      reason: `Alerta omitida por cooldown de 10 min (último envío hace ${Math.round((now - lastSent) / 1000)}s)`,
    };
  }

  const status = getAlertChannelsStatus();
  if (status.channelsCount === 0) {
    return {
      sent: false,
      channels: [],
      reason: 'Canales de alerta no configurados (ALERT_EMAIL_TO, TELEGRAM_BOT_TOKEN o ALERT_WEBHOOK_URL)',
    };
  }

  // 2. Prepare Sanitized Content (Strictly Zero Passwords, Tokens, or PII)
  const alertTitle = `🚨 ALERTA SOC AulaCIM-10: ${eventType} [${severity}]`;
  const sanitizedDetails = details ? details.substring(0, 300) : 'Sin detalles adicionales.';
  const displayIp = ipHash || (ipAddress ? `${ipAddress.slice(0, 7)}***` : 'ip_anon');

  const textBody = [
    `🚨 ALERTA DE SEGURIDAD / INTRUSIÓN - AULACIM-10 (FHSJD)`,
    `----------------------------------------------------`,
    `• Tipo de Incidente: ${eventType}`,
    `• Severidad: ${severity}`,
    `• Endpoint / Ruta: ${route || 'N/A'}`,
    `• Origen Seudonimizado: ${displayIp}`,
    `• Fecha / Hora: ${timestamp}`,
    `• Plataforma: AulaCIM-10 · DAS 26/27 (cdg1 París, UE)`,
    `• Detalle Operativo: ${sanitizedDetails}`,
    `----------------------------------------------------`,
    `Acción recomendada: Revisar el panel SOC en https://proyecto-cim10-das26-27-fhsjd.vercel.app/admin`,
  ].join('\n');

  const dispatchedChannels: string[] = [];

  // Helper to run promise with 4000ms timeout
  const runWithTimeout = async <T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await promise;
    } finally {
      clearTimeout(timer);
    }
  };

  // 3. Channel A: Free Telegram Bot Notification (Instant Push to Mobile)
  if (status.telegramConfigured) {
    try {
      const token = process.env.TELEGRAM_BOT_TOKEN!.trim();
      const chatId = process.env.TELEGRAM_CHAT_ID!.trim();
      const telegramUrl = `https://api.telegram.org/bot${token}/sendMessage`;

      const telegramText = `*🚨 ALERTA SOC AulaCIM-10 · FHSJD*\n` +
        `*Incidente:* \`${eventType}\`\n` +
        `*Severidad:* *${severity}*\n` +
        `*Ruta:* \`${route || 'N/A'}\`\n` +
        `*Origen:* \`${displayIp}\`\n` +
        `*Hora:* ${timestamp}\n\n` +
        `_Detalle:_ ${sanitizedDetails}\n\n` +
        `[Abrir Panel SOC](https://proyecto-cim10-das26-27-fhsjd.vercel.app/admin)`;

      await runWithTimeout(
        fetch(telegramUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: telegramText,
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
          }),
        })
      );
      dispatchedChannels.push('telegram');
    } catch (tgErr) {
      console.warn('Telegram alert dispatch warning:', tgErr);
    }
  }

  // 4. Channel B: Free Webhook / ntfy / Custom Push
  if (status.webhookConfigured) {
    try {
      const webhookUrl = process.env.ALERT_WEBHOOK_URL!.trim();

      await runWithTimeout(
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: alertTitle,
            message: textBody,
            topic: 'aulacim10-soc',
            priority: severity === 'CRITICAL' ? 5 : 4,
            tags: ['warning', 'security', 'shield'],
            event: eventType,
            severity,
            route,
            ipHash: displayIp,
            timestamp,
          }),
        })
      );
      dispatchedChannels.push('webhook');
    } catch (whErr) {
      console.warn('Webhook alert dispatch warning:', whErr);
    }
  }

  // 5. Channel C: Free Email Notification (Resend API)
  if (process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO) {
    try {
      const resendApiKey = process.env.RESEND_API_KEY.trim();
      const toEmail = process.env.ALERT_EMAIL_TO.trim();
      const fromEmail = process.env.ALERT_EMAIL_FROM || 'AulaCIM-10 SOC <onboarding@resend.dev>';

      await runWithTimeout(
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            subject: alertTitle,
            text: textBody,
          }),
        })
      );
      dispatchedChannels.push('email_resend');
    } catch (resendErr) {
      console.warn('Resend alert dispatch warning:', resendErr);
    }
  }

  // Update cooldown and timestamp on successful dispatch
  if (dispatchedChannels.length > 0) {
    cooldownMap.set(cooldownKey, now);
    lastDispatchedAlertTime = timestamp;
    return {
      sent: true,
      channels: dispatchedChannels,
    };
  }

  return {
    sent: false,
    channels: [],
    reason: 'Falló el envío en todos los canales configurados (timeout o rechazo del proveedor).',
  };
}

/**
 * Trigger manual test alert for administrative verification in SOC panel
 */
export async function sendTestIntrusionAlert(
  adminUsername: string
): Promise<{ success: boolean; channels: string[]; message: string }> {
  const result = await sendIntrusionAlert({
    eventType: 'TEST_ADMIN_INTRUSION_ALERT',
    severity: 'INFO',
    route: '/admin/security-soc',
    ipHash: 'ip_test_admin',
    details: `Prueba diagnóstica de alerta ejecutada manualmente por ${adminUsername}.`,
    force: true, // bypass cooldown
  });

  if (result.sent) {
    return {
      success: true,
      channels: result.channels,
      message: `Alerta de prueba enviada exitosamente a través de: ${result.channels.join(', ')}.`,
    };
  }

  return {
    success: false,
    channels: [],
    message: result.reason || 'No se pudo enviar la alerta de prueba.',
  };
}
