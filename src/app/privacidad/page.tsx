import React from 'react';
import Link from 'next/link';
import { Shield, ArrowLeft, CheckCircle2, Lock, FileText, Server, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad y Protección de Datos · AulaCIM-10 (FHSJD)',
  description: 'Cláusula de protección de datos según RGPD (UE 2016/679), LOPDGDD (LO 3/2018) y criterios APDCAT para el ciclo DAS 26/27.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-700 hover:text-brand-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la portada de acceso</span>
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cumplimiento RGPD (UE 2016/679), LOPDGDD 3/2018 y Criterios APDCAT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Política de Privacidad y Tratamiento de Datos Académicos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            AulaCIM-10 · Campus Docent Sant Joan de Déu · Promoción DAS 26/27 (Documentación y Administración Sanitarias).
          </p>
          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex flex-wrap gap-4">
            <span>Versión de Política: <strong>v1.0-2026</strong></span>
            <span>Última revisión: <strong>Noviembre 2026</strong></span>
            <span>Ámbito territorial: <strong>Catalunya / España / Unión Europea</strong></span>
          </div>
        </div>

        {/* Informative Table (Capa 1 resumida) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            <span>Resumen Informativo Básico (Capa 1 - Art. 11 LOPDGDD)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs divide-y divide-slate-200 border border-slate-100 rounded-xl">
              <tbody className="divide-y divide-slate-100">
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900 w-1/4">Responsable</td>
                  <td className="px-4 py-3 text-slate-700">
                    Fundació Hospital Sant Joan de Déu (FHSJD) / Campus Docent Sant Joan de Déu.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Finalidad</td>
                  <td className="px-4 py-3 text-slate-700">
                    Gestión académica, evaluación formativa, registro de calificaciones y práctica de codificación clínica CIE-10-ES en el ciclo formativo DAS 26/27. Prohibida taxativamente cualquier cesión comercial o mercadotécnica.
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">Legitimación</td>
                  <td className="px-4 py-3 text-slate-700">
                    Cumplimiento de la relación educativa/formativa derivada de la matrícula (Art. 6.1.b RGPD) y consentimiento explícito en el registro (Art. 6.1.a RGPD).
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Destinatarios</td>
                  <td className="px-4 py-3 text-slate-700">
                    Equipo docente autorizado y coordinación pedagógica. No se realizan cesiones a terceros ni transferencias internacionales fuera del Espacio Económico Europeo (Servidores EEE: Región UE cdg1).
                  </td>
                </tr>
                <tr className="bg-slate-50/50">
                  <td className="px-4 py-3 font-bold text-slate-900">Derechos ARSOPOL</td>
                  <td className="px-4 py-3 text-slate-700">
                    Acceso, Rectificación, Supresión, Oposición, Limitación y Portabilidad dirigiéndose por escrito al Delegado de Protección de Datos (<code className="font-mono text-brand-700">dpo@fhsjd.local</code>) o mediante reclamación ante la Autoritat Catalana de Protecció de Dades (APDCAT).
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900">Edad mínima</td>
                  <td className="px-4 py-3 text-slate-700">
                    Conforme al Art. 7 de la LOPDGDD 3/2018, la edad mínima para el consentimiento directo en el registro es de <strong>14 años</strong>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Clauses (Capa 2) */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Compromiso de Privacidad por Diseño y por Defecto (Art. 25 RGPD)</h3>
            <p>
              La plataforma <strong>AulaCIM-10 · FHSJD (DAS 26/27)</strong> ha sido diseñada bajo estrictos criterios de minimización de datos y seguridad criptográfica. Solo se recaban los datos estrictamente necesarios para identificar al alumno en el ámbito académico del aula (nombre, DNI/NIE de alumno, correo institucional o de contacto y grupo académico).
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Cifrado en Reposo y Seudonimización Criptográfica (Art. 32 RGPD)</h3>
            <p>
              Conforme a los estándares de la Autoritat Catalana de Protecció de Dades (APDCAT) y las mejores prácticas de ciberseguridad (nivel BancActiu):
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li>El documento de identidad (DNI/NIE) se almacena cifrado en reposo mediante <strong>AES-256-GCM</strong> con vector de inicialización único por registro.</li>
              <li>Las consultas exactas se realizan mediante un <strong>Blind Index HMAC-SHA256 con clave</strong>, imposibilitando la lectura en claro del documento en caso de volcado del fichero de base de datos.</li>
              <li>Las contraseñas de acceso están protegidas con el algoritmo <strong>scrypt</strong> con sal criptográfica aleatoria de 16 bytes por usuario, resistente a ataques por fuerza bruta o hardware GPU.</li>
              <li>Las sesiones se gestionan mediante cookies firmadas con atributos <code>HttpOnly</code>, <code>SameSite=Lax</code> y <code>Secure</code> en conexiones HTTPS.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">3. Aislamiento Estricto de Inteligencia Artificial (Zero PII a IA)</h3>
            <p>
              Los motores de asistencia pedagógica y generación didáctica de casos clínicos (tanto Ollama en local como modelos en nube) operan bajo una regla absoluta de <strong>Cero Información Personal Identificable (Zero PII)</strong>. Ningún nombre, apellido, DNI, correo o calificación de alumnos se transmite a APIs externas; únicamente se procesa texto técnico, manuales sanitarios oficiales y pautas de codificación clínica.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">4. Ciclo de Vida y Supresión / Anonimización de Exalumnos (Art. 17 RGPD)</h3>
            <p>
              Los datos se conservan durante el año académico lectivo. Finalizado el ciclo o en caso de baja, el panel docente cuenta con herramientas de <strong>anonimización irreversible</strong>, mediante la cual se purgan el nombre, apellidos, DNI, correo y credenciales, convirtiendo el registro en un identificador estadístico anónimo no reversible que preserva la coherencia de las medias pedagógicas del curso sin rastro de datos personales.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">5. Ejercicio de Derechos y Contacto con el DPO</h3>
            <p>
              Los usuarios pueden solicitar en cualquier momento la exportación íntegra de sus datos académicos (Derecho de Portabilidad, Art. 20 RGPD) o la rectificación/supresión de los mismos comunicándose con el Delegado de Protección de Datos en <code className="font-mono text-brand-700 bg-slate-100 px-1 py-0.5 rounded">dpo@fhsjd.local</code>. Asimismo, tienen derecho a presentar reclamación formal ante la <strong>Autoritat Catalana de Protecció de Dades (APDCAT)</strong> (<a href="https://apdcat.gencat.cat" target="_blank" rel="noreferrer" className="text-brand-600 underline">apdcat.gencat.cat</a>).
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
