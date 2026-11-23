/**
 * Three-Tier Resilient AI Generation Engine for AulaCIM-10 · FHSJD
 * 
 * Level 1 (Local AI): Ollama on 127.0.0.1:11434 (timeout: 2000ms, skipped on Vercel)
 * Level 2 (Cloud AI): Optional Gemini or Groq API (timeout: 6000ms, structured JSON)
 * Level 3 (Offline Engine): 100% deterministic, offline clinical & educational structuring engine
 */

export type EngineUsed = 'ollama-local' | 'cloud-ai' | 'offline-clinical-engine';

export interface ThreeTierOutput<T> {
  data: T;
  engineUsed: EngineUsed;
}

interface GenerateParams<T> {
  prompt: string;
  systemPrompt?: string;
  offlineGenerator: () => T;
}

/**
 * Execute Three-Tier generation pipeline
 */
export async function executeThreeTierGeneration<T>(
  params: GenerateParams<T>
): Promise<ThreeTierOutput<T>> {
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || Boolean(process.env.VERCEL);

  // =========================================================================
  // TIER 1: Local Ollama (Only attempted in local/LAN environments with fast 2s timeout)
  // =========================================================================
  if (!isVercel) {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://127.0.0.1:11434';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || 'llama3',
          prompt: params.systemPrompt ? `${params.systemPrompt}\n\n${params.prompt}` : params.prompt,
          format: 'json',
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        const raw = json.response?.trim();
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return {
              data: parsed as T,
              engineUsed: 'ollama-local',
            };
          }
        }
      }
    } catch {
      // Local Ollama offline or timed out; seamlessly proceed to Tier 2
    }
  }

  // =========================================================================
  // TIER 2: Cloud AI (Optional: Gemini API or Groq API with 6000ms timeout)
  // =========================================================================
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${params.systemPrompt || 'Eres un docente experto en documentación sanitaria y codificación clínica CIM-10 en España.'}\n\nResponde ÚNICAMENTE con un JSON válido estricto sin markdown:\n${params.prompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            return {
              data: parsed as T,
              engineUsed: 'cloud-ai',
            };
          }
        }
      }
    } catch {
      // Gemini unavailable or timed out; proceed
    }
  }

  if (groqKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: params.systemPrompt || 'Genera únicamente salida JSON estructurada válida conforme al esquema solicitado.',
            },
            {
              role: 'user',
              content: params.prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content?.trim();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === 'object') {
            return {
              data: parsed as T,
              engineUsed: 'cloud-ai',
            };
          }
        }
      }
    } catch {
      // Groq unavailable; proceed
    }
  }

  // =========================================================================
  // TIER 3: Deterministic Offline Clinical & Educational Engine
  // =========================================================================
  // High-reliability offline generator executed in memory without external network calls
  const offlineData = params.offlineGenerator();
  return {
    data: offlineData,
    engineUsed: 'offline-clinical-engine',
  };
}
