// Catálogo Semilla de 100 Casos MEAP - AulaCIM-10 · FHSJD (DAS 26/27)
import { Question } from '@/types';

export const SEED_100_MEAP_QUESTIONS: Omit<Question, 'id'>[] = [
  {
    "discipline": "atencion_primaria",
    "level": 1,
    "caseTitle": "Examen de salud preventivo en adulto asintomático",
    "clinicalScenario": "Varón de 45 años que acude a la consulta de Medicina Familiar en el Centro de Salud para someterse a su revisión médica anual de empresa. En la anamnesis y exploración física reglamentaria no se detectan hallazgos patológicos ni comorbilidades activas.",
    "serviceContext": "Atención Primaria - Consulta de Medicina Familiar",
    "patientAge": "45 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "Z00.00",
        "text": "Encuentro para examen médico general de rutina del adulto sin hallazgos anormales"
      },
      {
        "id": "B",
        "code": "Z00.01",
        "text": "Encuentro para examen médico general del adulto con hallazgos anormales"
      },
      {
        "id": "C",
        "code": "R68.89",
        "text": "Otros síntomas y signos generales especificados"
      },
      {
        "id": "D",
        "code": "Z02.89",
        "text": "Encuentro para otros exámenes con fines administrativos"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "El paciente acude con motivo profiláctico rutinario. La exploración es completamente normal.",
      "cim10Path": "Capítulo 21 -> Z00 -> Z00.0 -> Z00.00 (sin hallazgos anormales).",
      "ruleCheck": "La normativa CIM-10 exige diferenciar entre exámenes sin hallazgos (Z00.00) y con anomalías (Z00.01).",
      "distractorExplanations": {
        "A": "Opción correcta. Examen de salud general del adulto estrictamente asintomático.",
        "B": "Incorrecta: Se reserva a reconocimientos donde se detecte patología.",
        "C": "Incorrecta: Los códigos R solo se aplican ante signos o síntomas presentes.",
        "D": "Incorrecta: Reservado a reconocimientos para licencias o seguros."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 1,
    "caseTitle": "Vacunación antigripal estacional en centro de salud",
    "clinicalScenario": "Mujer de 68 años acude al centro de salud para la administración reglamentaria de la vacuna antigripal en el marco de la campaña anual de vacunación del adulto mayor.",
    "serviceContext": "Atención Primaria - Enfermería Comunitaria",
    "patientAge": "68 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "Z23",
        "text": "Encuentro para inmunización"
      },
      {
        "id": "B",
        "code": "J11.1",
        "text": "Gripe con otras manifestaciones respiratorias"
      },
      {
        "id": "C",
        "code": "Z00.129",
        "text": "Encuentro para examen de rutina del niño"
      },
      {
        "id": "D",
        "code": "T50.B95A",
        "text": "Efecto adverso de vacuna vírica, contacto inicial"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "El motivo asistencial es exclusivamente preventivo para inmunización antigripal.",
      "cim10Path": "Capítulo 21 -> Z23 (Encuentro para inmunización). En CIM-10 Z23 engloba cualquier vacuna.",
      "ruleCheck": "Z23 es diagnóstico principal cuando el motivo principal es la vacunación profiláctica.",
      "distractorExplanations": {
        "A": "Opción correcta. Código Z23 unívoco para administración de vacunas en CIM-10.",
        "B": "Incorrecta: Corresponde a padecer gripe clínica activa.",
        "C": "Incorrecta: Examen pediátrico, inaplicable a paciente de 68 años.",
        "D": "Incorrecta: Solo se usa si existe una reacción anafiláctica o adversa."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 2,
    "caseTitle": "Lumbalgia mecánica común sin compromiso radicular",
    "clinicalScenario": "Varón de 39 años acude por dolor lumbar de 4 días de evolución tras realizar sobreesfuerzo levantando peso. No refiere dolor irradiado a miembros inferiores ni clínica neurológica; exploración física con maniobra de Lasègue negativa bilateral.",
    "serviceContext": "Atención Primaria - Consulta Médica",
    "patientAge": "39 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "M54.50",
        "text": "Lumbalgia, no especificada"
      },
      {
        "id": "B",
        "code": "M54.40",
        "text": "Lumbago con ciática, lado no especificado"
      },
      {
        "id": "C",
        "code": "M51.16",
        "text": "Trastornos de disco intervertebral lumbar con radiculopatía"
      },
      {
        "id": "D",
        "code": "S39.012A",
        "text": "Distensión de músculo y tendón de espalda baja, episodio inicial"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Dolor en región lumbar baja de características mecánicas sin afectación del nervio ciático ni hernia discal demostrada.",
      "cim10Path": "Capítulo 13 (Sistema osteomuscular) -> M54 (Dorsalgia) -> M54.5 (Lumbalgia) -> M54.50.",
      "ruleCheck": "M54.50 es el código asignado a dolor lumbar cuando no existe ciática concomitante.",
      "distractorExplanations": {
        "A": "Opción correcta. Tipifica lumbalgia mecánica aislada sin ciática.",
        "B": "Incorrecta: El paciente no presenta compromiso ni dolor ciático irradiado.",
        "C": "Incorrecta: Requiere hernia o patología discal demostrada por neuroimagen.",
        "D": "Incorrecta: Se reserva a distensión o desgarro traumático muscular agudo diagnosticado."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "atencion_primaria",
    "level": 2,
    "caseTitle": "Rinitis alérgica estacional debida a polen de gramíneas",
    "clinicalScenario": "Mujer de 24 años consulta en mayo por estornudos en salva, rinorrea acuosa, prurito nasal y congestión ocular coincidente con la época de polinización primaveral. Pruebas de prick-test previas positivas a gramíneas.",
    "serviceContext": "Atención Primaria - Alergología Comunitaria",
    "patientAge": "24 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "J30.1",
        "text": "Rinitis alérgica debida al polen"
      },
      {
        "id": "B",
        "code": "J30.0",
        "text": "Rinitis vasomotora"
      },
      {
        "id": "C",
        "code": "J00",
        "text": "Rinofaringitis aguda [resfriado común]"
      },
      {
        "id": "D",
        "code": "J30.81",
        "text": "Rinitis alérgica debida a otros alérgenos (animales)"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Cuadro de hipersensibilidad tipo I estacional desencadenado por pólenes.",
      "cim10Path": "Capítulo 10 -> J30 (Rinitis vasomotora y alérgica) -> J30.1 (debida al polen).",
      "ruleCheck": "J30.1 especifica polinosis estacional; J30.0 es no alérgica y J00 es infecciosa.",
      "distractorExplanations": {
        "A": "Opción correcta. J30.1 corresponde exactamente a rinitis alérgica polínica (fiebre del heno).",
        "B": "Incorrecta: Rinitis vasomotora es de etiología física/colinérgica, no alérgica.",
        "C": "Incorrecta: Corresponde a catarro vírico agudo.",
        "D": "Incorrecta: Se refiere a epitelios de animales u ácaros, no a polen."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "atencion_primaria",
    "level": 3,
    "caseTitle": "Cardiopatía hipertensiva con insuficiencia cardíaca congestiva",
    "clinicalScenario": "Varón de 73 años con diagnóstico de hipertensión arterial esencial e insuficiencia cardíaca sistólica crónica que acude a control de cronicidad para ajuste posológico de fármacos vasodilatadores y diuréticos.",
    "serviceContext": "Atención Primaria - Programa de Crónicos",
    "patientAge": "73 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "I11.0 + I50.9",
        "text": "Cardiopatía hipertensiva con insuficiencia cardíaca (I11.0) e Insuficiencia cardíaca (I50.9)"
      },
      {
        "id": "B",
        "code": "I10 + I50.9",
        "text": "Hipertensión esencial (I10) e Insuficiencia cardíaca no especificada por separado"
      },
      {
        "id": "C",
        "code": "I10",
        "text": "Hipertensión esencial únicamente"
      },
      {
        "id": "D",
        "code": "I50.9",
        "text": "Insuficiencia cardíaca aislada sin codificar HTA"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Coexistencia de hipertensión arterial e insuficiencia cardíaca crónica.",
      "cim10Path": "Capítulo 9 -> I11 (Cardiopatía hipertensiva) -> I11.0. Requiere código secundario I50.-.",
      "ruleCheck": "Regla de Excluye 1 e instrucción de código combinado: La relación causal se presupone normativamente en CIM-10.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado I11.0 + código de manifestación de IC.",
        "B": "Incorrecta: La regla de exclusión de I10 prohíbe codificar I10 e I50.9 por separado si existe I11.",
        "C": "Incorrecta: Omite la insuficiencia cardíaca documentada.",
        "D": "Incorrecta: Ignora el diagnóstico primario de hipertensión."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "atencion_primaria",
    "level": 3,
    "caseTitle": "Cribado de cáncer colorrectal con test de sangre oculta en heces negativo",
    "clinicalScenario": "Mujer de 53 años incluida en el programa poblacional de detección precoz de cáncer colorrectal (cribado). Se entrega resultado analítico de sangre oculta en heces inmunológico que resulta negativo.",
    "serviceContext": "Atención Primaria - Prevención Oncológica",
    "patientAge": "53 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "Z12.11",
        "text": "Encuentro para cribado de neoplasia maligna de colon"
      },
      {
        "id": "B",
        "code": "K92.2",
        "text": "Hemorragia gastrointestinal, no especificada"
      },
      {
        "id": "C",
        "code": "C18.9",
        "text": "Neoplasia maligna de colon, no especificada"
      },
      {
        "id": "D",
        "code": "Z00.00",
        "text": "Examen médico general de rutina del adulto"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Contacto asistencial con fin específico de cribado preventivo neoplásico.",
      "cim10Path": "Capítulo 21 -> Z12 (Cribado especial de neoplasias) -> Z12.11 (colon).",
      "ruleCheck": "Los códigos de cribado (Z11-Z13) se aplican a personas asintomáticas sometidas a pruebas sistemáticas.",
      "distractorExplanations": {
        "A": "Opción correcta. Código específico para despistaje o cribado de cáncer colorrectal.",
        "B": "Incorrecta: El test fue negativo, no existe hemorragia digestiva clínica.",
        "C": "Incorrecta: No existe cáncer confirmado.",
        "D": "Incorrecta: Es un cribado oncológico específico, no una revisión general inespecífica."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 4,
    "caseTitle": "Diabetes mellitus tipo 2 con nefropatía diabética y ERC estadio 3a",
    "clinicalScenario": "Varón de 66 años acude a su médica de familia. La analítica anual evidencia filtrado glomerular de 52 ml/min/1.73m2 con microalbuminuria confirmada de 180 mg/g. El informe refleja nefropatía diabética en paciente diabético tipo 2.",
    "serviceContext": "Atención Primaria - Consulta Médica Cronicidad",
    "patientAge": "66 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "E11.22 + N18.31",
        "text": "Diabetes mellitus tipo 2 con nefropatía diabética (E11.22) + ERC estadio 3a (N18.31)"
      },
      {
        "id": "B",
        "code": "E11.9 + N18.30",
        "text": "Diabetes tipo 2 sin complicaciones (E11.9) + ERC estadio 3"
      },
      {
        "id": "C",
        "code": "N18.31",
        "text": "Enfermedad renal crónica estadio 3a únicamente"
      },
      {
        "id": "D",
        "code": "E10.22 + N18.31",
        "text": "Diabetes tipo 1 con nefropatía diabética + ERC 3a"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Diabetes mellitus tipo 2 con afectación microvascular renal y estadificación precisa de ERC.",
      "cim10Path": "Capítulo 4 -> E11.22 (DM2 con nefropatía diabética) + Capítulo 14 -> N18.31 (ERC estadio 3a).",
      "ruleCheck": "E11.22 contiene nota \"Use código adicional para estadio de ERC (N18.1-N18.6)\". Exige doble código.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado de diabetes con daño renal seguido del estadio preciso.",
        "B": "Incorrecta: Usa E11.9 (sin complicaciones) contradiciendo la presencia de nefropatía.",
        "C": "Incorrecta: Omite la etiología diabética subyacente.",
        "D": "Incorrecta: Asigna diabetes tipo 1 (E10) en vez de tipo 2."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "atencion_primaria",
    "level": 4,
    "caseTitle": "Hipotiroidismo primario autoinmune (Tiroiditis de Hashimoto)",
    "clinicalScenario": "Mujer de 48 años diagnosticada de tiroiditis crónica linfocitaria de Hashimoto con anticuerpos anti-TPO elevados y TSH de 8.5 mUI/L, en tratamiento crónico de mantenimiento con levotiroxina.",
    "serviceContext": "Atención Primaria - Endocrinología Básica",
    "patientAge": "48 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "E06.3",
        "text": "Tiroiditis autoinmunitaria (Tiroiditis de Hashimoto)"
      },
      {
        "id": "B",
        "code": "E03.9",
        "text": "Hipotiroidismo, no especificado"
      },
      {
        "id": "C",
        "code": "E05.00",
        "text": "Tirotoxicosis con bocio difuso"
      },
      {
        "id": "D",
        "code": "E89.0",
        "text": "Hipotiroidismo posquirúrgico"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Patología tiroidea primaria de etiología autoinmune específica con presencia de anticuerpos.",
      "cim10Path": "Capítulo 4 -> E06 (Tiroiditis) -> E06.3 (Tiroiditis autoinmunitaria / Hashimoto).",
      "ruleCheck": "La etiología documentada de tiroiditis de Hashimoto tiene código específico E06.3 preferente a E03.9.",
      "distractorExplanations": {
        "A": "Opción correcta. Código etiológico preciso para tiroiditis autoinmune de Hashimoto.",
        "B": "Incorrecta: Código no especificado cuando se conoce la causa autoinmune.",
        "C": "Incorrecta: Corresponde a hipertiroidismo / Enfermedad de Graves.",
        "D": "Incorrecta: No ha sido intervenida quirúrgicamente de tiroides."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "atencion_primaria",
    "level": 5,
    "caseTitle": "Seguimiento domiciliario de anciano pluripatológico con úlcera sacra estadio 2",
    "clinicalScenario": "Varón de 84 años encamado en domicilio. La médica acude a realizar valoración preferente por aparición de una úlcera por presión en región sacra estadio 2 con afectación de epidermis y dermis. El paciente padece demencia vascular e HTA.",
    "serviceContext": "Atención Primaria - Atención Domiciliaria (ESAD)",
    "patientAge": "84 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "L89.152 + I10 + F01.50",
        "text": "Úlcera por presión de región sacra estadio 2 (L89.152) como DP, seguida de HTA y Demencia vascular"
      },
      {
        "id": "B",
        "code": "I10 + L89.152",
        "text": "Hipertensión esencial como DP y úlcera como secundaria"
      },
      {
        "id": "C",
        "code": "L89.151",
        "text": "Úlcera por presión sacra estadio 1"
      },
      {
        "id": "D",
        "code": "F01.50 + L89.152",
        "text": "Demencia vascular como DP y úlcera como secundaria"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "El motivo directo que genera la visita urgente domiciliaria y el plan terapéutico es la úlcera sacra estadio 2.",
      "cim10Path": "Capítulo 12 -> L89 (Úlcera por presión) -> L89.15 (sacra) -> 6º carácter 2 (estadio 2): L89.152.",
      "ruleCheck": "Diagnóstico Principal es la afección que motivó específicamente el contacto asistencial preferente.",
      "distractorExplanations": {
        "A": "Opción correcta. L89.152 como DP justificativo de la visita y comorbilidades activas secundarias.",
        "B": "Incorrecta: La HTA no es la causa de la atención domiciliaria.",
        "C": "Incorrecta: Error de estadio (1 en lugar de 2).",
        "D": "Incorrecta: La demencia es una patología crónica de fondo, no la causa desencadenante."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 5,
    "caseTitle": "Portador de marcapasos bicameral definitivo acude para revisión técnica",
    "clinicalScenario": "Varón de 75 años portador de marcapasos cardíaco definitivo bicameral DDD implantado hace 3 años por bloqueo AV completo. Acude a la consulta médica para revisión periódica y comprobación de umbrales del dispositivo.",
    "serviceContext": "Atención Primaria - Consulta Médica",
    "patientAge": "75 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "Z45.018 + Z95.0",
        "text": "Encuentro para ajuste y manejo de marcapasos cardíaco (Z45.018) + Presencia de marcapasos (Z95.0)"
      },
      {
        "id": "B",
        "code": "I44.2",
        "text": "Bloqueo auriculoventricular completo agudo"
      },
      {
        "id": "C",
        "code": "T82.110A",
        "text": "Avería mecánica de electrodo de marcapasos cardíaco"
      },
      {
        "id": "D",
        "code": "Z95.0 únicamente",
        "text": "Presencia de marcapasos cardíaco sin código de cuidado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Visita para cuidado y revisión de un dispositivo electrónico implantable sin malfuncionamiento.",
      "cim10Path": "Capítulo 21 -> Z45.018 (manejo y prueba de marcapasos) + Z95.0 (presencia de marcapasos).",
      "ruleCheck": "Los códigos de revisión de dispositivos (Z45) tienen prioridad de asignación como DP sobre el estado (Z95).",
      "distractorExplanations": {
        "A": "Opción correcta. Z45.018 como código de encuentro/procedimiento seguido del código Z de estado.",
        "B": "Incorrecta: El bloqueo fue la causa del implante previo, no es un cuadro agudo sin resolver.",
        "C": "Incorrecta: No existe avería mecánica ni complicación.",
        "D": "Incorrecta: Omite el motivo de la consulta (la revisión/manejo)."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 1,
    "caseTitle": "Retirada programada de puntos de sutura posquirúrgicos",
    "clinicalScenario": "Varón de 31 años acude a sala de curas del centro de salud al 10º día posoperatorio de exéresis de quiste sebáceo para la retirada de 4 puntos de sutura de seda.",
    "serviceContext": "Atención Primaria - Curas y Cirugía Menor",
    "patientAge": "31 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "Z48.02",
        "text": "Encuentro para la retirada de suturas"
      },
      {
        "id": "B",
        "code": "L72.3",
        "text": "Quiste sebáceo"
      },
      {
        "id": "C",
        "code": "T81.4XXA",
        "text": "Infección posquirúrgica"
      },
      {
        "id": "D",
        "code": "Z48.89",
        "text": "Encuentro para otros cuidados posteriores a la cirugía especificados"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Contacto asistencial ambulatorio enfocado en la retirada de material de sutura.",
      "cim10Path": "Capítulo 21 -> Z48 (Cuidados posteriores a cirugía) -> Z48.02 (retirada de suturas).",
      "ruleCheck": "Z48.02 es código de alta especificidad para retirada de puntos/grapas.",
      "distractorExplanations": {
        "A": "Opción correcta. Código oficial unívoco de retirada de suturas.",
        "B": "Incorrecta: La lesión ya fue resecada en el procedimiento previo.",
        "C": "Incorrecta: No existe evidencia de infección.",
        "D": "Incorrecta: Existe código específico para suturas (Z48.02)."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 2,
    "caseTitle": "Dermatitis atópica flexural en adolescente",
    "clinicalScenario": "Chica de 16 años con eccema pruriginoso recidivante localizado en pliegues antecubitales y huecos poplíteos, con liquenificación secundaria al rascado crónico.",
    "serviceContext": "Atención Primaria - Consulta Médica",
    "patientAge": "16 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "L20.84",
        "text": "Dermatitis atópica intrínseca (alérgica) flexural"
      },
      {
        "id": "B",
        "code": "L23.9",
        "text": "Dermatitis de contacto alérgica, causa no especificada"
      },
      {
        "id": "C",
        "code": "L40.0",
        "text": "Psoriasis vulgar"
      },
      {
        "id": "D",
        "code": "B35.4",
        "text": "Tiña del cuerpo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Eccema atópico típico con localización en zonas de flexión articular.",
      "cim10Path": "Capítulo 12 -> L20 (Dermatitis atópica) -> L20.84 (flexural).",
      "ruleCheck": "L20.84 especifica afectación de pliegues flexurales típica de dermatitis atópica.",
      "distractorExplanations": {
        "A": "Opción correcta. Clasifica la dermatitis atópica flexural con exactitud.",
        "B": "Incorrecta: No es dermatitis de contacto por sustancia externa.",
        "C": "Incorrecta: La psoriasis afecta a superficies extensoras (codos, rodillas), no flexural.",
        "D": "Incorrecta: No hay infección micótica."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "atencion_primaria",
    "level": 3,
    "caseTitle": "Prescripción inicial de anticonceptivos orales combinados",
    "clinicalScenario": "Mujer de 21 años consulta solicitando consejo anticonceptivo e inicio de anticoncepción hormonal con píldora combinada. Tras la anamnesis sin contraindicaciones se emite receta e instrucciones de toma.",
    "serviceContext": "Atención Primaria - Salud Reproductiva",
    "patientAge": "21 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "Z30.011",
        "text": "Encuentro para prescripción inicial de anticonceptivos orales"
      },
      {
        "id": "B",
        "code": "Z30.41",
        "text": "Encuentro para vigilancia de anticonceptivos orales"
      },
      {
        "id": "C",
        "code": "Z32.01",
        "text": "Encuentro para prueba de embarazo, resultado positivo"
      },
      {
        "id": "D",
        "code": "Z30.09",
        "text": "Encuentro para consejo general sobre anticoncepción"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Contacto asistencial con inicio y primera prescripción de método hormonal oral.",
      "cim10Path": "Capítulo 21 -> Z30 (Manejo de anticoncepción) -> Z30.011 (prescripción inicial oral).",
      "ruleCheck": "CIM-10 distingue entre prescripción inicial (Z30.011) y vigilancia de mantenimiento (Z30.41).",
      "distractorExplanations": {
        "A": "Opción correcta. Especifica prescripción de primera vez de anticonceptivos orales.",
        "B": "Incorrecta: Se aplica a revisiones rutinarias tras meses de uso previo.",
        "C": "Incorrecta: La paciente no está embarazada.",
        "D": "Incorrecta: Código genérico cuando no se prescribe fármaco concreto."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 2,
    "caseTitle": "Síntoma inespecífico en estudio: Astenia y mareo leve",
    "clinicalScenario": "Varón de 50 años que consulta por sensación de cansancio de 3 semanas y mareo no vertiginoso. La analítica rápida de glucemia y constantes son normales. Se solicitan análisis completos sin diagnóstico firme.",
    "serviceContext": "Atención Primaria - Consulta Médica",
    "patientAge": "50 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "R53.83 + R42",
        "text": "Otra fatiga / astenia (R53.83) y Mareo y desvanecimiento (R42)"
      },
      {
        "id": "B",
        "code": "G43.909",
        "text": "Migraña no especificada"
      },
      {
        "id": "C",
        "code": "F41.9",
        "text": "Trastorno de ansiedad no especificado"
      },
      {
        "id": "D",
        "code": "D50.9",
        "text": "Anemia ferropénica sin confirmar"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Cuadro sintomático no filiado en Atención Primaria a la espera de resultados complementarios.",
      "cim10Path": "Capítulo 18 (Signos y síntomas R00-R99) -> R53.83 (fatiga) + R42 (mareo).",
      "ruleCheck": "En consultas ambulatorias los síntomas se codifican cuando no hay diagnóstico definitivo.",
      "distractorExplanations": {
        "A": "Opción correcta. Códigos sintomáticos del Capítulo 18 apropiados.",
        "B": "Incorrecta: No refiere cefalea migrañosa.",
        "C": "Incorrecta: La ansiedad es una hipótesis diagnóstica no confirmada.",
        "D": "Incorrecta: Prohibido codificar anemia sin resultado de hemoglobina confirmado."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "atencion_primaria",
    "level": 4,
    "caseTitle": "Cuidado y revisión de sonda de gastrostomía percutánea nutricional",
    "clinicalScenario": "Mujer de 72 años con secuelas de ELA portadora de gastrostomía percutánea (PEG) para nutrición enteral. Acude su enfermera a domicilio para limpieza del estoma y sustitución de botón de gastrostomía.",
    "serviceContext": "Atención Primaria - Cuidados Paliativos Domiciliarios",
    "patientAge": "72 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "Z43.1 + Z93.1",
        "text": "Encuentro para atención de gastrostomía (Z43.1) + Estado de gastrostomía (Z93.1)"
      },
      {
        "id": "B",
        "code": "K91.89",
        "text": "Otras complicaciones posprocedimiento del aparato digestivo"
      },
      {
        "id": "C",
        "code": "G12.21",
        "text": "Esclerosis lateral amiotrófica únicamente"
      },
      {
        "id": "D",
        "code": "T85.510A",
        "text": "Avería de dispositivo digestivo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Acto de enfermería programado para mantenimiento y cuidado de un estoma artificial digestivo.",
      "cim10Path": "Capítulo 21 -> Z43 (Atención de estomas artificiales) -> Z43.1 (gastrostomía).",
      "ruleCheck": "Los códigos Z43 clasifican la atención al orificio/estoma sin existir complicación.",
      "distractorExplanations": {
        "A": "Opción correcta. Código de atención al estoma seguido del código de presencia.",
        "B": "Incorrecta: No existe complicación patológica.",
        "C": "Incorrecta: ELA es la enfermedad de base, pero no el procedimiento asistencial del día.",
        "D": "Incorrecta: El recambio es programado, no por avería."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "urgencias",
    "level": 1,
    "caseTitle": "Dolor torácico atípico tras descarte completo de SCA",
    "clinicalScenario": "Mujer de 52 años que acude al Servicio de Urgencias por dolor torácico opresivo de 2 horas de evolución. ECG seriado normal y dos determinaciones de troponinas negativas. Tras 6 horas de observación es dada de alta con juicio clínico de \"Dolor torácico atípico sin cardiopatía isquémica\".",
    "serviceContext": "Urgencias Hospitalarias - Área de Observación",
    "patientAge": "52 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "R07.89",
        "text": "Otros dolores torácicos (Dolor torácico atípico)"
      },
      {
        "id": "B",
        "code": "I21.9",
        "text": "Infarto agudo de miocardio, no especificado"
      },
      {
        "id": "C",
        "code": "I20.0",
        "text": "Angina inestable descartada"
      },
      {
        "id": "D",
        "code": "Z03.89",
        "text": "Encuentro para observación por sospecha de afección descartada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "La paciente acude por síntoma cardinal en el pecho. Tras estudio urgente se descarta patología coronaria aguda.",
      "cim10Path": "Capítulo 18 -> R07 (Dolor en pecho) -> R07.89 (otros dolores torácicos).",
      "ruleCheck": "En urgencias ambulatorias se codifica el síntoma definitivo diagnosticado, nunca la sospecha descartada.",
      "distractorExplanations": {
        "A": "Opción correcta. Refleja fielmente el dolor torácico atípico definitivo emitido al alta.",
        "B": "Incorrecta: El infarto fue descartado con troponinas normales.",
        "C": "Incorrecta: Prohibido codificar angina cuando ha sido descartada formalmente.",
        "D": "Incorrecta: Z03 solo se usa en circunstancias excepcionales de screening sin síntomas presentes."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "urgencias",
    "level": 2,
    "caseTitle": "Fractura cerrada de radio distal derecho por caída casual en vía pública",
    "clinicalScenario": "Varón de 28 años ingresa en Urgencias tras sufrir una caída mientras patinaba en la calle. La radiografía confirma fractura de extremidad distal de radio derecho cerrada. Se realiza reducción e inmovilización con férula de yeso.",
    "serviceContext": "Urgencias Hospitalarias - Traumatología",
    "patientAge": "28 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "S52.501A",
        "text": "Fractura de extremo distal de radio derecho, contacto inicial por fractura cerrada"
      },
      {
        "id": "B",
        "code": "S52.502A",
        "text": "Fractura de extremo distal de radio izquierdo, contacto inicial por fractura cerrada"
      },
      {
        "id": "C",
        "code": "S52.501D",
        "text": "Fractura de extremo distal de radio derecho, contacto sucesivo"
      },
      {
        "id": "D",
        "code": "S52.501S",
        "text": "Fractura de extremo distal de radio derecho, secuela"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Lesión traumática aguda en extremidad superior derecha tratada en su primer encuentro asistencial.",
      "cim10Path": "Capítulo 19 -> S52 (Fractura antebrazo) -> S52.50 (radio distal) -> 6º dígito 1 (derecho) -> 7º carácter A.",
      "ruleCheck": "Séptimo carácter \"A\" obligatorio mientras el paciente recibe tratamiento activo agudo inicial.",
      "distractorExplanations": {
        "A": "Opción correcta. Lateralidad derecha (1) y contacto inicial por fractura cerrada (A).",
        "B": "Incorrecta: Error de lateralidad (2 = izquierdo).",
        "C": "Incorrecta: D se usa para contactos sucesivos de consolidación, no urgencias agudas.",
        "D": "Incorrecta: S se reserva a secuelas tardías."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 2,
    "caseTitle": "Conmoción cerebral sin pérdida de conocimiento en accidente deportivo",
    "clinicalScenario": "Chico de 17 años que sufre golpe directo cabeza contra cabeza durante partido de fútbol. En Urgencias presenta cefalea y mareo pero niega pérdida de conciencia. TAC craneal sin lesiones hemorrágicas.",
    "serviceContext": "Urgencias Pediátricas / Adultos",
    "patientAge": "17 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "S06.0X0A",
        "text": "Conmoción cerebral sin pérdida de conocimiento, contacto inicial"
      },
      {
        "id": "B",
        "code": "S06.0X1A",
        "text": "Conmoción cerebral con pérdida de conocimiento menor de 30 minutos"
      },
      {
        "id": "C",
        "code": "S00.03XA",
        "text": "Contusión del cuero cabelludo únicamente"
      },
      {
        "id": "D",
        "code": "R40.20",
        "text": "Coma, no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Traumatismo craneoencefálico cerrado con afectación conmocional encefálica pero sin pérdida del estado de alerta.",
      "cim10Path": "Capítulo 19 -> S06 (Traumatismo intracraneal) -> S06.0 (Conmoción) -> carácter X de relleno -> 0 (sin pérdida conocimiento) -> A.",
      "ruleCheck": "S06.0X0A exige el carácter de relleno X en 5ª posición y 7º carácter A.",
      "distractorExplanations": {
        "A": "Opción correcta. Conmoción sin pérdida de consciencia y relleno X reglamentario.",
        "B": "Incorrecta: No existió pérdida de conocimiento.",
        "C": "Incorrecta: La contusión externa no refleja el diagnóstico neurológico de conmoción.",
        "D": "Incorrecta: Glasgow 15, no en coma."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 3,
    "caseTitle": "Cólico nefrítico litiásico agudo con expulsión de cálculo ureteral",
    "clinicalScenario": "Varón de 42 años acude por dolor lacerante agudo en fosa renal izquierda irradiado a genitales con hematuria micro. La ecografía urgente identifica cálculo de 4 mm en uréter distal izquierdo sin hidronefrosis grave.",
    "serviceContext": "Urgencias Hospitalarias - Nefrología / Urología",
    "patientAge": "42 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "N20.1",
        "text": "Cálculo de uréter"
      },
      {
        "id": "B",
        "code": "N20.0",
        "text": "Cálculo de riñón"
      },
      {
        "id": "C",
        "code": "N23",
        "text": "Cólico renal, no especificado"
      },
      {
        "id": "D",
        "code": "R31.9",
        "text": "Hematuria, no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Litiásis urinaria con localización ecográfica demostrada en el uréter.",
      "cim10Path": "Capítulo 14 -> N20 (Calculosis del riñón y del uréter) -> N20.1 (cálculo de uréter).",
      "ruleCheck": "La categoría N23 (cólico renal sin especificar) tiene una nota de Excluye 1 con respecto a N20.- cuando se confirma litiasis.",
      "distractorExplanations": {
        "A": "Opción correcta. N20.1 tipifica cálculo localizado en uréter.",
        "B": "Incorrecta: El cálculo no está en el parénquima ni pelvis renal (N20.0).",
        "C": "Incorrecta: Excluye 1. No se codifica cólico inespecífico si se confirma cálculo ureteral.",
        "D": "Incorrecta: La hematuria es un síntoma integral del cólico litiásico."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "urgencias",
    "level": 3,
    "caseTitle": "Esguince de tobillo izquierdo con afectación del ligamento lateral externo",
    "clinicalScenario": "Mujer de 26 años acude por torsión de tobillo izquierdo al bajar un escalón. Presenta edema bimaleolar y dolor selectivo a la palpación del ligamento peroneoastragalino anterior. Maniobras radiológicas sin fractura.",
    "serviceContext": "Urgencias - Traumatología",
    "patientAge": "26 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "S93.402A",
        "text": "Esguince de ligamento no especificado de tobillo izquierdo, contacto inicial"
      },
      {
        "id": "B",
        "code": "S93.401A",
        "text": "Esguince de ligamento de tobillo derecho, contacto inicial"
      },
      {
        "id": "C",
        "code": "S82.892A",
        "text": "Fractura de otros extremos distales de tibia/peroné izquierdo"
      },
      {
        "id": "D",
        "code": "M24.272",
        "text": "Trastorno de ligamentos de tobillo izquierdo no traumático"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Distensión traumática articular ligamentosa aguda de tobillo izquierdo.",
      "cim10Path": "Capítulo 19 -> S93 (Luxación y esguince de tobillo) -> S93.4 (tobillo) -> 6º carácter 2 (izquierdo) -> 7º carácter A.",
      "ruleCheck": "Lateralidad estricta (1 = derecho, 2 = izquierdo, 9 = no especificado).",
      "distractorExplanations": {
        "A": "Opción correcta. Esguince agudo de tobillo izquierdo con contacto inicial A.",
        "B": "Incorrecta: Error de lateralidad (1 = derecho).",
        "C": "Incorrecta: Se descartó fractura ósea.",
        "D": "Incorrecta: Es un traumatismo agudo, no una patología degenerativa crónica (M)."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 4,
    "caseTitle": "Crisis asmática aguda en paciente con asma persistente moderada",
    "clinicalScenario": "Niño de 11 años traído a Urgencias por disnea sibilante de inicio brusco y tiraje intercostal. Antecedente conocido de asma persistente moderada. Responde favorablemente a aerosolterapia con salbutamol y corticoides orales.",
    "serviceContext": "Urgencias Pediátricas",
    "patientAge": "11 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "J45.41",
        "text": "Asma persistente moderada con exacerbación (aguda)"
      },
      {
        "id": "B",
        "code": "J45.901",
        "text": "Asma no especificada con exacerbación"
      },
      {
        "id": "C",
        "code": "J45.42",
        "text": "Asma persistente moderada con estado asmático (status)"
      },
      {
        "id": "D",
        "code": "R06.02",
        "text": "Respiración sibilante aislada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Agudización broncoespástica asmática en paciente con grado basal clasificado como persistente moderado.",
      "cim10Path": "Capítulo 10 -> J45 (Asma) -> J45.4 (persistente moderada) -> 5º carácter 1 (con exacerbación aguda) = J45.41.",
      "ruleCheck": "CIM-10 combina la gravedad basal (intermitente/leve/moderada/grave) con la exacerbación.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado exacto para asma moderada agudizada.",
        "B": "Incorrecta: Inespecífico, ignora el grado moderado diagnosticado.",
        "C": "Incorrecta: No presentó estatus asmático refractario que requiriera intubación o UCI.",
        "D": "Incorrecta: Síntoma descartado al existir diagnóstico etiológico de asma."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "urgencias",
    "level": 4,
    "caseTitle": "Intoxicación aguda accidental por sobredosis de benzodiacepinas",
    "clinicalScenario": "Mujer de 70 años con deterioro cognitivo traída a Urgencias en coma vigil superficial por confusión accidental al tomar la caja completa de lorazepam en vez de su medicación antihipertensiva. Responde al flumazenilo.",
    "serviceContext": "Urgencias Hospitalarias - Toxicología",
    "patientAge": "70 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "T42.4X1A",
        "text": "Envenenamiento por benzodiacepinas, accidental (involuntario), contacto inicial"
      },
      {
        "id": "B",
        "code": "T42.4X2A",
        "text": "Envenenamiento por benzodiacepinas, autolesión intencional (suicidio)"
      },
      {
        "id": "C",
        "code": "T42.4X5A",
        "text": "Efecto adverso de benzodiacepinas"
      },
      {
        "id": "D",
        "code": "F13.10",
        "text": "Abuso de sedantes o hipnóticos"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Sobredosis medicamentosa tóxica por error/accidente doméstico sin intencionalidad autolítica.",
      "cim10Path": "Capítulo 19 -> T42.4 (Benzodiacepinas) -> carácter de causa externa: 1 (accidental) -> 7º carácter A = T42.4X1A.",
      "ruleCheck": "La 6ª posición distingue entre: 1 (accidental), 2 (autolesión/suicidio), 5 (efecto adverso a dosis terapéutica).",
      "distractorExplanations": {
        "A": "Opción correcta. Intoxicación medicamentosa por dosis excesiva accidental (carácter 1).",
        "B": "Incorrecta: Se confirmó error cognitivo involuntario, no intento de autolisis (carácter 2).",
        "C": "Incorrecta: Efecto adverso (5) solo aplica cuando el fármaco se toma a dosis correctas prescritas.",
        "D": "Incorrecta: Código de salud mental de adicción, no de intoxicación aguda."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "urgencias",
    "level": 5,
    "caseTitle": "Quemadura de segundo grado en antebrazo derecho por escaldadura con agua hirviendo",
    "clinicalScenario": "Varón de 34 años que sufre quemadura térmica por salpicadura de agua hirviendo en cocina. Presenta ampollas rotas y eritema intenso con exudado en cara anterior de antebrazo derecho (3% de superficie corporal). Se desbrida y cura con apósito de plata.",
    "serviceContext": "Urgencias - Cirugía Plástica y Quemados",
    "patientAge": "34 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "T22.211A + X12.XXXA",
        "text": "Quemadura de segundo grado de antebrazo derecho (T22.211A) + Contacto con líquidos calientes (X12.XXXA)"
      },
      {
        "id": "B",
        "code": "T22.111A",
        "text": "Quemadura de primer grado (eritema simple) de antebrazo derecho"
      },
      {
        "id": "C",
        "code": "T22.311A",
        "text": "Quemadura de tercer grado de antebrazo derecho con necrosis"
      },
      {
        "id": "D",
        "code": "T22.212A",
        "text": "Quemadura de segundo grado de antebrazo izquierdo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Lesión térmica con afectación dérmica profunda (ampollas/segundo grado) en extremidad superior derecha con causa externa identificada.",
      "cim10Path": "Capítulo 19 -> T22 (Quemadura hombro y brazo) -> T22.2 (segundo grado) -> T22.211 (antebrazo derecho) + 7º carácter A.",
      "ruleCheck": "En quemaduras, si existen varios grados en la misma zona anatómica se codifica solo el grado más alto. Exige causa externa.",
      "distractorExplanations": {
        "A": "Opción correcta. Grado 2, lateralidad derecha (1), episodio agudo (A) y causa externa X12.",
        "B": "Incorrecta: Grado 1 (eritema simple) subestima las ampollas dérmicas presentes.",
        "C": "Incorrecta: Grado 3 requiere necrosis o pérdida de espesor total de piel.",
        "D": "Incorrecta: Error de lateralidad (2 = antebrazo izquierdo)."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 5,
    "caseTitle": "Epistaxis anterior profusa incoercible que requiere taponamiento nasal anterior",
    "clinicalScenario": "Mujer de 65 años hipertensa acude a Urgencias por hemorragia nasal anterior derecha profusa y continua que no cede tras 40 minutos de compresión digital directa. Se realiza hemostasia mediante taponamiento con esponja de Merocel.",
    "serviceContext": "Urgencias Hospitalarias - Otorrinolaringología",
    "patientAge": "65 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "R04.0 + I10",
        "text": "Epistaxis (R04.0) como diagnóstico principal e Hipertensión esencial (I10)"
      },
      {
        "id": "B",
        "code": "I10 únicamente",
        "text": "Hipertensión esencial como causa única"
      },
      {
        "id": "C",
        "code": "T17.1XXA",
        "text": "Cuerpo extraño en fosa nasal"
      },
      {
        "id": "D",
        "code": "D68.9",
        "text": "Trastorno de coagulación no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Hemorragia nasal aguda severa como motivo exclusivo de la atención urgente, con antecedente de hipertensión descompensada.",
      "cim10Path": "Capítulo 18 -> R04 (Hemorragia de vías respiratorias) -> R04.0 (Epistaxis) + I10.",
      "ruleCheck": "La epistaxis es el motivo directo de atención en urgencias y se codifica como DP aunque coexista HTA.",
      "distractorExplanations": {
        "A": "Opción correcta. R04.0 como motivo de urgencia e I10 como comorbilidad contribuyente.",
        "B": "Incorrecta: Omite el diagnóstico de la hemorragia tratada.",
        "C": "Incorrecta: No existía cuerpo extraño en la fosa nasal.",
        "D": "Incorrecta: La coagulación era normal, no hay coagulopatía demostrada."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "urgencias",
    "level": 1,
    "caseTitle": "Herida incisa superficial en palma de mano derecha sin lesión tendinosa",
    "clinicalScenario": "Varón de 22 años que sufre corte con cuchillo de cocina en palma de mano derecha mientras preparaba la cena. Exploración: herida de 3 cm en eminencia tenar, movilidad y sensibilidad de dedos conservada, sin lesión tendinosa ni vascular. Se sutura con monofilamento.",
    "serviceContext": "Urgencias - Cirugía Menor",
    "patientAge": "22 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "S61.411A",
        "text": "Laceración sin cuerpo extraño de palma de mano derecha, contacto inicial"
      },
      {
        "id": "B",
        "code": "S61.412A",
        "text": "Laceración de palma de mano izquierda"
      },
      {
        "id": "C",
        "code": "S66.211A",
        "text": "Laceración de tendón extensor de mano derecha"
      },
      {
        "id": "D",
        "code": "S60.011A",
        "text": "Contusión de dedo de mano derecha"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Herida abierta cortante traumática no complicada de tejidos blandos de la mano derecha.",
      "cim10Path": "Capítulo 19 -> S61 (Herida abierta de muñeca y mano) -> S61.41 (laceración palma) -> 6º dígito 1 (derecho) -> 7º carácter A.",
      "ruleCheck": "S61.411A combina localización en palma, ausencia de cuerpo extraño y lateralidad derecha.",
      "distractorExplanations": {
        "A": "Opción correcta. Laceración palmar derecha con contacto inicial agudo.",
        "B": "Incorrecta: Error de lateralidad (mano izquierda).",
        "C": "Incorrecta: La exploración descartó formalmente sección tendinosa.",
        "D": "Incorrecta: Contusión implica piel íntegra sin herida abierta."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 3,
    "caseTitle": "Reacción anafiláctica aguda por picadura de avispa",
    "clinicalScenario": "Varón de 37 años traído por el SAMUR tras ser picado por una avispa en el cuello mientras trabajaba en el campo. Presenta urticaria generalizada, edema labial, estridor laríngeo y TAS de 75 mmHg. Se administra adrenalina IM con recuperación inmediata.",
    "serviceContext": "Urgencias - Soporte Vital Avanzado",
    "patientAge": "37 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "T78.2XXA + X23.0XXA",
        "text": "Choque anafiláctico no especificado (T78.2XXA) + Picadura de avispa (X23.0XXA)"
      },
      {
        "id": "B",
        "code": "L50.0",
        "text": "Urticaria alérgica simple"
      },
      {
        "id": "C",
        "code": "J38.4",
        "text": "Edema de laringe aislado"
      },
      {
        "id": "D",
        "code": "T63.441A",
        "text": "Efecto tóxico del veneno de artrópodos únicamente"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Reacción alérgica sistémica grave mediada por IgE con compromiso hemodinámico y respiratorio vital (anafilaxia).",
      "cim10Path": "Capítulo 19 -> T78.2 (Choque anafiláctico) + Capítulo 20 -> X23.0 (Contacto con avispas).",
      "ruleCheck": "La anafilaxia sistémica tiene prioridad de codificación diagnóstica sobre la urticaria y el edema local.",
      "distractorExplanations": {
        "A": "Opción correcta. Anafilaxia sistémica con causa externa de picadura de avispa.",
        "B": "Incorrecta: Subestima el choque anafiláctico y la hipotensión severa.",
        "C": "Incorrecta: El edema de laringe es una manifestación dentro del síndrome anafiláctico.",
        "D": "Incorrecta: El cuadro es inmunoalérgico anafiláctico, no intoxicación por dosis masiva de veneno."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "urgencias",
    "level": 4,
    "caseTitle": "Síndrome confusional agudo secundario a infección del tracto urinario en anciana",
    "clinicalScenario": "Mujer de 86 años institucionalizada en residencia es traída por desorientación témporo-espacial de inicio súbito, alucinaciones visuales y agitación de 24 horas. Sistemático de orina patológico con nitritos y piuria abundantes. Se pauta antibioterapia empírica con remisión del delirium.",
    "serviceContext": "Urgencias Hospitalarias - Geriatría",
    "patientAge": "86 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "N39.0 + R41.0",
        "text": "Infección de tracto urinario (N39.0) como DP + Desorientación / Síndrome confusional agudo (R41.0)"
      },
      {
        "id": "B",
        "code": "F03.90",
        "text": "Demencia senil no especificada"
      },
      {
        "id": "C",
        "code": "R41.0 únicamente",
        "text": "Síndrome confusional agudo sin codificar la etiología infecciosa"
      },
      {
        "id": "D",
        "code": "N30.00",
        "text": "Cistitis aguda sin hematuria aislada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Deterioro cognitivo agudo fluctuante (delirium hiperactivo) secundario a un proceso séptico urinario agudo desencadenante.",
      "cim10Path": "Capítulo 14 -> N39.0 (ITU) + Capítulo 18 -> R41.0 (Desorientación/confusión aguda).",
      "ruleCheck": "Criterio MEAP: La patología desencadenante tratada activamente que motivó el ingreso/urgencia (ITU) es el DP.",
      "distractorExplanations": {
        "A": "Opción correcta. La infección es el diagnóstico principal y la manifestación confusional es secundaria.",
        "B": "Incorrecta: El cuadro fue agudo y reversible, no una demencia crónica degenerativa.",
        "C": "Incorrecta: Prohibido codificar el síntoma neurológico aislado omitiendo la infección tratada.",
        "D": "Incorrecta: N39.0 es el término oficial asignado en analíticas de urgencia."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "urgencias",
    "level": 2,
    "caseTitle": "Crisis convulsiva de primera aparición en estudio",
    "clinicalScenario": "Varón de 30 años sin antecedentes médicos que sufre un episodio presenciado de pérdida súbita de conocimiento con movimientos tónico-clónicos generalizados y mordedura de lengua durante 2 minutos. En Urgencias presenta estado poscrítico y recuperación ad integrum. TAC craneal normal.",
    "serviceContext": "Urgencias Hospitalarias - Neurología",
    "patientAge": "30 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "R56.9",
        "text": "Convulsiones no especificadas (crisis comicial de debut)"
      },
      {
        "id": "B",
        "code": "G40.909",
        "text": "Epilepsia no especificada"
      },
      {
        "id": "C",
        "code": "R55",
        "text": "Síncope y colapso"
      },
      {
        "id": "D",
        "code": "G40.309",
        "text": "Epilepsia idiopática generalizada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Primer episodio convulsivo aislado no recurrente en paciente sin diagnóstico previo de epilepsia.",
      "cim10Path": "Capítulo 18 -> R56 (Convulsiones) -> R56.9 (no especificadas).",
      "ruleCheck": "Regla normativa fundamental: Una crisis convulsiva única o de debut NUNCA se codifica como epilepsia (G40.-).",
      "distractorExplanations": {
        "A": "Opción correcta. Código sintomático R56.9 correspondiente a crisis comicial aislada o primera convulsión.",
        "B": "Incorrecta: La epilepsia requiere crisis recurrentes o síndrome epiléptico diagnosticado.",
        "C": "Incorrecta: Presentó clínica motora tónico-clónica y mordedura lingual incompatible con síncope vasovagal.",
        "D": "Incorrecta: Diagnóstico reservado a epilepsia consolidada."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "urgencias",
    "level": 2,
    "caseTitle": "Hemorragia subconjuntival traumática en ojo derecho",
    "clinicalScenario": "Varón de 23 años acude por hiposfagma (ojo rojo) en ojo derecho tras recibir un balonazo jugando al baloncesto. Examen oftalmológico: agudeza visual conservada, cámara anterior limpia, fondo de ojo normal sin desprendimiento de retina.",
    "serviceContext": "Urgencias - Oftalmología",
    "patientAge": "23 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "H11.31",
        "text": "Hemorragia conjuntival de ojo derecho"
      },
      {
        "id": "B",
        "code": "H11.32",
        "text": "Hemorragia conjuntival de ojo izquierdo"
      },
      {
        "id": "C",
        "code": "S05.11XA",
        "text": "Contusión del globo ocular derecho con hifema"
      },
      {
        "id": "D",
        "code": "H10.9",
        "text": "Conjuntivitis no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Sangrado vascular subconjuntival confinado a la conjuntiva bulbar del ojo derecho.",
      "cim10Path": "Capítulo 7 (Enfermedades del ojo) -> H11 (Otros trastornos de conjuntiva) -> H11.31 (ojo derecho).",
      "ruleCheck": "Lateralidad: 1 = ojo derecho, 2 = ojo izquierdo, 3 = bilateral.",
      "distractorExplanations": {
        "A": "Opción correcta. Código específico de hemorragia conjuntival con lateralidad derecha.",
        "B": "Incorrecta: Error de lateralidad (ojo izquierdo).",
        "C": "Incorrecta: La cámara anterior estaba limpia, sin hifema ocular interno.",
        "D": "Incorrecta: No es una infección ni inflamación conjuntival."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "urgencias",
    "level": 5,
    "caseTitle": "Sospecha diagnóstica urgente de apendicitis aguda confirmada en quirófano",
    "clinicalScenario": "Mujer de 19 años ingresa en Urgencias con dolor agudo en fosa ilíaca derecha, defensa abdominal, signo de Blumberg positivo y leucocitosis con desviación izquierda. El cirujano de guardia indica intervención quirúrgica inmediata confirmando apendicitis flemagosa sin perforación.",
    "serviceContext": "Urgencias - Cirugía General",
    "patientAge": "19 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "K35.80",
        "text": "Apendicitis aguda no especificada (sin perforación ni peritonitis)"
      },
      {
        "id": "B",
        "code": "R10.31",
        "text": "Dolor en fosa ilíaca derecha"
      },
      {
        "id": "C",
        "code": "K35.20",
        "text": "Apendicitis aguda con peritonitis generalizada"
      },
      {
        "id": "D",
        "code": "K37",
        "text": "Apendicitis no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Cuadro de abdomen agudo con confirmación intraoperatoria de apendicitis aguda simple sin rotura.",
      "cim10Path": "Capítulo 11 -> K35 (Apendicitis aguda) -> K35.80 (otra apendicitis aguda y la no especificada).",
      "ruleCheck": "Al confirmarse el diagnóstico quirúrgico en el episodio de urgencias, se codifica la patología confirmada, no el síntoma.",
      "distractorExplanations": {
        "A": "Opción correcta. K35.80 clasifica apendicitis aguda sin rotura ni peritonitis difusa.",
        "B": "Incorrecta: El dolor abdominal se suprime al confirmarse la etiología apendicular.",
        "C": "Incorrecta: El hallazgo intraoperatorio descartó peritonitis o perforación.",
        "D": "Incorrecta: K37 es para casos crónicos o sin especificar estado agudo."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_medica",
    "level": 1,
    "caseTitle": "Hospitalización por Neumonía bacteriana no especificada",
    "clinicalScenario": "Varón de 60 años ingresa en Medicina Interna por fiebre de 39°C, tos con expectoración herrumbrosa y crepitantes basales derechos. Radiografía con condensación alveolar en lóbulo inferior derecho. Se pauta ceftriaxona con resolución clínica sin aislarse germen en hemocultivos.",
    "serviceContext": "Hospitalización - Medicina Interna",
    "patientAge": "60 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "J18.9",
        "text": "Neumonía, microorganismo no especificado"
      },
      {
        "id": "B",
        "code": "J13",
        "text": "Neumonía debida a Streptococcus pneumoniae"
      },
      {
        "id": "C",
        "code": "J15.9",
        "text": "Neumonía bacteriana no especificada"
      },
      {
        "id": "D",
        "code": "R05.9",
        "text": "Tos, no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Infección aguda del parénquima pulmonar que justifica el ingreso hospitalario sin confirmación microbiológica del agente.",
      "cim10Path": "Capítulo 10 -> J18 (Neumonía por microorganismo no especificado) -> J18.9.",
      "ruleCheck": "Cuando no se aisla ni documenta el germen en el informe de alta, se asigna J18.9.",
      "distractorExplanations": {
        "A": "Opción correcta. Neumonía adquirida en la comunidad sin identificación bacteriana específica.",
        "B": "Incorrecta: Requiere aislamiento de neumococo en esputo o hemocultivo.",
        "C": "Incorrecta: J18.9 es el código reglamentario asignado en los manuales de codificación clínica.",
        "D": "Incorrecta: La tos es un síntoma atribuible a la neumonía y no se codifica aparte."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_medica",
    "level": 2,
    "caseTitle": "Infarto agudo de miocardio transmural anteroseptal (IAMCEST)",
    "clinicalScenario": "Varón de 58 años ingresado en Unidad Coronaria por infarto agudo de miocardio con elevación de ST en derivaciones V1-V4 (pared anteroseptal). Se realiza cateterismo urgente con angioplastia primaria y colocación de stent en arteria descendente anterior.",
    "serviceContext": "Cardiología - Unidad Coronaria",
    "patientAge": "58 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "I21.09",
        "text": "Infarto transmural agudo de miocardio de otra parte de la pared anterior"
      },
      {
        "id": "B",
        "code": "I21.19",
        "text": "Infarto transmural agudo de miocardio de pared inferior"
      },
      {
        "id": "C",
        "code": "I21.4",
        "text": "Infarto agudo de miocardio subendocárdico (IAMSEST)"
      },
      {
        "id": "D",
        "code": "I25.2",
        "text": "Infarto de miocardio antiguo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Episodio coronario agudo transmural con afectación topográfica eléctrica y anatómica de pared anterior/anteroseptal.",
      "cim10Path": "Capítulo 9 -> I21 (Infarto agudo de miocardio) -> I21.0 (pared anterior) -> I21.09.",
      "ruleCheck": "I21.09 tipifica infarto transmural de cara anterior y septal dentro de los primeros 28 días desde el debut.",
      "distractorExplanations": {
        "A": "Opción correcta. Infarto agudo transmural anteroseptal.",
        "B": "Incorrecta: Cara inferior (derivaciones II, III y aVF).",
        "C": "Incorrecta: Subendocárdico sin elevación del segmento ST.",
        "D": "Incorrecta: I25.2 es para infartos antiguos cicatrizados pasadas 4 semanas."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_medica",
    "level": 3,
    "caseTitle": "EPOC con agudización e infección respiratoria bacteriana aguda",
    "clinicalScenario": "Varón de 71 años con EPOC grave que ingresa por aumento de su disnea habitual, expectoración purulenta abundante y fiebre. Se aísla Haemophilus influenzae en esputo. Juicio clínico de alta: EPOC agudizada con bronquitis bacteriana aguda.",
    "serviceContext": "Neumología - Hospitalización",
    "patientAge": "71 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "J44.0 + B96.3",
        "text": "Enfermedad pulmonar obstructiva crónica con infección respiratoria aguda del tracto inferior (J44.0) + H. influenzae (B96.3)"
      },
      {
        "id": "B",
        "code": "J44.1",
        "text": "Enfermedad pulmonar obstructiva crónica con exacerbación aguda sin infección"
      },
      {
        "id": "C",
        "code": "J20.9 + J44.9",
        "text": "Bronquitis aguda y EPOC no especificada"
      },
      {
        "id": "D",
        "code": "J44.0 + J44.1",
        "text": "Codificar simultáneamente J44.0 y J44.1"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Descompensación respiratoria de un paciente con EPOC originada por un proceso infeccioso agudo documentado.",
      "cim10Path": "Capítulo 10 -> J44 (EPOC) -> J44.0 (con infección respiratoria baja) + B96.3 (H. influenzae).",
      "ruleCheck": "Regla de Jerarquía: Cuando una exacerbación de EPOC coexiste con infección respiratoria baja, J44.0 tiene prioridad de asignación y absorbe la agudización.",
      "distractorExplanations": {
        "A": "Opción correcta. J44.0 engloba la agudización infecciosa y se añade el microorganismo.",
        "B": "Incorrecta: J44.1 se reserva a exacerbaciones NO infecciosas (ambientales, broncoespasmo).",
        "C": "Incorrecta: La bronquitis aguda en EPOC se clasifica con el código combinado J44.0.",
        "D": "Incorrecta: La regla de exclusión prohíbe codificar J44.0 y J44.1 juntos."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_medica",
    "level": 3,
    "caseTitle": "Ictus isquémico agudo de arteria cerebral media izquierda",
    "clinicalScenario": "Mujer de 74 años ingresa por hemiplejía derecha y afasia global de inicio brusco (puntuación NIHSS 16). La angio-TAC cerebral urgente demuestra oclusión tromboembólica del segmento M1 de la arteria cerebral media izquierda. Se realiza trombectomía mecánica.",
    "serviceContext": "Neurología - Unidad de Ictus",
    "patientAge": "74 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "I63.412",
        "text": "Infarto cerebral debido a embolia de arteria cerebral media izquierda"
      },
      {
        "id": "B",
        "code": "I63.411",
        "text": "Infarto cerebral debido a embolia de arteria cerebral media derecha"
      },
      {
        "id": "C",
        "code": "I61.9",
        "text": "Hemorragia intraencefálica no especificada"
      },
      {
        "id": "D",
        "code": "I69.30",
        "text": "Secuela de infarto cerebral"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Episodio cerebrovascular agudo isquémico de mecanismo embólico con localización anatómica y lateralidad precisas.",
      "cim10Path": "Capítulo 9 -> I63 (Infarto cerebral) -> I63.4 (por embolia) -> I63.41 (ACM) -> 6º dígito 2 (izquierda).",
      "ruleCheck": "Lateralidad en I63: 1 = derecha, 2 = izquierda. Episodio agudo se codifica en I63, no en secuelas (I69).",
      "distractorExplanations": {
        "A": "Opción correcta. Embolia de arteria cerebral media izquierda en fase aguda.",
        "B": "Incorrecta: Error de lateralidad (1 = derecha; la paciente tenía hemiplejía derecha por lesión izquierda).",
        "C": "Incorrecta: Fue un ictus isquémico por oclusión arterial, no hemorrágico.",
        "D": "Incorrecta: I69 se utiliza únicamente para déficits tardíos tras el alta hospitalaria."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_medica",
    "level": 4,
    "caseTitle": "Cirrosis hepática alcohólica descompensada con ascitis moderada",
    "clinicalScenario": "Varón de 54 años bebedor crónico importante ingresa en Digestivo por aumento de perímetro abdominal y edemas maleolares. La ecografía confirma hepatopatía crónica con signos de hipertensión portal y ascitis libre en cavidad peritoneal.",
    "serviceContext": "Hospitalización - Aparato Digestivo",
    "patientAge": "54 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K70.31",
        "text": "Cirrosis hepática alcohólica con ascitis"
      },
      {
        "id": "B",
        "code": "K70.30 + R18.8",
        "text": "Cirrosis alcohólica sin ascitis (K70.30) y Ascitis por separado"
      },
      {
        "id": "C",
        "code": "K74.60",
        "text": "Cirrosis hepática no especificada de causa no alcohólica"
      },
      {
        "id": "D",
        "code": "F10.20 + K70.30",
        "text": "Dependencia de alcohol y Cirrosis sin ascitis"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Hepatopatía crónica avanzada de etiología enólica que presenta descompensación hidrópica en forma de ascitis.",
      "cim10Path": "Capítulo 11 -> K70 (Enfermedad hepática alcohólica) -> K70.3 (cirrosis alcohólica) -> 5º dígito 1 (con ascitis): K70.31.",
      "ruleCheck": "En CIM-10 la subcategoría K70.31 es un código combinado que integra la cirrosis alcohólica y la ascitis, prohibiendo la doble codificación.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado exacto para cirrosis alcohólica descompensada con ascitis.",
        "B": "Incorrecta: Se prohíbe codificar la ascitis por separado cuando existe código combinado (K70.31).",
        "C": "Incorrecta: Ignora la etiología etílica documentada.",
        "D": "Incorrecta: Omite la presencia de ascitis activa."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_medica",
    "level": 4,
    "caseTitle": "Hemorragia digestiva alta por úlcera gástrica aguda sangrante",
    "clinicalScenario": "Mujer de 67 años consumidora de AINEs que ingresa en Medicina Interna por melenas y mareo. La endoscopia digestiva alta urgente revela una úlcera en antro gástrico con sangrado activo en babeo (Forrest Ib) que se trata con inyección de adrenalina y hemoclips.",
    "serviceContext": "Medicina Interna / Digestivo",
    "patientAge": "67 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "K25.0",
        "text": "Úlcera gástrica aguda con hemorragia"
      },
      {
        "id": "B",
        "code": "K25.9 + K92.2",
        "text": "Úlcera gástrica no especificada y Hemorragia gastrointestinal"
      },
      {
        "id": "C",
        "code": "K26.0",
        "text": "Úlcera duodenal aguda con hemorragia"
      },
      {
        "id": "D",
        "code": "K92.1",
        "text": "Melenas aisladas como síntoma"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Lesión ulcerosa de mucosa gástrica complicada con sangrado intraluminal agudo demostrada por gastroscopia.",
      "cim10Path": "Capítulo 11 -> K25 (Úlcera gástrica) -> K25.0 (aguda con hemorragia).",
      "ruleCheck": "K25.0 es código combinado que engloba la úlcera de estómago y la hemorragia, excluyendo la codificación de K92.2.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado de úlcera gástrica aguda sangrante.",
        "B": "Incorrecta: La hemorragia se absorbe en el código K25.0.",
        "C": "Incorrecta: Localización antral gástrica, no duodenal (K26).",
        "D": "Incorrecta: Síntoma absorbido por el diagnóstico etiológico confirmado."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_medica",
    "level": 5,
    "caseTitle": "Insuficiencia cardíaca aguda descompensada en cardiopatía hipertensiva y ERC 4",
    "clinicalScenario": "Varón de 79 años ingresa por edema agudo de pulmón. El informe de alta confirma: Insuficiencia cardíaca congestiva sistólica descompensada debida a cardiopatía y nefropatía hipertensiva con enfermedad renal crónica estadio 4 (FG 22 ml/min).",
    "serviceContext": "Hospitalización Médica - Cardiología / Nefrología",
    "patientAge": "79 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "I13.0 + I50.23 + N18.4",
        "text": "Enfermedad cardiorrenal hipertensiva con IC (I13.0) como DP, IC sistólica aguda sobre crónica (I50.23) y ERC estadio 4 (N18.4)"
      },
      {
        "id": "B",
        "code": "I10 + I50.9 + N18.4",
        "text": "Hipertensión esencial, Insuficiencia cardíaca y ERC por separado"
      },
      {
        "id": "C",
        "code": "I50.23 como DP e I10 como secundaria",
        "text": "Insuficiencia cardíaca como DP aislada"
      },
      {
        "id": "D",
        "code": "I11.0 + I12.9",
        "text": "Cardiopatía hipertensiva y Nefropatía hipertensiva por separado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Afectación simultánea de dianas cardíaca y renal debida a hipertensión arterial de larga evolución (enfermedad cardiorrenal hipertensiva).",
      "cim10Path": "Capítulo 9 -> I13 (Enfermedad cardiorrenal hipertensiva) -> I13.0 (con insuficiencia cardíaca y ERC) + I50.23 + N18.4.",
      "ruleCheck": "Regla de Excluye 1 e instrucción de código combinado: Cuando coexisten cardiopatía hipertensiva y nefropatía hipertensiva, la categoría I13 tiene prioridad absoluta sobre I11 e I12.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado I13.0 complementado con el tipo de IC y el estadio de ERC.",
        "B": "Incorrecta: Prohibido codificar I10 por separado existiendo afectación cardiorrenal.",
        "C": "Incorrecta: La normativa exige el código combinado hipertensivo en primer término.",
        "D": "Incorrecta: La categoría I13 sustituye a la combinación I11 + I12."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_medica",
    "level": 5,
    "caseTitle": "Choque séptico de foco respiratorio por neumonía por Pseudomonas aeruginosa",
    "clinicalScenario": "Mujer de 72 años ingresada en Medicina Intensiva por neumonía nosocomial bilateral con hipotensión refractaria a volumen que requiere noradrenalina y ácido láctico en 4.5 mmol/L. Se aísla Pseudomonas aeruginosa en aspirado traqueal.",
    "serviceContext": "Medicina Intensiva / Infecciosas",
    "patientAge": "72 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "A41.52 + R65.21 + J15.1",
        "text": "Sepsis por Pseudomonas (A41.52) como DP, Choque séptico (R65.21) y Neumonía por Pseudomonas (J15.1)"
      },
      {
        "id": "B",
        "code": "R65.21 como DP + A41.52",
        "text": "Choque séptico como Diagnóstico Principal"
      },
      {
        "id": "C",
        "code": "J15.1 como DP + R57.9",
        "text": "Neumonía como DP y choque no especificado"
      },
      {
        "id": "D",
        "code": "A41.9 únicamente",
        "text": "Sepsis no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Infección pulmonar invasiva grave con disfunción hemodinámica aguda y perfusión tisular deficiente (choque séptico).",
      "cim10Path": "Capítulo 1 -> A41.52 (Sepsis por Pseudomonas) + Capítulo 18 -> R65.21 (Choque séptico) + J15.1 (Neumonía).",
      "ruleCheck": "Secuencia normativa en sepsis grave / choque séptico: 1º Código de sepsis sistémica (A41), 2º Código de disfunción/choque (R65.21), 3º Infección localizada.",
      "distractorExplanations": {
        "A": "Opción correcta. Respeta estrictamente la jerarquía oficial de codificación de choque séptico.",
        "B": "Incorrecta: R65.21 nunca puede ser Diagnóstico Principal según las directrices oficiales.",
        "C": "Incorrecta: Omite la sepsis sistémica e introduce choque no especificado.",
        "D": "Incorrecta: El microorganismo Pseudomonas aeruginosa estaba confirmado."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_medica",
    "level": 4,
    "caseTitle": "Pancreatitis aguda litiásica con colelitiasis confirmada",
    "clinicalScenario": "Varón de 49 años ingresa por dolor epigástrico irradiado en cinturón a espalda y elevación de amilasa y lipasa séricas 4 veces por encima de la normalidad. La ecografía abdominal demuestra microlitiasis vesicular con colédoco no dilatado.",
    "serviceContext": "Hospitalización Médica - Gastroenterología",
    "patientAge": "49 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K85.10 + K80.20",
        "text": "Pancreatitis aguda biliar sin necrosis (K85.10) + Cálculo vesicular sin colecistitis (K80.20)"
      },
      {
        "id": "B",
        "code": "K85.90",
        "text": "Pancreatitis aguda no especificada únicamente"
      },
      {
        "id": "C",
        "code": "K85.00",
        "text": "Pancreatitis aguda idiopática"
      },
      {
        "id": "D",
        "code": "K80.00",
        "text": "Colecistitis aguda litiásica como DP"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Inflamación aguda del páncreas desencadenada por el paso o presencia de cálculos biliares.",
      "cim10Path": "Capítulo 11 -> K85 (Pancreatitis aguda) -> K85.1 (biliar) -> K85.10 (sin necrosis) + K80.20 (cálculo vesicular).",
      "ruleCheck": "La subcategoría K85.10 especifica etiología biliar y contiene nota de codificar adicionalmente la litiasis biliar.",
      "distractorExplanations": {
        "A": "Opción correcta. Pancreatitis de origen biliar (K85.10) con código de litiasis biliar.",
        "B": "Incorrecta: Código no especificado descartado al identificarse el origen litiásico.",
        "C": "Incorrecta: Idiopática solo aplica cuando los estudios ecográficos son negativos.",
        "D": "Incorrecta: El paciente no tenía colecistitis aguda vesicular, sino pancreatitis."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_medica",
    "level": 2,
    "caseTitle": "Trombosis venosa profunda aguda de vena femoral común izquierda",
    "clinicalScenario": "Mujer de 62 años que tras inmovilización por viaje prolongado ingresa por dolor y edema con fóvea en todo el miembro inferior izquierdo. Eco-Doppler urgente: trombosis venosa profunda obstructiva de vena femoral común izquierda.",
    "serviceContext": "Medicina Interna - Unidad de Enfermedad Tromboembólica",
    "patientAge": "62 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "I82.412",
        "text": "Embolia y trombosis aguda de vena femoral izquierda"
      },
      {
        "id": "B",
        "code": "I82.411",
        "text": "Embolia y trombosis aguda de vena femoral derecha"
      },
      {
        "id": "C",
        "code": "I82.512",
        "text": "Trombosis venosa crónica de vena femoral izquierda"
      },
      {
        "id": "D",
        "code": "I80.202",
        "text": "Flebitis y tromboflebitis de vasos profundos de extremidad inferior izquierda"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Oclusión trombótica intraluminal aguda en el eje venoso profundo femoral de la extremidad inferior izquierda.",
      "cim10Path": "Capítulo 9 -> I82 (Otras embolias y trombosis venosas) -> I82.41 (vena femoral) -> 6º dígito 2 (izquierda).",
      "ruleCheck": "Lateralidad en I82: 1 = derecha, 2 = izquierda. Distinción obligatoria entre fase aguda (I82.4) y crónica (I82.5).",
      "distractorExplanations": {
        "A": "Opción correcta. Trombosis venosa profunda aguda de vena femoral izquierda.",
        "B": "Incorrecta: Error de lateralidad (1 = derecha).",
        "C": "Incorrecta: El proceso es agudo de debut, no una trombosis crónica organizada.",
        "D": "Incorrecta: I80 se refiere a flebitis/tromboflebitis inflamatoria superficial o inespecífica."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_medica",
    "level": 4,
    "caseTitle": "Tromboembolismo pulmonar agudo sin cor pulmonale agudo",
    "clinicalScenario": "Varón de 64 años que ingresa en Neumología por dolor pleurítico brusco y hemoptisis leve. Angio-TAC torácico confirma defecto de repleción arterial lobar inferior derecho compatible con tromboembolia pulmonar sin signos de sobrecarga ventricular derecha.",
    "serviceContext": "Hospitalización - Neumología",
    "patientAge": "64 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "I26.99",
        "text": "Otra embolia pulmonar sin cor pulmonale agudo"
      },
      {
        "id": "B",
        "code": "I26.09",
        "text": "Otra embolia pulmonar con cor pulmonale agudo"
      },
      {
        "id": "C",
        "code": "I27.81",
        "text": "Cor pulmonale agudo aislado"
      },
      {
        "id": "D",
        "code": "I26.92",
        "text": "Embolia pulmonar séptica"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Oclusión embólica arterial pulmonar confirmada angiográficamente con función cardíaca derecha conservada.",
      "cim10Path": "Capítulo 9 -> I26 (Embolia pulmonar) -> I26.9 (sin cor pulmonale agudo) -> I26.99.",
      "ruleCheck": "CIM-10 exige diferenciar la presencia (I26.0-) o ausencia (I26.9-) de cor pulmonale agudo.",
      "distractorExplanations": {
        "A": "Opción correcta. Embolia pulmonar aguda sin sobrecarga cardíaca derecha.",
        "B": "Incorrecta: El informe ecocardiográfico descartó cor pulmonale agudo.",
        "C": "Incorrecta: El cor pulmonale es una complicación hemodinámica, no el código del émbolo.",
        "D": "Incorrecta: No es una embolia séptica por endocarditis tricuspídea."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_medica",
    "level": 3,
    "caseTitle": "Artritis reumatoide seropositiva con factor reumatoide positivo sin nódulos ni afectación visceral",
    "clinicalScenario": "Mujer de 51 años ingresada para estudio reumatológico por poliartritis simétrica inflamatoria en manos y muñecas de 6 meses con rigidez matutina de 2 horas. Analítica: Factor reumatoide positivo a título alto (180 UI/ml) y anticuerpos anti-CCP positivos.",
    "serviceContext": "Reumatología - Hospitalización",
    "patientAge": "51 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "M05.79",
        "text": "Artritis reumatoide con factor reumatoide de múltiples localizaciones sin afectación orgánica"
      },
      {
        "id": "B",
        "code": "M06.09",
        "text": "Artritis reumatoide seronegativa"
      },
      {
        "id": "C",
        "code": "M05.10",
        "text": "Artritis reumatoide con afectación pulmonar"
      },
      {
        "id": "D",
        "code": "M15.0",
        "text": "Poliartrosis primaria generalizada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Enfermedad autoinmune articular sistémica confirmada con marcadores serológicos positivos sin afección de otros órganos.",
      "cim10Path": "Capítulo 13 -> M05 (Artritis reumatoide seropositiva) -> M05.7 (sin afectación orgánica) -> M05.79 (múltiples localizaciones).",
      "ruleCheck": "Diferenciación obligatoria entre seropositiva (M05) y seronegativa (M06.0-).",
      "distractorExplanations": {
        "A": "Opción correcta. Artritis reumatoide seropositiva sin complicaciones viscerales.",
        "B": "Incorrecta: El factor reumatoide y anti-CCP resultaron fuertemente positivos.",
        "C": "Incorrecta: No presenta nódulos pulmonares reumatoides ni fibrosis.",
        "D": "Incorrecta: Es una artropatía inflamatoria autoinmune, no degenerativa artrósica."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_medica",
    "level": 4,
    "caseTitle": "Lupus eritematoso sistémico con nefritis lúpica proliferativa difusa (clase IV)",
    "clinicalScenario": "Mujer de 33 años ingresa en Nefrología por proteinuria en rango nefrótico e hipertensión arterial con ANA positivos a 1/1280 y anti-DNA positivo. La biopsia renal demuestra nefritis lúpica proliferativa difusa activa clase IV de la OMS.",
    "serviceContext": "Nefrología - Hospitalización",
    "patientAge": "33 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "M32.14 + N08",
        "text": "Lupus eritematoso sistémico con afectación del órgano glomerular (M32.14) + Trastornos glomerulares en enfermedades clasificadas en otra parte (N08)"
      },
      {
        "id": "B",
        "code": "M32.9",
        "text": "Lupus eritematoso sistémico, no especificado"
      },
      {
        "id": "C",
        "code": "N04.9",
        "text": "Síndrome nefrótico idiopático aislado"
      },
      {
        "id": "D",
        "code": "L93.0",
        "text": "Lupus eritematoso discoide cutáneo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Afección autoinmune del tejido conectivo con manifestación visceral específica demostrada mediante histopatología renal.",
      "cim10Path": "Capítulo 13 -> M32.1 (Lupus con afectación de órganos) -> M32.14 (glomerular) + N08 (código de manifestación).",
      "ruleCheck": "Sistema etiológico/manifestación (cruz y asterisco): Código primario M32.14 seguido del código de afectación glomerular.",
      "distractorExplanations": {
        "A": "Opción correcta. Etiología lúpica glomerular combinada con la manifestación renal obligatoria.",
        "B": "Incorrecta: Inespecífico, ignora la nefritis lúpica biopsiada.",
        "C": "Incorrecta: El síndrome nefrótico es secundario al lupus, no idiopático primario.",
        "D": "Incorrecta: Corresponde a lupus cutáneo benigno sin compromiso sistémico."
      }
    },
    "errorCategory": "manifestacion_etiologia"
  },
  {
    "discipline": "especializada_medica",
    "level": 2,
    "caseTitle": "Enfermedad de Crohn ileocecal con fístula interna enterocutánea",
    "clinicalScenario": "Varón de 29 años ingresa en Aparato Digestivo con brote grave de enfermedad inflamatoria intestinal caracterizado por diarrea sanguinolenta y salida de material fecaloideo a través de un trayecto fistuloso en fosa ilíaca derecha hacia piel.",
    "serviceContext": "Hospitalización - Aparato Digestivo",
    "patientAge": "29 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K50.013",
        "text": "Enfermedad de Crohn de intestino delgado con fístula"
      },
      {
        "id": "B",
        "code": "K50.00",
        "text": "Enfermedad de Crohn de intestino delgado sin complicaciones"
      },
      {
        "id": "C",
        "code": "K51.013",
        "text": "Colitis ulcerosa con fístula"
      },
      {
        "id": "D",
        "code": "K63.2",
        "text": "Fístula del intestino, no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Enfermedad de Crohn localizada en tramo ileal con complicación fistulosa transmural activa.",
      "cim10Path": "Capítulo 11 -> K50 (Enfermedad de Crohn) -> K50.0 (intestino delgado) -> 6º dígito 3 (con fístula): K50.013.",
      "ruleCheck": "CIM-10 integra en un único código combinado la localización y la complicación fistulosa.",
      "distractorExplanations": {
        "A": "Opción correcta. Crohn ileal con fístula interna/externa combinada.",
        "B": "Incorrecta: Presenta fístula activa, no es no complicada.",
        "C": "Incorrecta: La colitis ulcerosa es una entidad distinta que no suele fistulizar.",
        "D": "Incorrecta: La fístula se absorbe en el código de Crohn K50.013."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_medica",
    "level": 5,
    "caseTitle": "Hemorragia digestiva alta por varices esofágicas sangrantes en cirrosis hepática alcohólica",
    "clinicalScenario": "Varón de 57 años con cirrosis etílica conocida que ingresa en UCI por hematemesis masiva y choque hipovolémico. La gastroscopia urgente identifica varices esofágicas grado III con punto de sangrado activo que se trata mediante ligadura con bandas elásticas e infusión de somatostatina.",
    "serviceContext": "UCI Médica / Aparato Digestivo",
    "patientAge": "57 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K70.30 + I85.01",
        "text": "Cirrosis hepática alcohólica sin ascitis (K70.30) como DP + Várices esofágicas con hemorragia (I85.01)"
      },
      {
        "id": "B",
        "code": "I85.01 como DP únicamente",
        "text": "Várices esofágicas con sangrado sin codificar la cirrosis"
      },
      {
        "id": "C",
        "code": "K92.0",
        "text": "Hematemesis aislada como síntoma"
      },
      {
        "id": "D",
        "code": "I85.00",
        "text": "Várices esofágicas sin hemorragia"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Descompensación hemodinámica grave por rotura de varices portales en paciente con hipertensión portal de origen cirrótico.",
      "cim10Path": "Capítulo 11 -> K70.30 (Cirrosis alcohólica) + Capítulo 9 -> I85.01 (Várices esofágicas con hemorragia).",
      "ruleCheck": "Criterio MEAP: Se codifica la cirrosis hepática causal en primer término cuando el ingreso tiene como fin el manejo integral de la descompensación portal, acompañada del código de varices sangrantes I85.01.",
      "distractorExplanations": {
        "A": "Opción correcta. Patología hepática de base + varices esofágicas con hemorragia activa.",
        "B": "Incorrecta: Omite la cirrosis etílica que condiciona la hipertensión portal.",
        "C": "Incorrecta: Síntoma absorbido por la confirmación endoscópica de las varices.",
        "D": "Incorrecta: La paciente presentaba hematemesis activa y sangrado endoscópico comprobado."
      }
    },
    "errorCategory": "manifestacion_etiologia"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 1,
    "caseTitle": "Colecistectomía programada por colelitiasis sintomática sin colecistitis",
    "clinicalScenario": "Mujer de 46 años ingresa para colecistectomía laparoscópica programada por episodios de cólicos biliares de repetición. El informe quirúrgico y anatomopatológico describe vesícula biliar con múltiples cálculos de colesterol sin signos de inflamación aguda ni perforación.",
    "serviceContext": "Cirugía General y del Aparato Digestivo",
    "patientAge": "46 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "K80.20",
        "text": "Cálculo de vesícula biliar sin colecistitis, sin obstrucción"
      },
      {
        "id": "B",
        "code": "K80.00",
        "text": "Cálculo de vesícula biliar con colecistitis aguda"
      },
      {
        "id": "C",
        "code": "K81.0",
        "text": "Colecistitis aguda sin cálculo"
      },
      {
        "id": "D",
        "code": "K80.50",
        "text": "Cálculo de conducto biliar (coledocolitiasis)"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Presencia de litiasis en la vesícula biliar que motiva la resección quirúrgica en frío sin cuadro inflamatorio agudo.",
      "cim10Path": "Capítulo 11 -> K80 (Colelitiasis) -> K80.2 (cálculo sin colecistitis) -> K80.20 (sin obstrucción).",
      "ruleCheck": "K80.20 especifica litiasis vesicular simple sin inflamación.",
      "distractorExplanations": {
        "A": "Opción correcta. Colelitiasis sin colecistitis ni obstrucción coledociana.",
        "B": "Incorrecta: El informe de AP descartó colecistitis aguda.",
        "C": "Incorrecta: La paciente tenía cálculos y no colecistitis.",
        "D": "Incorrecta: No había cálculos en el colédoco."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 2,
    "caseTitle": "Hernia inguinal derecha indirecta atascada con obstrucción intestinal",
    "clinicalScenario": "Varón de 63 años acude a Urgencias por masa irreductible y dolorosa en región inguinal derecha de 6 horas de evolución con vómitos y distensión abdominal. En quirófano se interviene de urgencia de hernia inguinal indirecta derecha incarcerada/obstruida.",
    "serviceContext": "Cirugía General - Quirófano Urgente",
    "patientAge": "63 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K40.30",
        "text": "Hernia inguinal unilateral con obstrucción, sin gangrena, no especificada como recurrente"
      },
      {
        "id": "B",
        "code": "K40.90",
        "text": "Hernia inguinal unilateral sin obstrucción ni gangrena"
      },
      {
        "id": "C",
        "code": "K40.40",
        "text": "Hernia inguinal unilateral con gangrena"
      },
      {
        "id": "D",
        "code": "K40.31",
        "text": "Hernia inguinal unilateral con obstrucción, recurrente"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Herniación de asa intestinal con incarceración/atasco mecánico que causa obstrucción pero sin compromiso isquémico necrótico.",
      "cim10Path": "Capítulo 11 -> K40 (Hernia inguinal) -> K40.3 (unilateral con obstrucción, sin gangrena) -> K40.30.",
      "ruleCheck": "K40.30 tipifica hernia incarcerada con obstrucción en ausencia de gangrena y de carácter primario.",
      "distractorExplanations": {
        "A": "Opción correcta. Hernia unilateral atascada obstructiva no gangrenada.",
        "B": "Incorrecta: Presentaba obstrucción intestinal aguda que obligó a cirugía urgente.",
        "C": "Incorrecta: El asa intestinal estaba viable, sin gangrena.",
        "D": "Incorrecta: Era de primera aparición, no una recidiva o recurrente."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 3,
    "caseTitle": "Parto único espontáneo a término sin complicaciones (Parto eutócico)",
    "clinicalScenario": "Primípara de 28 años a las 39 semanas y 4 días de gestación que ingresa en trabajo de parto activo. Se produce parto cefálico espontáneo vaginal de recién nacido vivo único de 3250 g con Apgar 9/10. Puerperio inmediato normal sin desgarros ni hemorragia.",
    "serviceContext": "Obstetricia y Ginecología - Paritorio",
    "patientAge": "28 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O80 + Z37.0 + Z3A.39",
        "text": "Encuentro para parto único espontáneo (O80) como DP + Nacido vivo único (Z37.0) + 39 semanas (Z3A.39)"
      },
      {
        "id": "B",
        "code": "O82 + Z37.0",
        "text": "Parto por cesárea y nacido vivo único"
      },
      {
        "id": "C",
        "code": "Z37.0 como DP",
        "text": "Resultado del parto como Diagnóstico Principal"
      },
      {
        "id": "D",
        "code": "O80 únicamente",
        "text": "O80 sin códigos de resultado de parto ni semanas"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Parto completamente normal por vía vaginal sin patología obstétrica materna ni fetal.",
      "cim10Path": "Capítulo 15 -> O80 (Parto único espontáneo) + Capítulo 21 -> Z37.0 (Nacido vivo único) + Z3A.39 (39 semanas).",
      "ruleCheck": "Normativa MEAP estricta: O80 SIEMPRE es Diagnóstico Principal; exige obligatoriamente código de resultado de parto (Z37) y semanas de gestación (Z3A).",
      "distractorExplanations": {
        "A": "Opción correcta. Triple codificación reglamentaria obligatoria en parto eutócico sin complicaciones.",
        "B": "Incorrecta: O82 es exclusivo de parto por cesárea.",
        "C": "Incorrecta: Z37.0 es un código secundario obligatorio y nunca puede ser DP.",
        "D": "Incorrecta: La normativa hospitalaria prohíbe omitir el resultado del parto y la edad gestacional."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 3,
    "caseTitle": "Cesárea urgente por desproporción pelvifetal tras fracaso de inducción",
    "clinicalScenario": "Gestante de 32 años a las 40 semanas de gestación ingresa para parto. Tras 14 horas de parto y periodo de dilatación completa, la cabeza fetal no desciende por desproporción fetopélvica debida a estrechez de pelvis materna. Se realiza cesárea de urgencia naciendo varón vivo.",
    "serviceContext": "Paritorio y Bloque Quirúrgico Obstétrico",
    "patientAge": "32 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O33.9 + O82 + Z37.0 + Z3A.40",
        "text": "Desproporción pelvifetal materna (O33.9) como DP, Parto por cesárea (O82), Nacido vivo (Z37.0) y 40 semanas (Z3A.40)"
      },
      {
        "id": "B",
        "code": "O80 + Z37.0",
        "text": "Parto único espontáneo normal"
      },
      {
        "id": "C",
        "code": "O82 como DP único",
        "text": "Parto por cesárea como diagnóstico principal"
      },
      {
        "id": "D",
        "code": "O60.03",
        "text": "Parto pretérmino con parto"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Intervención obstétrica quirúrgica mayor secundaria a una complicación mecánica de la progresión del parto.",
      "cim10Path": "Capítulo 15 -> O33.9 (Desproporción pelvifetal) + O82 (Cesárea) + Z37.0 + Z3A.40.",
      "ruleCheck": "En cesárea por complicación, la indicación médica obstétrica (O33.9) es el Diagnóstico Principal, y el procedimiento de cesárea O82 es secundario.",
      "distractorExplanations": {
        "A": "Opción correcta. La causa obstétrica de la cesárea figura como DP reglamentario.",
        "B": "Incorrecta: No fue un parto espontáneo vaginal eutócico.",
        "C": "Incorrecta: O82 solo es DP cuando la cesárea se realiza electiva sin complicación médica previa documentada.",
        "D": "Incorrecta: El embarazo era a término (40 semanas), no pretérmino."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Infección profunda periprotésica articular tras prótesis de rodilla derecha",
    "clinicalScenario": "Varón de 71 años intervenido hace 2 meses de artroplastia total de rodilla derecha. Reingresa por dolor intenso, fiebre y tumefacción articular. La artrocentesis obtiene líquido purulento con cultivo positivo para Staphylococcus epidermidis.",
    "serviceContext": "Hospitalización Quirúrgica - Traumatología",
    "patientAge": "71 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "T84.511A + B95.7",
        "text": "Infección debida a prótesis de rodilla derecha, contacto inicial (T84.511A) + S. epidermidis (B95.7)"
      },
      {
        "id": "B",
        "code": "T81.4XXA",
        "text": "Infección tras procedimiento no especificada"
      },
      {
        "id": "C",
        "code": "T84.512A",
        "text": "Infección debida a prótesis de rodilla izquierda"
      },
      {
        "id": "D",
        "code": "M00.061",
        "text": "Artritis por estafilococos de rodilla derecha nativa"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación séptica profunda grave ligada a un implante protésico articular interno con identificación del germen.",
      "cim10Path": "Capítulo 19 -> T84.5 (Infección de prótesis articular) -> T84.51 (rodilla) -> 6º dígito 1 (derecha) -> 7º carácter A.",
      "ruleCheck": "Regla de Excluye 1: La infección de herida genérica T81.4 tiene Excluye 1 respecto a prótesis articulares internas (T84.5-). Exige germen B95-B97.",
      "distractorExplanations": {
        "A": "Opción correcta. Código de infección de dispositivo protésico con lateralidad derecha y germen causal.",
        "B": "Incorrecta: Excluye 1 respecto a implantes protésicos articulares.",
        "C": "Incorrecta: Error de lateralidad (rodilla izquierda).",
        "D": "Incorrecta: M00 aplica a articulaciones nativas biológicas sin prótesis."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Dehiscencia fascial posquirúrgica de herida de laparotomía media",
    "clinicalScenario": "Mujer de 59 años intervenida hace 6 días de resección de colon. En sala de hospitalización presenta salida súbita de líquido peritoneal serohemático a través de la herida quirúrgica con separación completa de los planos aponeuróticos (evisceración contenida) que requiere reintervención.",
    "serviceContext": "Hospitalización - Cirugía General",
    "patientAge": "59 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "T81.31XA",
        "text": "Disrupción de herida quirúrgica no clasificada bajo otro concepto (dehiscencia), contacto inicial"
      },
      {
        "id": "B",
        "code": "T81.4XXA",
        "text": "Infección de herida quirúrgica"
      },
      {
        "id": "C",
        "code": "K43.0",
        "text": "Hernia incisional con obstrucción"
      },
      {
        "id": "D",
        "code": "T81.32XA",
        "text": "Disrupción de herida de cesárea"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Fallo mecánico agudo de cicatrización con separación de bordes quirúrgicos durante el posoperatorio inmediato.",
      "cim10Path": "Capítulo 19 -> T81 (Complicaciones de procedimientos) -> T81.31 (dehiscencia de herida externa) -> 7º carácter A: T81.31XA.",
      "ruleCheck": "T81.31XA requiere caracteres de relleno X para alcanzar la 7ª posición A obligatoria.",
      "distractorExplanations": {
        "A": "Opción correcta. Dehiscencia aguda de herida de laparotomía con relleno X y contacto inicial.",
        "B": "Incorrecta: No había infección bacteriana, sino fallo mecánico aponeurótico.",
        "C": "Incorrecta: La eventración crónica es posterior a meses; en agudo es dehiscencia T81.31.",
        "D": "Incorrecta: Específica de heridas de cesárea obstétrica."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 5,
    "caseTitle": "Obstrucción intestinal mecánica por bridas peritoneales posquirúrgicas",
    "clinicalScenario": "Varón de 66 años apendicectomizado hace 10 años ingresa en Cirugía por dolor abdominal cólico, distensión, vómitos fecaloideos y ausencia de emisión de heces y gases. La TAC confirma íleo mecánico con asa cerrada por brida adherencial que precisa adhesiólisis quirúrgica.",
    "serviceContext": "Cirugía General - Urgencias y Hospitalización",
    "patientAge": "66 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K56.5",
        "text": "Adherencias intestinales [bridas] con obstrucción"
      },
      {
        "id": "B",
        "code": "K56.60",
        "text": "Otra obstrucción intestinal no especificada"
      },
      {
        "id": "C",
        "code": "K91.89",
        "text": "Otras complicaciones posoperatorias del aparato digestivo"
      },
      {
        "id": "D",
        "code": "K56.7",
        "text": "Íleo, no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Estenosis u oclusión mecánica intraluminal originada por bandas fibrosas peritoneales secundarias a cirugía previa.",
      "cim10Path": "Capítulo 11 -> K56 (Íleo paralítico y obstrucción intestinal) -> K56.5 (bridas intestinales con obstrucción).",
      "ruleCheck": "K56.5 integra las adherencias peritoneales y el síndrome obstructivo mecánico intestinal.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado para oclusión intestinal debida a bridas o adherencias.",
        "B": "Incorrecta: Ignora la etiología por adherencias confirmada en TAC y quirófano.",
        "C": "Incorrecta: La apendicectomía fue hace 10 años, no es complicación posoperatoria aguda del ingreso.",
        "D": "Incorrecta: El íleo paralítico es adinámico, mientras que aquí hay obstrucción mecánica física."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Fractura subtrocantérea de fémur izquierdo intervenida con clavo intramedular",
    "clinicalScenario": "Mujer de 78 años ingresa tras caída en su domicilio con dolor e impotencia funcional en cadera izquierda. La radiografía confirma fractura subtrocantérea cerrada de fémur izquierdo. Se realiza reducción y osteosíntesis con clavo trocantérico largo.",
    "serviceContext": "Traumatología y Cirugía Ortopédica",
    "patientAge": "78 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "S72.22XA",
        "text": "Fractura subtrocantérea de fémur izquierdo, contacto inicial por fractura cerrada"
      },
      {
        "id": "B",
        "code": "S72.21XA",
        "text": "Fractura subtrocantérea de fémur derecho"
      },
      {
        "id": "C",
        "code": "S72.002A",
        "text": "Fractura de cuello de fémur izquierdo"
      },
      {
        "id": "D",
        "code": "M84.452A",
        "text": "Fractura patológica de fémur izquierdo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Fractura ósea aguda en tercio proximal de fémur distal a la línea trocantérea de la extremidad inferior izquierda.",
      "cim10Path": "Capítulo 19 -> S72.2 (Fractura subtrocantérea) -> 5º dígito 2 (izquierdo) -> 7º carácter A = S72.22XA.",
      "ruleCheck": "Lateralidad: 1 = derecho, 2 = izquierdo. Séptimo carácter A obligatorio para contacto inicial de fractura cerrada.",
      "distractorExplanations": {
        "A": "Opción correcta. Fractura subtrocantérea izquierda en contacto inicial agudo.",
        "B": "Incorrecta: Error de lateralidad (fémur derecho).",
        "C": "Incorrecta: Cuello de fémur es anatómicamente intracapsular, no subtrocantérea.",
        "D": "Incorrecta: Fue secundaria a caída accidental, no sobre hueso tumoral o patológico previo."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 2,
    "caseTitle": "Rotura traumática aguda de menisco medial en rodilla derecha",
    "clinicalScenario": "Varón de 27 años futbolista semiprofesional sufre traumatismo indirecto con giro brusco de rodilla derecha. Presenta bloqueo articular y derrame seroso. La RMN demuestra rotura traumática en asa de cubo de menisco medial derecho.",
    "serviceContext": "Cirugía Ortopédica y Artroscopia",
    "patientAge": "27 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "S83.211A",
        "text": "Desgarro en asa de cubo de menisco medial, rodilla derecha, contacto inicial"
      },
      {
        "id": "B",
        "code": "S83.212A",
        "text": "Desgarro de menisco medial de rodilla izquierda"
      },
      {
        "id": "C",
        "code": "M23.203",
        "text": "Trastorno de menisco debido a desgarro o lesión antigua"
      },
      {
        "id": "D",
        "code": "S83.251A",
        "text": "Desgarro de menisco lateral de rodilla derecha"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Lesión fibrocartilaginosa traumática articular aguda en menisco interno de rodilla derecha.",
      "cim10Path": "Capítulo 19 -> S83 (Traumatismos de rodilla) -> S83.21 (desgarro asa cubo menisco medial) -> 6º dígito 1 (derecha) -> A.",
      "ruleCheck": "Los desgarros agudos se codifican en S83; las roturas degenerativas o antiguas pertenecen al Capítulo 13 (M23).",
      "distractorExplanations": {
        "A": "Opción correcta. Menisco medial, rodilla derecha y episodio agudo inicial A.",
        "B": "Incorrecta: Error de lateralidad (rodilla izquierda).",
        "C": "Incorrecta: M23 corresponde a desgarros crónicos o meniscopatía degenerativa.",
        "D": "Incorrecta: Error anatómico: menisco lateral en lugar de medial."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Rotura prematura de membranas pretérmino a las 33 semanas con parto por cesárea",
    "clinicalScenario": "Gestante de 29 años a las 33 semanas y 2 días que ingresa por pérdida persistente de líquido amniótico por vagina. Se confirma rotura prematura de membranas pretérmino. A las 24 horas inicia dinámica y por presentación podálica se realiza cesárea de feto vivo pretérmino.",
    "serviceContext": "Obstetricia - Alto Riesgo Materno-Fetal",
    "patientAge": "29 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O42.013 + O32.1 + O82 + Z37.0 + Z3A.33",
        "text": "Rotura prematura de membranas pretérmino (O42.013) como DP, Presentación de nalgas (O32.1), Cesárea (O82), Nacido vivo y 33 semanas"
      },
      {
        "id": "B",
        "code": "O80 + Z37.0",
        "text": "Parto único espontáneo normal"
      },
      {
        "id": "C",
        "code": "O82 únicamente",
        "text": "Cesárea como único diagnóstico"
      },
      {
        "id": "D",
        "code": "O60.14X0",
        "text": "Parto pretérmino sin rotura de membranas"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación del saco amniótico antes del inicio del trabajo de parto en gestación pretérmino con feto en podálica.",
      "cim10Path": "Capítulo 15 -> O42 (Rotura prematura de membranas) -> O42.013 (pretérmino antes de 24h a término).",
      "ruleCheck": "La afección patológica que motivó la admisión obstétrica (RPM pretérmino) es el Diagnóstico Principal.",
      "distractorExplanations": {
        "A": "Opción correcta. Recoge la RPM pretérmino como DP y todas las circunstancias obstétricas y semanas de gestación.",
        "B": "Incorrecta: Parto pretérmino instrumental por cesárea, prohibido O80.",
        "C": "Incorrecta: Omite las causas patológicas maternas y semanas de gestación.",
        "D": "Incorrecta: Hubo rotura prematura de membranas confirmada."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 3,
    "caseTitle": "Embarazo ectópico tubárico derecho roto con hemoperitoneo intervenido",
    "clinicalScenario": "Mujer de 25 años con amenorrea de 7 semanas que acude por dolor abdominal agudo en fosa ilíaca derecha y lipotimia. Ecografía transvaginal: útero vacío, masa anexial derecha con latido y abundante líquido libre pélvico. Se realiza salpingectomía derecha urgente por laparoscopia.",
    "serviceContext": "Ginecología - Quirófano de Urgencias",
    "patientAge": "25 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O00.101",
        "text": "Embarazo tubárico derecho sin embarazo intrauterino"
      },
      {
        "id": "B",
        "code": "O00.102",
        "text": "Embarazo tubárico izquierdo"
      },
      {
        "id": "C",
        "code": "O00.90",
        "text": "Embarazo ectópico no especificado"
      },
      {
        "id": "D",
        "code": "K35.80",
        "text": "Apendicitis aguda no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Implantación y desarrollo embrionario fuera de la cavidad endometrial en la trompa de Falopio derecha.",
      "cim10Path": "Capítulo 15 -> O00 (Embarazo ectópico) -> O00.1 (tubárico) -> 6º dígito 1 (derecho): O00.101.",
      "ruleCheck": "O00.101 especifica la localización en trompa uterina derecha.",
      "distractorExplanations": {
        "A": "Opción correcta. Embarazo ectópico tubárico derecho con lateralidad exacta.",
        "B": "Incorrecta: Error de lateralidad (trompa izquierda).",
        "C": "Incorrecta: Inespecífico, cuando la laparoscopia localizó la trompa derecha.",
        "D": "Incorrecta: Diagnóstico diferencial clínico descartado en quirófano."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 5,
    "caseTitle": "Preeclampsia grave a las 35 semanas con indicación de finalización electiva de la gestación",
    "clinicalScenario": "Gestante de 34 años a las 35 semanas y 4 días que ingresa con cifras de tensión arterial de 170/110 mmHg, cefalea persistente, escotomas visuales y proteinuria en tira de 3+. Por sospecha de desprendimiento y riesgo convulsivo se indica cesárea urgente naciendo feto vivo.",
    "serviceContext": "Obstetricia - Cuidados Intensivos Maternos",
    "patientAge": "34 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O14.13 + O82 + Z37.0 + Z3A.35",
        "text": "Preeclampsia grave en tercer trimestre (O14.13) como DP + Cesárea (O82) + Nacido vivo y 35 semanas"
      },
      {
        "id": "B",
        "code": "O13.3",
        "text": "Hipertensión gestacional sin proteinuria en tercer trimestre"
      },
      {
        "id": "C",
        "code": "O15.03",
        "text": "Eclampsia durante el tercer trimestre"
      },
      {
        "id": "D",
        "code": "I10",
        "text": "Hipertensión esencial en paciente no embarazada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Síndrome hipertensivo específico del embarazo con afectación multisistémica grave y criterios de severidad.",
      "cim10Path": "Capítulo 15 -> O14 (Preeclampsia) -> O14.1 (grave) -> 5º dígito 3 (tercer trimestre): O14.13.",
      "ruleCheck": "O14.13 es Diagnóstico Principal. Excluye 1 respecto a HTA esencial (I10) durante la gestación.",
      "distractorExplanations": {
        "A": "Opción correcta. Preeclampsia grave en tercer trimestre con cesárea y semanas reglamentarias.",
        "B": "Incorrecta: Había proteinuria masiva de 3+, por lo que no es hipertensión gestacional simple.",
        "C": "Incorrecta: No presentó convulsiones tonicoclónicas (eclampsia).",
        "D": "Incorrecta: En el embarazo la HTA tiene codificación preferente en el Capítulo 15 (O10-O16)."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Hemorragia posparto inmediata por atonía uterina tras parto vaginal",
    "clinicalScenario": "Mujer de 35 años multípara que tras parto vaginal eutócico presenta sangrado genital masivo superior a 1000 ml con útero blando y por encima del ombligo (atonía uterina). Se realiza masaje uterino, perfusión de oxitocina y taponamiento con balón de Bakri con éxito.",
    "serviceContext": "Paritorio y Sala de Reanimación Obstétrica",
    "patientAge": "35 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O72.1 + Z37.0 + Z3A.39",
        "text": "Otra hemorragia posparto inmediata (O72.1) + Nacido vivo (Z37.0) + Semanas de gestación"
      },
      {
        "id": "B",
        "code": "O80",
        "text": "Parto único espontáneo normal sin complicaciones"
      },
      {
        "id": "C",
        "code": "O72.2",
        "text": "Hemorragia posparto secundaria o tardía"
      },
      {
        "id": "D",
        "code": "N93.9",
        "text": "Hemorragia uterina o vaginal anormal no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación hemorrágica masiva posalumbramiento debida al fallo de contracción de la fibra muscular uterina.",
      "cim10Path": "Capítulo 15 -> O72 (Hemorragia posparto) -> O72.1 (hemorragia posparto inmediata / atonía uterina).",
      "ruleCheck": "La hemorragia por atonía inmediata dentro de las primeras 24h se codifica en O72.1; inhabilita el código O80.",
      "distractorExplanations": {
        "A": "Opción correcta. O72.1 tipifica atonía uterina posparto inmediata.",
        "B": "Incorrecta: O80 queda excluido ante cualquier complicación materna hemorrágica.",
        "C": "Incorrecta: O72.2 es para sangrados tardíos después de las primeras 24 horas del parto.",
        "D": "Incorrecta: Código de ginecología general excluido por el estado de puerperio."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 5,
    "caseTitle": "Síndrome compartimental agudo postraumático en pierna izquierda intervenido de fasciotomía",
    "clinicalScenario": "Varón de 24 años ingresado tras fractura de tibia izquierda que a las 12 horas presenta dolor desproporcionado, tensión pétrea en pantorrilla, palidez y paresia distal. Se mide presión intracompartimental confirmando síndrome compartimental agudo realizándose fasciotomía descompresiva urgente.",
    "serviceContext": "Traumatología - Cirugía Mayor de Urgencia",
    "patientAge": "24 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "T79.A22A + S82.202A",
        "text": "Síndrome compartimental traumático de pierna izquierda (T79.A22A) + Fractura de tibia izquierda (S82.202A)"
      },
      {
        "id": "B",
        "code": "M79.A12",
        "text": "Síndrome compartimental no traumático de pierna izquierda"
      },
      {
        "id": "C",
        "code": "T79.A21A",
        "text": "Síndrome compartimental de pierna derecha"
      },
      {
        "id": "D",
        "code": "S82.202A únicamente",
        "text": "Fractura de tibia sin codificar el síndrome compartimental"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Aumento patológico de la presión tisular en un espacio aponeurótico cerrado que compromete la viabilidad muscular secundario a fractura.",
      "cim10Path": "Capítulo 19 -> T79.A (Síndrome compartimental traumático) -> T79.A22 (pierna izquierda) + 7º carácter A.",
      "ruleCheck": "Diferenciación obligatoria entre síndrome compartimental traumático (T79.A-) y no traumático por sobresfuerzo crónico (M79.A-).",
      "distractorExplanations": {
        "A": "Opción correcta. Síndrome compartimental traumático agudo con lateralidad izquierda y fractura asociada.",
        "B": "Incorrecta: M79.A es para etiología médica/isquémica no traumática.",
        "C": "Incorrecta: Error de lateralidad (pierna derecha).",
        "D": "Incorrecta: Omite la complicación más grave y prioritaria que motivó la fasciotomía urgente."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 1,
    "caseTitle": "Urocultivo con aislamiento de Escherichia coli en ITU ambulatoria",
    "clinicalScenario": "El laboratorio de Microbiología emite informe definitivo de urocultivo remitido por Atención Primaria: Recuento de colonias superior a 100.000 UFC/ml de Escherichia coli sensible a fosfomicina y nitrofurantoína en orina de mujer con disuria.",
    "serviceContext": "Laboratorio Clínico - Microbiología",
    "patientAge": "38 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "N39.0 + B96.20",
        "text": "Infección del tracto urinario (N39.0) + Escherichia coli [E. coli] como causa de enfermedad (B96.20)"
      },
      {
        "id": "B",
        "code": "B96.20 como DP",
        "text": "Escherichia coli como Diagnóstico Principal"
      },
      {
        "id": "C",
        "code": "A04.4",
        "text": "Otras infecciones intestinales por Escherichia coli"
      },
      {
        "id": "D",
        "code": "N39.0 únicamente",
        "text": "Infección urinaria sin identificar el germen"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Infección localizada del aparato excretor con aislamiento e identificación bacteriana precisa.",
      "cim10Path": "Capítulo 14 -> N39.0 (ITU) + Capítulo 1 -> B96.20 (E. coli como agente etiológico).",
      "ruleCheck": "Los códigos de agentes infecciosos del rango B95-B97 NUNCA pueden ser Diagnóstico Principal; son códigos secundarios obligatorios de causa.",
      "distractorExplanations": {
        "A": "Opción correcta. Infección localizada N39.0 seguida del microorganismo causal B96.20.",
        "B": "Incorrecta: B96.20 es un código secundario y no puede figurar como DP.",
        "C": "Incorrecta: A04.4 corresponde a diarrea/gastroenteritis infecciosa por E. coli.",
        "D": "Incorrecta: Omite la información microbiológica positiva suministrada por el laboratorio."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 2,
    "caseTitle": "Biopsia gástrica con Gastritis crónica antral por Helicobacter pylori",
    "clinicalScenario": "Informe de Anatomía Patológica de biopsias endoscópicas de antro gástrico: \"Gastritis crónica moderada activa con presencia abundante de bacilos espirilados en superficie mucosa compatibles con Helicobacter pylori mediante tinción de Giemsa\".",
    "serviceContext": "Anatomía Patológica - Patología Digestiva",
    "patientAge": "52 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K29.50 + B96.81",
        "text": "Gastritis crónica no especificada (K29.50) + Helicobacter pylori como causa de enfermedad (B96.81)"
      },
      {
        "id": "B",
        "code": "B96.81 como DP",
        "text": "Helicobacter pylori como diagnóstico principal"
      },
      {
        "id": "C",
        "code": "K29.70",
        "text": "Gastritis no especificada aislada"
      },
      {
        "id": "D",
        "code": "K25.9",
        "text": "Úlcera gástrica"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Inflamación de mucosa gástrica con evidencia histológica directa del patógeno bacteriano.",
      "cim10Path": "Capítulo 11 -> K29.50 (Gastritis crónica) + Capítulo 1 -> B96.81 (H. pylori).",
      "ruleCheck": "B96.81 es código secundario mandatorio para reflejar el agente causal demostrado por biopsia.",
      "distractorExplanations": {
        "A": "Opción correcta. Proceso inflamatorio orgánico + código suplementario bacteriano de AP.",
        "B": "Incorrecta: B96.81 es código secundario dependiente.",
        "C": "Incorrecta: No codifica la bacteria demostrada histológicamente.",
        "D": "Incorrecta: La biopsia confirmó gastritis crónica, no úlcera péptica."
      }
    },
    "errorCategory": "manifestacion_etiologia"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 3,
    "caseTitle": "Informe histológico: Carcinoma ductal infiltrante de mama izquierda",
    "clinicalScenario": "Servicio de Anatomía Patológica emite informe de biopsia con aguja gruesa de nódulo en cuadrante superior externo de mama izquierda: \"Carcinoma ductal infiltrante pobremente diferenciado (Grado histológico 3 de Nottingham) con invasión vascular presente\".",
    "serviceContext": "Anatomía Patológica - Patología Mamaria",
    "patientAge": "56 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "C50.412",
        "text": "Neoplasia maligna de cuadrante superior externo de mama izquierda femenina"
      },
      {
        "id": "B",
        "code": "C50.411",
        "text": "Neoplasia maligna de cuadrante superior externo de mama derecha femenina"
      },
      {
        "id": "C",
        "code": "D05.12",
        "text": "Carcinoma ductal in situ de mama izquierda"
      },
      {
        "id": "D",
        "code": "D24.2",
        "text": "Neoplasia benigna de mama izquierda"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Tumor maligno primario invasivo epitelial mamario con cuadrante y lateralidad izquierda.",
      "cim10Path": "Capítulo 2 -> C50 (Neoplasia maligna de mama) -> C50.4 (CSE) -> 6º dígito 2 (mama izquierda): C50.412.",
      "ruleCheck": "La histología demuestra invasión estromal (\"infiltrante\"), lo que exige rango C00-C96 (maligno invasor) y descarta D05 (in situ).",
      "distractorExplanations": {
        "A": "Opción correcta. Refleja malignidad infiltrante, localización en CSE y mama izquierda.",
        "B": "Incorrecta: Error de lateralidad (1 = mama derecha).",
        "C": "Incorrecta: El informe patológico afirma \"infiltrante\", descartando \"in situ\" (D05).",
        "D": "Incorrecta: El tejido es maligno agresivo, no benigno."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 3,
    "caseTitle": "Adenocarcinoma tubular infiltrante de colon sigmoide estadio pT3 N1a",
    "clinicalScenario": "Informe de pieza quirúrgica de sigmoidectomía: \"Adenocarcinoma de tipo tubular moderadamente diferenciado que infiltra la subserosa (pT3) con metástasis en 2 de 14 ganglios linfáticos aislados (pN1a). Márgenes libres\".",
    "serviceContext": "Anatomía Patológica - Oncología Quirúrgica",
    "patientAge": "68 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "C18.7",
        "text": "Neoplasia maligna de colon sigmoide"
      },
      {
        "id": "B",
        "code": "C18.2",
        "text": "Neoplasia maligna de colon ascendente"
      },
      {
        "id": "C",
        "code": "D01.0",
        "text": "Carcinoma in situ de colon"
      },
      {
        "id": "D",
        "code": "C78.5",
        "text": "Neoplasia maligna secundaria de colon"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Cáncer primario epitelial maligno con localización segmentaria precisa en el sigma.",
      "cim10Path": "Capítulo 2 -> C18 (Neoplasia maligna de colon) -> C18.7 (colon sigmoide).",
      "ruleCheck": "C18.7 clasifica el tumor primario del sigma. La invasión ganglionar pN1a indica extensión pero no altera el código del tumor primario.",
      "distractorExplanations": {
        "A": "Opción correcta. Código topográfico de neoplasia maligna primaria de colon sigmoide.",
        "B": "Incorrecta: Colon ascendente es C18.2.",
        "C": "Incorrecta: El tumor es pT3 infiltrante, no in situ.",
        "D": "Incorrecta: Es el tumor primario, no una metástasis secundaria en el colon."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 4,
    "caseTitle": "Citología cervicovaginal: Lesión escamosa intraepitelial de alto grado (HSIL / CIN III)",
    "clinicalScenario": "Resultado anatomopatológico de conización cervical: \"Neoplasia intraepitelial cervical grado 3 (CIN III) / Carcinoma epidermoide in situ de cuello uterino con afectación de todo el espesor epitelial pero sin invasión de la membrana basal\".",
    "serviceContext": "Anatomía Patológica - Citopatología Ginecológica",
    "patientAge": "36 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "D06.9",
        "text": "Carcinoma in situ de cuello del útero, parte no especificada (CIN III)"
      },
      {
        "id": "B",
        "code": "C53.9",
        "text": "Neoplasia maligna invasiva de cuello del útero"
      },
      {
        "id": "C",
        "code": "R87.613",
        "text": "Citología de cuello uterino con lesión intraepitelial de alto grado (HSIL)"
      },
      {
        "id": "D",
        "code": "N87.0",
        "text": "Displasia cervical leve (CIN I)"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Proliferación epitelial displásica severa confinada a la totalidad del epitelio sin rebasar la lámina basal.",
      "cim10Path": "Capítulo 2 -> D06 (Carcinoma in situ de cuello del útero) -> D06.9.",
      "ruleCheck": "CIN III y HSIL confirmado histológicamente en pieza de conización se clasifica normativamente como carcinoma in situ (D06), no como frotis celular (R87).",
      "distractorExplanations": {
        "A": "Opción correcta. Carcinoma in situ de cuello uterino (CIN III histológico).",
        "B": "Incorrecta: La membrana basal estaba íntegra, no hay invasión estromal.",
        "C": "Incorrecta: R87 es un código de cribado citológico frotis, superado por la biopsia/cono definitiva.",
        "D": "Incorrecta: CIN I corresponde a displasia leve benigna."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 4,
    "caseTitle": "Urocultivo positivo para Klebsiella pneumoniae productora de betalactamasas de espectro extendido (BLEE)",
    "clinicalScenario": "Informe microbiológico de orina de paciente ingresado en Urología: Recuento > 10^5 UFC/ml de Klebsiella pneumoniae resistente a cefotaxima, ceftriaxona y ampicilina por producción confirmada de betalactamasa de espectro extendido (BLEE).",
    "serviceContext": "Microbiología Clínica - Resistencia Antimicrobiana",
    "patientAge": "65 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "N39.0 + B96.1 + Z16.12",
        "text": "ITU (N39.0) + Klebsiella pneumoniae (B96.1) + Resistencia a betalactámicos de espectro extendido [BLEE] (Z16.12)"
      },
      {
        "id": "B",
        "code": "Z16.12 como DP",
        "text": "Resistencia a betalactámicos como Diagnóstico Principal"
      },
      {
        "id": "C",
        "code": "B96.1 únicamente",
        "text": "Klebsiella pneumoniae aislada sin código de resistencia"
      },
      {
        "id": "D",
        "code": "A41.59",
        "text": "Otras sepsis por Gram negativos"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Infección bacteriana con identificación del patógeno y caracterización del mecanismo de multirresistencia antibiótica.",
      "cim10Path": "Capítulo 14 -> N39.0 + Capítulo 1 -> B96.1 + Capítulo 21 -> Z16.12 (Resistencia a antibióticos betalactámicos de espectro extendido).",
      "ruleCheck": "La categoría Z16 se codifica obligatoriamente como diagnóstico secundario adicional para reflejar la resistencia del microorganismo.",
      "distractorExplanations": {
        "A": "Opción correcta. Infección localizada + germen causal + código Z de resistencia a antibióticos.",
        "B": "Incorrecta: La categoría Z16 nunca puede ser Diagnóstico Principal.",
        "C": "Incorrecta: Omite el código obligatorio de multirresistencia BLEE.",
        "D": "Incorrecta: El paciente no tenía sepsis sistémica en hemocultivos."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 5,
    "caseTitle": "Biopsia prostática con Adenocarcinoma acinar de próstata Gleason 7 (4+3)",
    "clinicalScenario": "Servicio de AP informa cilindros prostáticos con adenocarcinoma acinar de próstata presente en 4 de 6 cilindros de lóbulo derecho y 1 de 6 cilindros de lóbulo izquierdo, con Score de Gleason 7 (patrón 4 + 3) y grupo pronóstico 3 de la ISUP.",
    "serviceContext": "Anatomía Patológica - Uropatología",
    "patientAge": "69 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "C61",
        "text": "Neoplasia maligna de próstata"
      },
      {
        "id": "B",
        "code": "D40.0",
        "text": "Neoplasia de comportamiento incierto de próstata"
      },
      {
        "id": "C",
        "code": "N40.0",
        "text": "Hiperplasia benigna de próstata sin síntomas urinarios"
      },
      {
        "id": "D",
        "code": "D07.5",
        "text": "Carcinoma in situ de próstata"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Neoplasia maligna epitelial primaria del parénquima prostático.",
      "cim10Path": "Capítulo 2 -> C61 (Neoplasia maligna de próstata).",
      "ruleCheck": "En CIM-10 la categoría C61 cubre el adenocarcinoma de próstata primario independientemente del lóbulo.",
      "distractorExplanations": {
        "A": "Opción correcta. C61 es el código único oficial de cáncer de próstata primario.",
        "B": "Incorrecta: El adenocarcinoma es francamente maligno, no incierto.",
        "C": "Incorrecta: Hiperplasia benigna descartada por malignidad.",
        "D": "Incorrecta: En próstata el adenocarcinoma no se codifica como carcinoma in situ."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 5,
    "caseTitle": "Biopsia ganglionar: Linfoma difuso de células B grandes (LDCBG) de ganglios cervicales",
    "clinicalScenario": "Análisis histológico e inmunohistoquímico de adenopatía cervical resecada: Proliferación de células linfoides grandes que expresan fuertemente CD20, CD79a y BCL6 con índice Ki-67 del 85%, compatible con Linfoma no Hodgkin difuso de células B grandes.",
    "serviceContext": "Anatomía Patológica - Hematopatología",
    "patientAge": "61 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "C83.31",
        "text": "Linfoma difuso de células B grandes de ganglios linfáticos de la cabeza, cara y cuello"
      },
      {
        "id": "B",
        "code": "C81.91",
        "text": "Linfoma de Hodgkin de ganglios de cuello"
      },
      {
        "id": "C",
        "code": "C83.30",
        "text": "Linfoma difuso de células B grandes, localización no especificada"
      },
      {
        "id": "D",
        "code": "R59.0",
        "text": "Adenopatía localizada cervical simple"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Proliferación clonal maligna linfoide agresiva no Hodgkin con estirpe B y topografía en ganglios cervicales.",
      "cim10Path": "Capítulo 2 -> C83 (Linfoma no Hodgkin difuso) -> C83.3 (difuso células B grandes) -> 5º dígito 1 (cabeza y cuello): C83.31.",
      "ruleCheck": "El 5º dígito en linfomas (C81-C85) especifica la localización ganglionar (1 = cabeza, cara y cuello).",
      "distractorExplanations": {
        "A": "Opción correcta. LDCBG con localización específica en ganglios linfáticos cervicales (1).",
        "B": "Incorrecta: Es un linfoma no Hodgkin de células B, no Hodgkin (C81).",
        "C": "Incorrecta: Inespecífico respecto a la localización ganglionar documentada.",
        "D": "Incorrecta: La adenopatía era la manifestación clínica superada por la biopsia definitiva."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 2,
    "caseTitle": "Hemocultivos seriados positivos a Staphylococcus aureus sensible a meticilina (SASM)",
    "clinicalScenario": "Varón de 64 años portador de catéter venoso central que presenta picos febriles de 39.5°C con escalofríos. Dos botellas de hemocultivos periféricos positivizan para Staphylococcus aureus sensible a cloxacilina y meticilina (SASM).",
    "serviceContext": "Microbiología y Enfermedades Infecciosas",
    "patientAge": "64 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "A41.01",
        "text": "Sepsis debida a Staphylococcus aureus sensible a la meticilina"
      },
      {
        "id": "B",
        "code": "A41.02",
        "text": "Sepsis debida a Staphylococcus aureus resistente a la meticilina (SARM)"
      },
      {
        "id": "C",
        "code": "A41.9",
        "text": "Sepsis no especificada"
      },
      {
        "id": "D",
        "code": "B95.61",
        "text": "Staphylococcus aureus como causa únicamente"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Bacteriemia / sepsis documentada por estafilococo dorado con perfil de sensibilidad a betalactámicos conservado.",
      "cim10Path": "Capítulo 1 -> A41 (Otras sepsis) -> A41.0 (sepsis por S. aureus) -> A41.01 (sensible a meticilina).",
      "ruleCheck": "CIM-10 exige diferenciar explícitamente entre cepas SASM (A41.01) y SARM (A41.02).",
      "distractorExplanations": {
        "A": "Opción correcta. Sepsis por S. aureus sensible a meticilina.",
        "B": "Incorrecta: El antibiograma confirmó sensibilidad a meticilina, no resistencia.",
        "C": "Incorrecta: Inespecífico cuando se conoce la bacteria causal.",
        "D": "Incorrecta: B95 es un código secundario y no clasifica la bacteriemia sistémica."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 4,
    "caseTitle": "Melanoma nodular invasivo de piel de espalda con índice de Breslow de 2.2 mm",
    "clinicalScenario": "Informe anatomopatológico de exéresis de lesión cutánea pigmentada en región interescapular dorsal: \"Melanoma maligno de tipo nodular con ulceración epitelial presente, nivel de Clark IV y espesor de Breslow de 2.2 mm. Márgenes quirúrgicos libres\".",
    "serviceContext": "Anatomía Patológica - Dermatopatología",
    "patientAge": "58 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "C43.59",
        "text": "Melanoma maligno de otras partes del tronco (espalda)"
      },
      {
        "id": "B",
        "code": "C44.509",
        "text": "Neoplasia maligna de piel de tronco de estirpe no melanoma (carcinoma)"
      },
      {
        "id": "C",
        "code": "D03.59",
        "text": "Melanoma in situ de tronco"
      },
      {
        "id": "D",
        "code": "D22.5",
        "text": "Nevo melanocítico de tronco"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Neoplasia maligna melanocítica invasora cutánea con espesor tumoral vertical de 2.2 mm en tronco.",
      "cim10Path": "Capítulo 2 -> C43 (Melanoma maligno de piel) -> C43.5 (tronco) -> C43.59 (otras partes del tronco/espalda).",
      "ruleCheck": "Melanoma invasivo (Breslow > 0 mm) pertenece a C43. C44 es exclusivo de cáncer cutáneo no melanoma (epidermoide/basocelular).",
      "distractorExplanations": {
        "A": "Opción correcta. Melanoma maligno invasivo de piel del tronco.",
        "B": "Incorrecta: C44 excluye formalmente el melanoma cutáneo (Excluye 1).",
        "C": "Incorrecta: Con Breslow de 2.2 mm es francamente infiltrante en dermis reticular, no in situ.",
        "D": "Incorrecta: Nevo melanocítico es una lesión benigna."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 3,
    "caseTitle": "Biopsia renal percutánea confirmatoria de Nefropatía por IgA (Enfermedad de Berger)",
    "clinicalScenario": "Varón de 26 años con brotes de hematuria macroscópica recurrente coincidente con infecciones faríngeas. Biopsia renal con inmunofluorescencia que demuestra depósitos mesangiales glomerulares difusos intensos de IgA y C3 compatibles con Nefropatía mesangial IgA primaria.",
    "serviceContext": "Anatomía Patológica - Nefropatología",
    "patientAge": "26 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "N02.8",
        "text": "Hematuria recurrente y persistente con otras alteraciones morfológicas (Nefropatía por IgA)"
      },
      {
        "id": "B",
        "code": "N00.9",
        "text": "Síndrome nefrítico agudo con alteración no especificada"
      },
      {
        "id": "C",
        "code": "R31.9",
        "text": "Hematuria no especificada aislada"
      },
      {
        "id": "D",
        "code": "N04.9",
        "text": "Síndrome nefrótico no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Glomerulonefritis mediada por inmunocomplejos con patrón de depósitos mesangiales de inmunoglobulina A.",
      "cim10Path": "Capítulo 14 -> N02 (Hematuria recurrente persistente) -> N02.8 (con otras alteraciones morfológicas / glomerulonefritis por IgA).",
      "ruleCheck": "La nefropatía por IgA primaria se clasifica normativamente en la subcategoría N02.8 en CIM-10.",
      "distractorExplanations": {
        "A": "Opción correcta. Código correspondiente a nefropatía mesangial por IgA.",
        "B": "Incorrecta: No cursó como fracaso renal oligúrico agudo típico de síndrome nefrítico agudo (N00).",
        "C": "Incorrecta: Síntoma superado por el diagnóstico anatomopatológico.",
        "D": "Incorrecta: No presentaba proteinuria masiva nefrótica ni edema."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 5,
    "caseTitle": "PAAF de adenopatía supraclavicular izquierda metastásica de adenocarcinoma de origen desconocido",
    "clinicalScenario": "Mujer de 66 años con adenopatía supraclavicular izquierda indolora de 3 cm. Punción-aspiración con aguja fina (PAAF): metástasis de adenocarcinoma pobremente diferenciado. TAC toracoabdominal sin identificación concluyente del tumor primario.",
    "serviceContext": "Anatomía Patológica / Comité de Tumores",
    "patientAge": "66 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "C77.0 + C80.1",
        "text": "Neoplasia maligna secundaria de ganglios linfáticos de la cabeza, cara y cuello (C77.0) + Neoplasia maligna primaria de sitio no especificado (C80.1)"
      },
      {
        "id": "B",
        "code": "C80.1 únicamente",
        "text": "Cáncer de origen desconocido sin codificar la metástasis"
      },
      {
        "id": "C",
        "code": "C77.0 como Diagnóstico Principal",
        "text": "Metástasis ganglionar como DP único"
      },
      {
        "id": "D",
        "code": "R59.0",
        "text": "Adenopatía cervical simple"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Metástasis ganglionar supraclavicular demostrada citológicamente con tumor primario oculto o no localizado.",
      "cim10Path": "Capítulo 2 -> C77.0 (Ganglios de cabeza y cuello / supraclavicular) + C80.1 (Neoplasia primaria desconocida).",
      "ruleCheck": "Normativa en tumor primario desconocido con metástasis: Si el motivo de atención es la metástasis se codifica C77.0 seguido obligatoriamente de C80.1.",
      "distractorExplanations": {
        "A": "Opción correcta. Código de metástasis ganglionar linfática + código de tumor primario desconocido.",
        "B": "Incorrecta: Omite la afectación y localización específica de la adenopatía metastásica.",
        "C": "Incorrecta: Exige siempre el código de tumor primario C80.1 aunque sea desconocido.",
        "D": "Incorrecta: La punción demostró células cancerosas metastásicas."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 4,
    "caseTitle": "Biopsia hepática confirmatoria de Esteatohepatitis no alcohólica (NASH) con fibrosis portal grado 2",
    "clinicalScenario": "Varón de 48 años con obesidad y dislipemia remitido para biopsia hepática por hipertransaminasemia mantenida. Informe histológico: \"Esteatohepatitis no alcohólica moderada con balonización hepatocitaria, cuerpos de Mallory y fibrosis perisinusoidal y portal (Estadio F2 de Brunt)\".",
    "serviceContext": "Anatomía Patológica - Patología Hepática",
    "patientAge": "48 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K75.81",
        "text": "Esteatohepatitis no alcohólica (NASH)"
      },
      {
        "id": "B",
        "code": "K70.0",
        "text": "Hígado graso alcohólico"
      },
      {
        "id": "C",
        "code": "K76.0",
        "text": "Degeneración grasa del hígado [hígado graso simple]"
      },
      {
        "id": "D",
        "code": "K74.0",
        "text": "Fibrosis hepática aislada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Inflamación y degeneración tisular hepática grasa no debida a consumo de alcohol con balonamiento celular y fibrosis.",
      "cim10Path": "Capítulo 11 -> K75 (Otras enfermedades inflamatorias del hígado) -> K75.81 (esteatohepatitis no alcohólica).",
      "ruleCheck": "K75.81 tipifica esteatohepatitis no alcohólica (NASH), diferenciándola de la esteatosis simple sin inflamación (K76.0).",
      "distractorExplanations": {
        "A": "Opción correcta. Código unívoco para esteatohepatitis no alcohólica (NASH).",
        "B": "Incorrecta: El paciente no consume alcohol (no alcohólica).",
        "C": "Incorrecta: K76.0 es esteatosis simple sin hepatitis/balonamiento ni fibrosis.",
        "D": "Incorrecta: La fibrosis es un componente de la NASH y queda absorbida en el diagnóstico."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 2,
    "caseTitle": "Biopsia tiroidea: Carcinoma papilar de tiroides lóbulo derecho",
    "clinicalScenario": "Mujer de 42 años con nódulo tiroideo solitario de 2 cm en lóbulo derecho. PAAF y biopsia confirman: \"Carcinoma papilar de tiroides con presencia de hendiduras nucleares (grooves) y cuerpos de psamoma. Ausencia de extensión extratiroidea\".",
    "serviceContext": "Anatomía Patológica - Citopatología Endocrina",
    "patientAge": "42 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "C73",
        "text": "Neoplasia maligna de la glándula tiroides"
      },
      {
        "id": "B",
        "code": "D34",
        "text": "Neoplasia benigna de la glándula tiroides (adenoma folicular)"
      },
      {
        "id": "C",
        "code": "E04.1",
        "text": "Bocio nodular eutiroideo (nódulo tiroideo benigno)"
      },
      {
        "id": "D",
        "code": "D44.0",
        "text": "Neoplasia de comportamiento incierto de glándula tiroides"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Tumor maligno derivado del epitelio folicular tiroideo de estirpe papilar.",
      "cim10Path": "Capítulo 2 -> C73 (Neoplasia maligna de glándula tiroides).",
      "ruleCheck": "C73 es la categoría oficial que clasifica el carcinoma de tiroides papilar, folicular o medular.",
      "distractorExplanations": {
        "A": "Opción correcta. Código oficial para cáncer de tiroides.",
        "B": "Incorrecta: Es un carcinoma maligno, no un adenoma benigno.",
        "C": "Incorrecta: El nódulo no es un bocio benigno.",
        "D": "Incorrecta: El carcinoma papilar es francamente maligno, no incierto."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "especializada_quirurgica",
    "level": 4,
    "caseTitle": "Fístula colecistocoledociana con colangitis obstructiva (Síndrome de Mirizzi tipo II)",
    "clinicalScenario": "Varón de 68 años intervenido de urgencia por ictericia obstructiva y fiebre en picos. En laparotomía se descubre un gran cálculo vesicular impactado en el bacinete que ha erosionado el conducto colédoco creando una fístula colecistobiliar (Síndrome de Mirizzi tipo II) que precisa colecistectomía y reconstrucción biliodigestiva en Y de Roux.",
    "serviceContext": "Cirugía Hepatobiliopancreática",
    "patientAge": "68 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K80.32",
        "text": "Cálculo de conducto biliar con colangitis, con obstrucción"
      },
      {
        "id": "B",
        "code": "K80.20",
        "text": "Cálculo de vesícula biliar simple sin colecistitis"
      },
      {
        "id": "C",
        "code": "K82.3",
        "text": "Fístula de la vesícula biliar únicamente"
      },
      {
        "id": "D",
        "code": "C24.0",
        "text": "Neoplasia maligna de las vías biliares extrahepáticas"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación litiásica compleja que compromete la vía biliar principal por fístula biliobiliar con infección colangítica secundaria.",
      "cim10Path": "Capítulo 11 -> K80.3 (Cálculo de conducto biliar con colangitis) -> K80.32 (con obstrucción).",
      "ruleCheck": "K80.32 es el código más específico que clasifica la colangitis obstructiva debida a patología de la vía biliar.",
      "distractorExplanations": {
        "A": "Opción correcta. Coledocolitiasis con colangitis y obstrucción confirmada.",
        "B": "Incorrecta: La afectación traspasa la vesícula comprometiendo el colédoco con colangitis.",
        "C": "Incorrecta: Omite la infección ascendente grave (colangitis).",
        "D": "Incorrecta: Proceso inflamatorio benigno litiásico, no tumoral maligno."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "laboratorio_ap",
    "level": 3,
    "caseTitle": "Carcinoma urotelial infiltrante de alto grado de vejiga urinaria (pared lateral derecha)",
    "clinicalScenario": "Resultado histopatológico de resección transuretral de tumor vesical (RTU-V): \"Carcinoma urotelial papilar de alto grado que infiltra la lámina propia y alcanza la capa muscular propia (estadio pT2a) localizado en pared lateral derecha de la vejiga urinaria\".",
    "serviceContext": "Anatomía Patológica - Uropatología",
    "patientAge": "63 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "C67.2",
        "text": "Neoplasia maligna de la pared lateral de la vejiga urinaria"
      },
      {
        "id": "B",
        "code": "D09.0",
        "text": "Carcinoma in situ de vejiga urinaria"
      },
      {
        "id": "C",
        "code": "D41.4",
        "text": "Neoplasia de comportamiento incierto de vejiga urinaria"
      },
      {
        "id": "D",
        "code": "C67.9",
        "text": "Neoplasia maligna de vejiga, parte no especificada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Neoplasia urotelial maligna primaria con invasión de la capa muscular localizada en pared lateral vesical.",
      "cim10Path": "Capítulo 2 -> C67 (Neoplasia maligna de vejiga urinaria) -> C67.2 (pared lateral).",
      "ruleCheck": "C67.2 clasifica el tumor vesical con topografía en pared lateral. Al infiltrar la muscular (pT2a) descarta carcinoma in situ (D09.0).",
      "distractorExplanations": {
        "A": "Opción correcta. Cáncer primario vesical de pared lateral.",
        "B": "Incorrecta: El tumor infiltra el músculo detrusor, no es un carcinoma plano in situ.",
        "C": "Incorrecta: La histología confirma malignidad clara, no incierta.",
        "D": "Incorrecta: Inespecífico, el informe detalla exactamente la pared lateral derecha."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "salud_mental",
    "level": 1,
    "caseTitle": "Trastorno depresivo mayor, episodio único, no especificado",
    "clinicalScenario": "Varón de 38 años ingresado en Unidad de Salud Mental por episodio depresivo de 2 meses de evolución con tristeza patológica, anhedonia total, astenia, insomnio de mantenimiento y sentimientos de inutilidad sin síntomas psicóticos previos ni manía.",
    "serviceContext": "Salud Mental - Consulta Ambulatoria y Hospital de Día",
    "patientAge": "38 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F32.9",
        "text": "Trastorno depresivo mayor, episodio único, no especificado"
      },
      {
        "id": "B",
        "code": "F33.9",
        "text": "Trastorno depresivo recurrente, no especificado"
      },
      {
        "id": "C",
        "code": "F31.9",
        "text": "Trastorno bipolar, no especificado"
      },
      {
        "id": "D",
        "code": "F43.21",
        "text": "Trastorno de adaptación con estado de ánimo depresivo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Episodio afectivo depresivo mayor de debut (único) sin antecedentes de fases maníacas ni episodios depresivos previos.",
      "cim10Path": "Capítulo 5 -> F32 (Trastorno depresivo mayor, episodio único) -> F32.9.",
      "ruleCheck": "F32 es para episodio único de depresión; F33 requiere al menos dos episodios diferenciados en el tiempo.",
      "distractorExplanations": {
        "A": "Opción correcta. Depresión mayor episodio único.",
        "B": "Incorrecta: Es el primer episodio de su vida, no recurrente.",
        "C": "Incorrecta: No hay historia de hipomanía ni manía.",
        "D": "Incorrecta: Cumple criterios de depresión mayor endógena, no reactivo adaptativo menor."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "salud_mental",
    "level": 2,
    "caseTitle": "Dependencia grave de alcohol no complicada sin consumo activo actual",
    "clinicalScenario": "Varón de 49 años con diagnóstico de síndrome de dependencia del alcohol de 15 años de evolución que acude a la Unidad de Conductas Adictivas en régimen de abstinencia prolongada en tratamiento de mantenimiento con disulfiram.",
    "serviceContext": "Salud Mental - Centro de Atención a las Drogodependencias (CAD)",
    "patientAge": "49 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F10.20",
        "text": "Dependencia de alcohol, no complicada"
      },
      {
        "id": "B",
        "code": "F10.10",
        "text": "Abuso de alcohol, no complicado"
      },
      {
        "id": "C",
        "code": "F10.231",
        "text": "Dependencia de alcohol con delirium tremens de abstinencia"
      },
      {
        "id": "D",
        "code": "F10.929",
        "text": "Consumo de alcohol no especificado con intoxicación"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Trastorno por uso de sustancias consolidado en grado de dependencia física y psicológica sin delirium agudo actual.",
      "cim10Path": "Capítulo 5 -> F10 (Trastornos por consumo de alcohol) -> F10.2 (dependencia) -> F10.20 (no complicada).",
      "ruleCheck": "Regla de Jerarquía en Sustancias: Cuando se documenta abuso y dependencia, prevalece SIEMPRE la dependencia (F10.20).",
      "distractorExplanations": {
        "A": "Opción correcta. Dependencia de alcohol no complicada.",
        "B": "Incorrecta: Suprimido por la regla de jerarquía ante dependencia demostrada.",
        "C": "Incorrecta: No presenta delirium tremens ni cuadro agudo de supresión.",
        "D": "Incorrecta: No está en fase de intoxicación alcohólica aguda."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "salud_mental",
    "level": 3,
    "caseTitle": "Dependencia de alcohol con delirium por abstinencia (Delirium tremens)",
    "clinicalScenario": "Varón de 52 años alcohólico crónico que a las 48 horas de cesar bruscamente la ingesta presenta temblor intenso generalizado, diaforesis profusa, agitación psicomotriz extrema, alucinaciones visuales zoopsias (visión de insectos) y desorientación completa.",
    "serviceContext": "Unidad de Hospitalización Breve de Psiquiatría",
    "patientAge": "52 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F10.231",
        "text": "Dependencia de alcohol con abstinencia con delirium (Delirium tremens)"
      },
      {
        "id": "B",
        "code": "F10.230",
        "text": "Dependencia de alcohol con abstinencia sin complicaciones"
      },
      {
        "id": "C",
        "code": "R41.0",
        "text": "Desorientación / Delirium no especificado aislado"
      },
      {
        "id": "D",
        "code": "F10.121",
        "text": "Abuso de alcohol con intoxicación"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación neuropsiquiátrica mayor potencialmente mortal secundaria al cese del consumo crónico de alcohol.",
      "cim10Path": "Capítulo 5 -> F10 (Trastornos por alcohol) -> F10.2 (dependencia) -> 4º dígito 3 (con abstinencia) -> 5º dígito 1 (con delirium) = F10.231.",
      "ruleCheck": "F10.231 es código combinado que engloba la dependencia, la abstinencia y el delirium tremens.",
      "distractorExplanations": {
        "A": "Opción correcta. Delirium tremens alcohólico por abstinencia.",
        "B": "Incorrecta: Presenta delirium florido y alucinaciones, no es abstinencia simple.",
        "C": "Incorrecta: Excluye 1 respecto a F10.231.",
        "D": "Incorrecta: Se debe a retirada del tóxico, no a intoxicación aguda."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "salud_mental",
    "level": 3,
    "caseTitle": "Trastorno bipolar tipo I con episodio maníaco actual con síntomas psicóticos",
    "clinicalScenario": "Mujer de 35 años ingresa en Psiquiatría de forma involuntaria por fuga de ideas, hiperactividad motora sin dormir durante 5 días, gastos compulsivos de más de 20.000 euros e ideas delirantes megalomaníacas de ser enviada divina para salvar el mundo.",
    "serviceContext": "Psiquiatría - Unidad de Agudos",
    "patientAge": "35 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F31.2",
        "text": "Trastorno bipolar, episodio maníaco grave actual con síntomas psicóticos"
      },
      {
        "id": "B",
        "code": "F31.1",
        "text": "Trastorno bipolar, episodio maníaco grave actual sin síntomas psicóticos"
      },
      {
        "id": "C",
        "code": "F20.0",
        "text": "Esquizofrenia paranoide"
      },
      {
        "id": "D",
        "code": "F30.2",
        "text": "Episodio maníaco único con síntomas psicóticos"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Descompensación maníaca severa con congruencia afectiva y presencia de delirios de grandeza en paciente bipolar.",
      "cim10Path": "Capítulo 5 -> F31 (Trastorno bipolar) -> F31.2 (episodio maníaco actual con síntomas psicóticos).",
      "ruleCheck": "F31.2 tipifica la fase maníaca grave cuando coexisten ideas delirantes o alucinaciones.",
      "distractorExplanations": {
        "A": "Opción correcta. Episodio maníaco con clínica psicótica delirante.",
        "B": "Incorrecta: Presenta ideas delirantes megalomaníacas floridas.",
        "C": "Incorrecta: Es un trastorno del estado de ánimo bipolar, no una esquizofrenia primaria.",
        "D": "Incorrecta: La paciente tiene diagnóstico establecido de trastorno bipolar recurrente (F31)."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "salud_mental",
    "level": 4,
    "caseTitle": "Trastorno depresivo mayor grave recurrente sin síntomas psicóticos",
    "clinicalScenario": "Varón de 44 años con 3 ingresos previos por depresión grave que reingresa por pérdida de 8 kg de peso, inhibición psicomotriz marcada, anhedonia completa y pensamientos persistentes de ruina y muerte sin ideas delirantes ni clínica alucinatoria.",
    "serviceContext": "Hospitalización - Salud Mental",
    "patientAge": "44 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F33.2",
        "text": "Trastorno depresivo recurrente, episodio grave actual sin síntomas psicóticos"
      },
      {
        "id": "B",
        "code": "F32.2",
        "text": "Trastorno depresivo mayor, episodio único grave sin síntomas psicóticos"
      },
      {
        "id": "C",
        "code": "F33.3",
        "text": "Trastorno depresivo recurrente, episodio grave actual con síntomas psicóticos"
      },
      {
        "id": "D",
        "code": "F34.1",
        "text": "Distimia"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Cuadro depresivo endógeno severo recidivante (múltiples episodios en su biografía) en ausencia de psicosis.",
      "cim10Path": "Capítulo 5 -> F33 (Trastorno depresivo recurrente) -> F33.2 (episodio grave actual sin psicosis).",
      "ruleCheck": "F33.2 refleja la recurrencia del trastorno y la gravedad clínica actual del episodio.",
      "distractorExplanations": {
        "A": "Opción correcta. Depresión recurrente grave no psicótica.",
        "B": "Incorrecta: Tiene 3 episodios previos documentados; F32 es solo para episodio único.",
        "C": "Incorrecta: No presenta alucinaciones ni delirios.",
        "D": "Incorrecta: Es un episodio mayor grave, no una distimia crónica leve."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "salud_mental",
    "level": 2,
    "caseTitle": "Trastorno de angustia (pánico) con agorafobia marcada",
    "clinicalScenario": "Mujer de 27 años acude a Salud Mental por crisis de angustia recurrentes con palpitaciones, disnea y miedo a morir, asociadas a evitación fóbica estricta de espacios abiertos, transporte público y aglomeraciones de los que no puede escapar.",
    "serviceContext": "Salud Mental - Consulta Externa",
    "patientAge": "27 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F40.01",
        "text": "Agorafobia con trastorno de pánico"
      },
      {
        "id": "B",
        "code": "F41.0",
        "text": "Trastorno de pánico [ansiedad paroxística episódica] sin agorafobia"
      },
      {
        "id": "C",
        "code": "F40.00",
        "text": "Agorafobia sin trastorno de pánico"
      },
      {
        "id": "D",
        "code": "F41.1",
        "text": "Trastorno de ansiedad generalizada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Asociación clínica de crisis de pánico espontáneas y conducta de evitación agorafóbica en situaciones públicas.",
      "cim10Path": "Capítulo 5 -> F40 (Trastornos de ansiedad fóbica) -> F40.0 (Agorafobia) -> F40.01 (con trastorno de pánico).",
      "ruleCheck": "F40.01 es el código combinado específico cuando la agorafobia coexiste con crisis de pánico recurrentes.",
      "distractorExplanations": {
        "A": "Opción correcta. Agorafobia combinada con crisis de pánico.",
        "B": "Incorrecta: Presenta evitación agorafóbica invalidante de transportes y multitudes.",
        "C": "Incorrecta: Presenta crisis de pánico típicas con clínica vegetativa.",
        "D": "Incorrecta: Ansiedad generalizada es preocupación difusa continua, no crisis paroxísticas."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "salud_mental",
    "level": 4,
    "caseTitle": "Anorexia nerviosa de tipo restrictivo con IMC de 14.5 kg/m2",
    "clinicalScenario": "Adolescente de 16 años ingresada en Unidad de Trastornos de la Conducta Alimentaria por pérdida extrema de peso autoinducida mediante restricción dietética severa y ejercicio físico compulsivo, con amenorrea secundaria e IMC de 14.5 kg/m2 sin conductas de purga ni atracones.",
    "serviceContext": "Unidad de Trastornos de la Conducta Alimentaria (UTCA)",
    "patientAge": "16 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F50.01",
        "text": "Anorexia nerviosa, tipo restrictivo"
      },
      {
        "id": "B",
        "code": "F50.02",
        "text": "Anorexia nerviosa, tipo con atracones/purgas"
      },
      {
        "id": "C",
        "code": "F50.2",
        "text": "Bulimia nerviosa"
      },
      {
        "id": "D",
        "code": "R63.0",
        "text": "Anorexia como síntoma aislado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Trastorno alimentario con distorsión de la imagen corporal y emaciación de mecanismo puramente restrictivo.",
      "cim10Path": "Capítulo 5 -> F50 (Trastornos de la conducta alimentaria) -> F50.0 (Anorexia nerviosa) -> F50.01 (tipo restrictivo).",
      "ruleCheck": "CIM-10 distingue entre subtipo restrictivo (F50.01) y subtipo purgativo/atracones (F50.02).",
      "distractorExplanations": {
        "A": "Opción correcta. Anorexia nerviosa tipo restrictivo.",
        "B": "Incorrecta: No realiza vómitos autoinducidos, uso de laxantes ni atracones.",
        "C": "Incorrecta: En la bulimia el peso suele ser normal o sobrepeso con atracones.",
        "D": "Incorrecta: Síntoma de inapetencia médica (R63.0), no el trastorno psiquiátrico."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "salud_mental",
    "level": 3,
    "caseTitle": "Esquizofrenia paranoide con brote psicótico activo",
    "clinicalScenario": "Varón de 28 años traído por la policía por agitación psicomotriz tras atrincherarse en casa. Manifiesta que los vecinos le controlan el pensamiento a través de microondas y que escucha voces en tercera persona que comentan sus actos. Se diagnostica esquizofrenia paranoide en descompensación aguda.",
    "serviceContext": "Urgencias Psiquiátricas / Hospitalización Breve",
    "patientAge": "28 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F20.0",
        "text": "Esquizofrenia paranoide"
      },
      {
        "id": "B",
        "code": "F20.1",
        "text": "Esquizofrenia hebefrénica / desorganizada"
      },
      {
        "id": "C",
        "code": "F22",
        "text": "Trastorno delirante persistente [paranoia]"
      },
      {
        "id": "D",
        "code": "F23",
        "text": "Trastorno psicótico agudo y transitorio"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Psicosis esquizofrénica con predominio de delirios sistematizados de persecución y alucinaciones auditivas.",
      "cim10Path": "Capítulo 5 -> F20 (Esquizofrenia) -> F20.0 (paranoide).",
      "ruleCheck": "F20.0 clasifica la forma paranoide clásica de la esquizofrenia.",
      "distractorExplanations": {
        "A": "Opción correcta. Esquizofrenia paranoide con alucinaciones y delirio persecutorio.",
        "B": "Incorrecta: La hebefrénica cursa con afecto aplanado o inapropiado y desorganización conductual.",
        "C": "Incorrecta: El trastorno delirante no presenta alucinaciones auditivas floridas.",
        "D": "Incorrecta: Cuadro de evolución superior a un mes en paciente con esquizofrenia."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "salud_mental",
    "level": 4,
    "caseTitle": "Trastorno de estrés postraumático crónico en víctima de agresión grave",
    "clinicalScenario": "Mujer de 31 años que tras sufrir un asalto violento hace 10 meses presenta recuerdos intrusivos repetitivos (flashbacks), pesadillas angustiosas diarias, hipervigilancia extrema, insomnio y conductas de evitación de lugares cerrados.",
    "serviceContext": "Salud Mental - Unidad de Trauma Psicológico",
    "patientAge": "31 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F43.12",
        "text": "Trastorno de estrés postraumático, crónico"
      },
      {
        "id": "B",
        "code": "F43.11",
        "text": "Trastorno de estrés postraumático, agudo"
      },
      {
        "id": "C",
        "code": "F43.0",
        "text": "Reacción al estrés agudo (primeras 72 horas)"
      },
      {
        "id": "D",
        "code": "F41.9",
        "text": "Trastorno de ansiedad no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Patología reactiva a acontecimiento traumático extremo con persistencia sintomática superior a 6 meses.",
      "cim10Path": "Capítulo 5 -> F43 (Reacciones a estrés grave) -> F43.1 (TEPT) -> F43.12 (crónico).",
      "ruleCheck": "F43.12 especifica cronicidad (duración de síntomas de 6 meses o más).",
      "distractorExplanations": {
        "A": "Opción correcta. TEPT crónico con 10 meses de evolución.",
        "B": "Incorrecta: Agudo aplica a duración entre 1 y 6 meses tras el trauma.",
        "C": "Incorrecta: F43.0 se limita a los primeros días posteriores al evento estresante.",
        "D": "Incorrecta: Presenta sintomatología intrusiva y fóbica típica de TEPT."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "salud_mental",
    "level": 2,
    "caseTitle": "Dependencia de cannabis no complicada",
    "clinicalScenario": "Varón de 21 años derivado para tratamiento de deshabituación por consumo diario de 6 a 8 porros de hachís/marihuana con tolerancia marcada, pérdida de control sobre la cantidad, abandono de estudios universitarios y síntomas de irritabilidad ante la falta de consumo.",
    "serviceContext": "Salud Mental - Adicciones",
    "patientAge": "21 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F12.20",
        "text": "Dependencia de cannabis, no complicada"
      },
      {
        "id": "B",
        "code": "F12.10",
        "text": "Abuso de cannabis, no complicado"
      },
      {
        "id": "C",
        "code": "F12.90",
        "text": "Consumo de cannabis no especificado"
      },
      {
        "id": "D",
        "code": "F12.221",
        "text": "Dependencia de cannabis con intoxicación con delirio"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Trastorno por uso de cannabinoides con criterios inequívocos de dependencia física y neuroadaptativa.",
      "cim10Path": "Capítulo 5 -> F12 (Trastornos por cannabis) -> F12.2 (dependencia) -> F12.20.",
      "ruleCheck": "La existencia de tolerancia y síndrome de supresión define dependencia (F12.2) y suprime abuso (F12.1).",
      "distractorExplanations": {
        "A": "Opción correcta. Dependencia de cannabis en régimen no complicado.",
        "B": "Incorrecta: Superado por el diagnóstico de dependencia.",
        "C": "Incorrecta: Existe diagnóstico positivo formal de dependencia.",
        "D": "Incorrecta: No presenta estado psicótico ni delirio agudo."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "salud_mental",
    "level": 4,
    "caseTitle": "Trastorno de personalidad límite (Borderline) con autolesiones no suicidas",
    "clinicalScenario": "Mujer de 22 años ingresada en Psiquiatría tras cortes superficiales repetitivos en antebrazos con impulsividad, marcada inestabilidad afectiva, miedo intenso al abandono y relaciones interpersonales tormentosas caóticas.",
    "serviceContext": "Hospitalización Psiquiátrica / TLP",
    "patientAge": "22 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F60.3",
        "text": "Trastorno de la personalidad emocionalmente inestable (tipo límite / borderline)"
      },
      {
        "id": "B",
        "code": "F60.4",
        "text": "Trastorno de la personalidad histriónica"
      },
      {
        "id": "C",
        "code": "F32.9",
        "text": "Depresión mayor no especificada"
      },
      {
        "id": "D",
        "code": "Z91.5",
        "text": "Historia personal de autolesión"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Patrón persistente e inflexible de inestabilidad afectiva, impulsividad y alteración de la autoimagen.",
      "cim10Path": "Capítulo 5 -> F60 (Trastornos específicos de la personalidad) -> F60.3 (tipo límite).",
      "ruleCheck": "F60.3 engloba el trastorno límite de personalidad; los cortes son un síntoma conductual integral.",
      "distractorExplanations": {
        "A": "Opción correcta. Trastorno límite de personalidad (TLP).",
        "B": "Incorrecta: Histriónica cursa con teatralidad y búsqueda de atención sin la impulsividad autolítica grave del TLP.",
        "C": "Incorrecta: La inestabilidad emocional es de base estructural de personalidad.",
        "D": "Incorrecta: Z91.5 es un código secundario de historia, no la patología activa causal."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "salud_mental",
    "level": 3,
    "caseTitle": "Trastorno obsesivo compulsivo con predominio de ideas y pensamientos obsesivos",
    "clinicalScenario": "Varón de 34 años que consulta por pensamientos intrusivos egodistónicos y angustiosos recurrentes de contaminación con gérmenes que le obligan a realizar rituales de lavado de manos de más de 4 horas diarias.",
    "serviceContext": "Salud Mental - Consulta Especializada",
    "patientAge": "34 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F42.0",
        "text": "Trastorno obsesivo-compulsivo con predominio de pensamientos obsesivos"
      },
      {
        "id": "B",
        "code": "F42.1",
        "text": "Trastorno obsesivo-compulsivo con predominio de rituales de limpieza"
      },
      {
        "id": "C",
        "code": "F42.9",
        "text": "Trastorno obsesivo-compulsivo no especificado"
      },
      {
        "id": "D",
        "code": "F41.1",
        "text": "Trastorno de ansiedad generalizada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Trastorno de ansiedad obsesivo caracterizado por rumiaciones obsesivas e ideas intrusivas primarias.",
      "cim10Path": "Capítulo 5 -> F42 (Trastorno obsesivo-compulsivo) -> F42.0 (pensamientos o rumiaciones obsesivas).",
      "ruleCheck": "F42.0 clasifica TOC con primacía de ideas obsesivas.",
      "distractorExplanations": {
        "A": "Opción correcta. TOC con predominio de ideas obsesivas.",
        "B": "Incorrecta: Aunque lava las manos, el motivo nuclear diagnóstico son las ideas de contaminación intrusivas.",
        "C": "Incorrecta: Código no especificado descartado.",
        "D": "Incorrecta: No es una preocupación generalizada simple."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "salud_mental",
    "level": 5,
    "caseTitle": "Demencia en la enfermedad de Alzheimer de inicio tardío con alteración del comportamiento",
    "clinicalScenario": "Mujer de 79 años con deterioro progresivo de memoria episódica de 4 años de evolución que ingresa en Psicogeriatría por agitación psicomotriz nocturna, agresividad verbal hacia cuidadores e ideación delirante de robo.",
    "serviceContext": "Psicogeriatría / Neurología",
    "patientAge": "79 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "G30.1 + F02.81",
        "text": "Enfermedad de Alzheimer de inicio tardío (G30.1) + Demencia en enfermedad de Alzheimer con alteración del comportamiento (F02.81)"
      },
      {
        "id": "B",
        "code": "G30.1 únicamente",
        "text": "Alzheimer de inicio tardío sin código psiquiátrico"
      },
      {
        "id": "C",
        "code": "F03.90",
        "text": "Demencia no especificada sin alteración del comportamiento"
      },
      {
        "id": "D",
        "code": "F01.51",
        "text": "Demencia vascular con alteración del comportamiento"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Enfermedad neurodegenerativa cortical con síndrome demencial asociado a síntomas conductuales y psicológicos.",
      "cim10Path": "Capítulo 6 -> G30.1 (Alzheimer inicio tardío) + Capítulo 5 -> F02.81 (Demencia con alteración de conducta).",
      "ruleCheck": "Sistema etiopatogénico obligatorio: G30.1 debe codificarse primero, seguido del código de manifestación psiquiátrica F02.81.",
      "distractorExplanations": {
        "A": "Opción correcta. Código neurológico primario + código de demencia con agitación/conducta.",
        "B": "Incorrecta: Omite la manifestación psiquiátrica de alteración de conducta documentada.",
        "C": "Incorrecta: Ignora la etiología de Alzheimer y niega la alteración conductual presente.",
        "D": "Incorrecta: Es de etiología degenerativa Alzheimer, no vascular."
      }
    },
    "errorCategory": "manifestacion_etiologia"
  },
  {
    "discipline": "salud_mental",
    "level": 3,
    "caseTitle": "Intoxicación aguda patológica por cocaína con ideación persecutoria transitoria",
    "clinicalScenario": "Varón de 26 años traído a Urgencias en estado de extrema agitación, midriasis arreactiva, taquicardia de 140 lpm y delirio persecutorio paranoide agudo tras consumo masivo de cocaína por vía nasal en fiesta.",
    "serviceContext": "Urgencias - Toxicología y Psiquiatría",
    "patientAge": "26 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "F14.122",
        "text": "Abuso de cocaína con intoxicación con delirio"
      },
      {
        "id": "B",
        "code": "F14.10",
        "text": "Abuso de cocaína no complicado"
      },
      {
        "id": "C",
        "code": "T40.5X1A",
        "text": "Envenenamiento por cocaína accidental"
      },
      {
        "id": "D",
        "code": "F20.0",
        "text": "Esquizofrenia paranoide"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Estado tóxico agudo secundario a estimulantes con presencia de síntomas neuropsiquiátricos paranoides transitorios.",
      "cim10Path": "Capítulo 5 -> F14 (Trastornos por cocaína) -> F14.1 (abuso) -> 4º dígito 2 (con intoxicación) -> 5º dígito 2 (con delirio): F14.122.",
      "ruleCheck": "F14.122 refleja intoxicación aguda con ideación delirante en consumidor de cocaína.",
      "distractorExplanations": {
        "A": "Opción correcta. Abuso de cocaína con intoxicación complicada con delirio.",
        "B": "Incorrecta: Presentaba delirio paranoide florido y taquicardia severa.",
        "C": "Incorrecta: El consumo recreativo voluntario se clasifica en F14, no en T40 envenenamiento accidental.",
        "D": "Incorrecta: Cuadro tóxico inducido por sustancia, no esquizofrenia primaria."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "salud_mental",
    "level": 4,
    "caseTitle": "Trastorno por déficit de atención con hiperactividad (TDAH) tipo combinado en el adulto",
    "clinicalScenario": "Mujer de 32 años diagnosticada en la Unidad de Neuropsiquiatría de TDAH tras evaluación neuropsicológica con dificultades graves de concentración, desorganización ejecutiva, inquietud motora e impulsividad desde la infancia.",
    "serviceContext": "Salud Mental - Neuropsicología del Adulto",
    "patientAge": "32 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "F90.2",
        "text": "Trastorno por déficit de atención con hiperactividad, tipo combinado"
      },
      {
        "id": "B",
        "code": "F90.0",
        "text": "Trastorno por déficit de atención con hiperactividad, tipo predominantemente con falta de atención"
      },
      {
        "id": "C",
        "code": "F90.1",
        "text": "Trastorno por déficit de atención con hiperactividad, tipo predominantemente hiperactivo/impulsivo"
      },
      {
        "id": "D",
        "code": "F41.9",
        "text": "Trastorno de ansiedad no especificado"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Trastorno del neurodesarrollo persistente en la edad adulta que combina síntomas de inatención e hiperactividad/impulsividad.",
      "cim10Path": "Capítulo 5 -> F90 (Trastornos hipercinéticos) -> F90.2 (tipo combinado).",
      "ruleCheck": "F90.2 especifica la forma mixta/combinada de inatención e hiperactividad.",
      "distractorExplanations": {
        "A": "Opción correcta. TDAH subtipo combinado.",
        "B": "Incorrecta: Solo inatento sin componente motor ni impulsividad.",
        "C": "Incorrecta: Solo hiperactivo sin déficit de atención.",
        "D": "Incorrecta: Es un trastorno del neurodesarrollo formalmente evaluado."
      }
    },
    "errorCategory": "especificidad_lateralidad"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Alta hospitalaria compleja: Colecistectomía laparoscópica por colecistitis aguda y dehiscencia",
    "clinicalScenario": "Mujer de 62 años que ingresa en Urgencias por colecistitis aguda litiásica confirmada por ecografía. Se realiza colecistectomía laparoscópica reglamentaria al día siguiente. En el 4º día posoperatorio presenta fiebre y dolor en herida de puerto umbilical, constatándose dehiscencia superficial de la herida quirúrgica con cultivo positivo a S. aureus sensible a meticilina. Es dada de alta tras antibioticoterapia y curas locales.",
    "serviceContext": "Alta Hospitalaria - Cirugía General y Digestiva",
    "patientAge": "62 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "K80.00 + T81.31XA + B95.61",
        "text": "Cálculo de vesícula con colecistitis aguda sin obstrucción (K80.00) como DP, Dehiscencia de herida (T81.31XA) y S. aureus (B95.61)"
      },
      {
        "id": "B",
        "code": "T81.31XA + K80.00",
        "text": "Dehiscencia de herida quirúrgica como DP y cálculo de vesícula como secundario"
      },
      {
        "id": "C",
        "code": "K81.0 + B95.61",
        "text": "Colecistitis aguda sin cálculo e infección bacteriana"
      },
      {
        "id": "D",
        "code": "K80.20 + T81.4XXA",
        "text": "Cálculo de vesícula no especificado e infección posquirúrgica genérica"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "La paciente fue admitida por colecistitis aguda litiásica (DP). La dehiscencia y sobreinfección ocurrieron como complicación intrahospitalaria secundaria.",
      "cim10Path": "DP: K80.00. Diagnósticos secundarios: T81.31XA + B95.61.",
      "ruleCheck": "Criterio MEAP: El DP es la afección que justificó la admisión hospitalaria. Las complicaciones sobrevenidas durante el ingreso son estrictamente Diagnósticos Secundarios.",
      "distractorExplanations": {
        "A": "Opción correcta. Asigna K80.00 como DP de admisión y recoge la complicación y germen como secundarios.",
        "B": "Incorrecta: La dehiscencia fue una complicación intrahospitalaria, no el motivo de ingreso.",
        "C": "Incorrecta: Omite la litiasis biliar demostrada (K80).",
        "D": "Incorrecta: Inespecífico, no refleja la colecistitis aguda tratada."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Politraumatizado en accidente de tráfico con rotura esplénica intervenida de esplenectomía",
    "clinicalScenario": "Varón de 22 años conductor de automóvil que sufre colisión frontal contra un árbol en carretera. Ingresa en shock hipovolémico por hemoperitoneo masivo. La laparotomía urgente demuestra rotura esplénica grado IV realizándose esplenectomía de urgencia.",
    "serviceContext": "Cirugía de Urgencias y Politraumatizados",
    "patientAge": "22 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "S36.039A + V43.52XA",
        "text": "Laceración mayor de bazo (S36.039A) como DP + Conductor de automóvil lesionado en colisión con objeto fijo (V43.52XA)"
      },
      {
        "id": "B",
        "code": "V43.52XA como DP",
        "text": "Causa externa de accidente de tráfico como Diagnóstico Principal"
      },
      {
        "id": "C",
        "code": "R57.1",
        "text": "Choque hipovolémico aislado"
      },
      {
        "id": "D",
        "code": "D73.89",
        "text": "Otros trastornos del bazo"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Traumatismo abdominal cerrado de alta energía con rotura y hemorragia de víscera maciza que compromete la vida.",
      "cim10Path": "Capítulo 19 -> S36.0 (Traumatismo del bazo) -> S36.039A + Capítulo 20 -> V43.52XA (accidente tráfico).",
      "ruleCheck": "Los códigos de causa externa (V00-Y99) NUNCA pueden ser Diagnóstico Principal; deben acompañar a la lesión traumática.",
      "distractorExplanations": {
        "A": "Opción correcta. Lesión esplénica traumática en 7º carácter A con causa externa de tráfico.",
        "B": "Incorrecta: Los códigos de causa externa nunca pueden figurar como DP.",
        "C": "Incorrecta: El choque hipovolémico es una manifestación hemodinámica secundaria a la rotura esplénica.",
        "D": "Incorrecta: Código de hematología no traumática."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Carcinoma epidermoide de pulmón en lóbulo superior derecho con metástasis cerebrales y óseas",
    "clinicalScenario": "Varón de 67 años fumador que ingresa por cefalea y déficit motor. TAC y biopsia confirman carcinoma epidermoide de lóbulo superior de pulmón derecho (cáncer primario) con metástasis múltiples en hemisferio cerebral derecho y metástasis líticas en columna lumbar.",
    "serviceContext": "Oncología Médica - Hospitalización",
    "patientAge": "67 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "C34.11 + C79.31 + C79.51",
        "text": "Cáncer primario de lóbulo superior de pulmón derecho (C34.11) como DP, Metástasis cerebral (C79.31) y Metástasis ósea (C79.51)"
      },
      {
        "id": "B",
        "code": "C79.31 como DP + C34.11",
        "text": "Metástasis cerebral como DP y tumor primario pulmonar como secundario"
      },
      {
        "id": "C",
        "code": "C34.90",
        "text": "Cáncer de pulmón no especificado sin codificar metástasis"
      },
      {
        "id": "D",
        "code": "C80.0",
        "text": "Neoplasia maligna diseminada sin especificar"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Neoplasia maligna primaria broncopulmonar en estadio IV avanzado con diseminación hemática multiorgánica.",
      "cim10Path": "Capítulo 2 -> C34.11 (Lóbulo superior derecho) + C79.31 (Metástasis cerebral) + C79.51 (Metástasis ósea).",
      "ruleCheck": "Secuencia neoplásica: Si el paciente ingresa para evaluación y tratamiento oncológico general del cáncer primario, este (C34.11) es el DP.",
      "distractorExplanations": {
        "A": "Opción correcta. Tumor primario con lateralidad derecha y metástasis secundarias codificadas.",
        "B": "Incorrecta: Solo se prioriza la metástasis como DP si el ingreso fue exclusivamente para radiocirugía cerebral aislada.",
        "C": "Incorrecta: Omite las metástasis y la localización lobar superior derecha.",
        "D": "Incorrecta: C80 se prohíbe cuando el tumor primario de pulmón está confirmado."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "simulacro_integral",
    "level": 4,
    "caseTitle": "Coma hiperosmolar hiperglucémico no cetósico en paciente con diabetes mellitus tipo 2",
    "clinicalScenario": "Mujer de 75 años ingresa en UCI estuporosa con glucemia de 890 mg/dl, osmolaridad sérica de 345 mOsm/kg, pH 7.36 sin cuerpos cetónicos en orina ni acidosis metabólica, confirmándose síndrome hiperosmolar en diabetes tipo 2.",
    "serviceContext": "Medicina Intensiva / Endocrinología",
    "patientAge": "75 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "E11.00",
        "text": "Diabetes mellitus tipo 2 con hiperosmolaridad sin coma"
      },
      {
        "id": "B",
        "code": "E11.01",
        "text": "Diabetes mellitus tipo 2 con hiperosmolaridad con coma"
      },
      {
        "id": "C",
        "code": "E11.10",
        "text": "Diabetes mellitus tipo 2 con cetoacidosis"
      },
      {
        "id": "D",
        "code": "E10.01",
        "text": "Diabetes tipo 1 con hiperosmolaridad y coma"
      }
    ],
    "correctOptionId": "B",
    "reasonedResolution": {
      "clinicalAnalysis": "Descompensación hiperglucémica extrema aguda de la diabetes tipo 2 con alteración severa de la consciencia (estupor profundo/coma).",
      "cim10Path": "Capítulo 4 -> E11 (Diabetes tipo 2) -> E11.0 (con hiperosmolaridad) -> E11.01 (con coma).",
      "ruleCheck": "E11.01 tipifica el estado hiperosmolar hiperglucémico en DM2 complicado con disminución grave del nivel de consciencia.",
      "distractorExplanations": {
        "A": "Incorrecta: La paciente presentaba estupor profundo (clínicamente equivalente a coma hiperosmolar).",
        "B": "Opción correcta. Código combinado exacto para diabetes tipo 2 hiperosmolar con coma.",
        "C": "Incorrecta: Los cuerpos cetónicos fueron negativos y no había acidosis metabólica (no es cetoacidosis E11.1).",
        "D": "Incorrecta: La paciente es diabética tipo 2 (E11), no tipo 1 (E10)."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "simulacro_integral",
    "level": 3,
    "caseTitle": "Hematoma posquirúrgico de pared abdominal tras herniorrafia umbilical programada",
    "clinicalScenario": "Varón de 50 años intervenido de herniorrafia umbilical ambulatoria hace 4 días que acude por masa violácea fluctuante a nivel de la cicatriz. Se confirma hematoma de herida quirúrgica realizándose drenaje y evacuación en quirófano.",
    "serviceContext": "Cirugía Mayor Ambulatoria (CMA)",
    "patientAge": "50 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "T81.0XXA",
        "text": "Hemorragia y hematoma de un procedimiento que complica un procedimiento, contacto inicial"
      },
      {
        "id": "B",
        "code": "K42.9",
        "text": "Hernia umbilical simple sin obstrucción"
      },
      {
        "id": "C",
        "code": "T81.4XXA",
        "text": "Infección de herida quirúrgica"
      },
      {
        "id": "D",
        "code": "L76.21",
        "text": "Hemorragia de piel posprocedimiento"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Complicación hemática localizada en el lecho quirúrgico como consecuencia directa del procedimiento.",
      "cim10Path": "Capítulo 19 -> T81.0 (Hemorragia y hematoma posoperatorio) -> relleno con XX -> 7º carácter A: T81.0XXA.",
      "ruleCheck": "T81.0XXA es el código específico para hematomas o hemorragias posprocedimiento con 7º carácter A.",
      "distractorExplanations": {
        "A": "Opción correcta. Hematoma posquirúrgico agudo con relleno y contacto inicial reglamentario.",
        "B": "Incorrecta: La hernia ya fue reparada en la intervención previa.",
        "C": "Incorrecta: El contenido era sangre/hematoma estéril, no pus ni infección bacteriana.",
        "D": "Incorrecta: T81.0 es el código hospitalario de elección para heridas quirúrgicas profundas/abdominales."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "simulacro_integral",
    "level": 4,
    "caseTitle": "Fractura osteoporótica de cuello de fémur izquierdo por caída casual al mismo nivel",
    "clinicalScenario": "Mujer de 82 años con osteoporosis senil conocida que sufre caída accidental en el pasillo de su casa. En Urgencias se diagnostica fractura cerrada de cuello de fémur izquierdo debida a fragilidad ósea osteoporótica.",
    "serviceContext": "Urgencias y Traumatología Geriátrica",
    "patientAge": "82 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "M80.052A + W19.XXXA",
        "text": "Fractura osteoporótica por fragilidad de cadera izquierda (M80.052A) + Caída no especificada (W19.XXXA)"
      },
      {
        "id": "B",
        "code": "S72.002A",
        "text": "Fractura traumática común de cuello de fémur izquierdo"
      },
      {
        "id": "C",
        "code": "M81.0",
        "text": "Osteoporosis sin fractura patológica actual"
      },
      {
        "id": "D",
        "code": "M80.051A",
        "text": "Fractura osteoporótica de cadera derecha"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Rotura ósea patológica sobre hueso desmineralizado por osteoporosis senil desencadenada por traumatismo de baja energía.",
      "cim10Path": "Capítulo 13 -> M80 (Osteoporosis con fractura patológica actual) -> M80.052A (cadera izquierda) + W19.XXXA.",
      "ruleCheck": "Regla de Excluye 1: Cuando una fractura de cadera se debe a osteoporosis, la categoría M80 tiene prioridad de asignación y excluye S72 (fractura puramente traumática).",
      "distractorExplanations": {
        "A": "Opción correcta. Fractura por fragilidad osteoporótica con lateralidad izquierda y causa externa de caída.",
        "B": "Incorrecta: Excluye 1 respecto a fracturas osteoporóticas en M80.",
        "C": "Incorrecta: La paciente presenta fractura aguda por lo que no es M81 (sin fractura).",
        "D": "Incorrecta: Error de lateralidad (cadera derecha)."
      }
    },
    "errorCategory": "normativa_excluye"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Enfermedad por VIH en estadio C3 con neumonía por Pneumocystis jirovecii y sarcoma de Kaposi",
    "clinicalScenario": "Varón de 39 años VIH positivo no controlado que ingresa por insuficiencia respiratoria severa y lesiones cutáneas violáceas. El lavado broncoalveolar identifica Pneumocystis jirovecii y la biopsia cutánea confirma Sarcoma de Kaposi en tronco.",
    "serviceContext": "Infecciosas / VIH",
    "patientAge": "39 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "B20 + B59 + C46.0",
        "text": "Enfermedad por VIH resultante en enfermedades infecciosas y parasitarias (B20) como DP, Neumonía por Pneumocystis (B59) y Sarcoma de Kaposi (C46.0)"
      },
      {
        "id": "B",
        "code": "B59 como DP + B20",
        "text": "Neumonía por Pneumocystis como DP y VIH como secundario"
      },
      {
        "id": "C",
        "code": "C46.0 como DP + B20",
        "text": "Sarcoma de Kaposi como DP y VIH como secundario"
      },
      {
        "id": "D",
        "code": "Z21",
        "text": "Estado asintomático de infección por VIH"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Inmunodeficiencia adquirida avanzada que condiciona infecciones oportunistas y neoplasias definitorias de SIDA.",
      "cim10Path": "Capítulo 1 -> B20 (Enfermedad por VIH) como DP + B59 (Pneumocistosis) + Capítulo 2 -> C46.0 (Sarcoma de Kaposi).",
      "ruleCheck": "Regla de Oro en VIH (CIM-10): Cuando un paciente ingresa con una o varias enfermedades definitorias de SIDA, el código B20 SIEMPRE se selecciona como Diagnóstico Principal.",
      "distractorExplanations": {
        "A": "Opción correcta. B20 como Diagnóstico Principal de admisión seguido de las afecciones asociadas.",
        "B": "Incorrecta: Viola la regla normativa que obliga a B20 como primer diagnóstico.",
        "C": "Incorrecta: El tumor es consecuencia del VIH y debe figurar como secundario a B20.",
        "D": "Incorrecta: Z21 se reserva a seropositivos asintomáticos sin antecedentes de SIDA."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Cesárea electiva repetida a término por antecedente de cesárea anterior",
    "clinicalScenario": "Gestante de 36 años a las 39 semanas de gestación con antecedente obstétrico de dos cesáreas previas por distocia. Ingresa para cesárea programada electiva que transcurre sin incidencias, naciendo niña viva.",
    "serviceContext": "Obstetricia - Hospitalización Quirúrgica",
    "patientAge": "36 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "O34.211 + O82 + Z37.0 + Z3A.39",
        "text": "Atención materna por cicatriz de cesárea anterior de segmento bajo (O34.211) como DP, Parto por cesárea (O82), Nacida viva (Z37.0) y 39 semanas"
      },
      {
        "id": "B",
        "code": "O82 como DP único",
        "text": "Parto por cesárea como Diagnóstico Principal aislado"
      },
      {
        "id": "C",
        "code": "O80 + Z37.0",
        "text": "Parto espontáneo vaginal normal"
      },
      {
        "id": "D",
        "code": "Z87.51",
        "text": "Historia personal de cesárea anterior sin código O"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Indicación de cesárea iterativa por riesgo de rotura uterina sobre útero con cicatriz previa en gestación a término.",
      "cim10Path": "Capítulo 15 -> O34.211 (Cicatriz uterina por cesárea) + O82 (Cesárea) + Z37.0 + Z3A.39.",
      "ruleCheck": "La causa médica de la cesárea programada (O34.211) es el Diagnóstico Principal que justificó el ingreso.",
      "distractorExplanations": {
        "A": "Opción correcta. Causa obstétrica O34.211 como DP + código de procedimiento O82 y semanas.",
        "B": "Incorrecta: O82 solo es DP si no existe ninguna indicación materna documentada.",
        "C": "Incorrecta: La paciente no tuvo parto vaginal.",
        "D": "Incorrecta: Durante el embarazo la cicatriz uterina se codifica en el Capítulo 15 (O34.2), no en Z."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  },
  {
    "discipline": "simulacro_integral",
    "level": 4,
    "caseTitle": "Hemorragia digestiva baja masiva por diverticulosis de colon complicada con diverticulitis",
    "clinicalScenario": "Varón de 73 años ingresa por rectorragia abundante y dolor en fosa ilíaca izquierda con febrícula. La colonoscopia y TAC confirman diverticulitis aguda de sigma con sangrado activo en boca diverticular que cede tras colocación de hemoclips.",
    "serviceContext": "Gastroenterología y Endoscopia Terapéutica",
    "patientAge": "73 años",
    "patientGender": "Varón",
    "options": [
      {
        "id": "A",
        "code": "K57.33",
        "text": "Diverticulitis de intestino grueso con hemorragia sin perforación ni absceso"
      },
      {
        "id": "B",
        "code": "K57.31 + K92.2",
        "text": "Diverticulitis de colon y Hemorragia gastrointestinal por separado"
      },
      {
        "id": "C",
        "code": "K57.32",
        "text": "Diverticulosis de intestino grueso con hemorragia (sin diverticulitis)"
      },
      {
        "id": "D",
        "code": "K62.5",
        "text": "Hemorragia de ano y de recto aislada"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Patología diverticular colónica que combina simultáneamente inflamación aguda (diverticulitis) y sangrado activo intraluminal.",
      "cim10Path": "Capítulo 11 -> K57 (Enfermedad diverticular del intestino) -> K57.3 (intestino grueso sin perforación) -> K57.33 (con sangrado y diverticulitis).",
      "ruleCheck": "K57.33 es un código combinado completo que integra diverticulitis y sangrado, descartando códigos separados de hemorragia.",
      "distractorExplanations": {
        "A": "Opción correcta. Código combinado para diverticulitis con hemorragia.",
        "B": "Incorrecta: El sangrado se absorbe en el 5º carácter del código K57.33.",
        "C": "Incorrecta: Había inflamación aguda activa (diverticulitis), no solo diverticulosis simple.",
        "D": "Incorrecta: El sangrado es de origen colónico diverticular, no anal hemorroidal."
      }
    },
    "errorCategory": "codigos_combinados"
  },
  {
    "discipline": "simulacro_integral",
    "level": 5,
    "caseTitle": "Choque séptico de origen abdominal por peritonitis debida a perforación apendicular",
    "clinicalScenario": "Mujer de 47 años ingresa en UCI intubada tras laparotomía urgente por abdomen en tabla de 48 horas de evolución. Hallazgo quirúrgico: peritonitis purulenta difusa en 4 cuadrantes por rotura apendicular gangrenosa. En UCI requiere noradrenalina a dosis altas y soporte ventilatorio.",
    "serviceContext": "Medicina Intensiva / Cirugía General",
    "patientAge": "47 años",
    "patientGender": "Mujer",
    "options": [
      {
        "id": "A",
        "code": "K35.2 + A41.9 + R65.21",
        "text": "Apendicitis aguda con peritonitis generalizada (K35.2) como DP, Sepsis no especificada (A41.9) y Choque séptico (R65.21)"
      },
      {
        "id": "B",
        "code": "R65.21 como DP + K35.2",
        "text": "Choque séptico como Diagnóstico Principal"
      },
      {
        "id": "C",
        "code": "K35.80",
        "text": "Apendicitis aguda simple sin perforación"
      },
      {
        "id": "D",
        "code": "A41.9 como DP + K35.2",
        "text": "Sepsis como DP sin codificar choque séptico"
      }
    ],
    "correctOptionId": "A",
    "reasonedResolution": {
      "clinicalAnalysis": "Abdomen agudo quirúrgico con perforación visceral que desencadena peritonitis difusa y respuesta séptica sistémica con fracaso hemodinámico.",
      "cim10Path": "Capítulo 11 -> K35.2 (Apendicitis con peritonitis generalizada) + Capítulo 1 -> A41.9 + Capítulo 18 -> R65.21.",
      "ruleCheck": "Criterio MEAP de Admisión Quirúrgica: Cuando el paciente ingresa de urgencia para intervención por perforación de órgano hueco, la patología quirúrgica de base (K35.2) se selecciona como DP, seguida de la sepsis y el choque séptico.",
      "distractorExplanations": {
        "A": "Opción correcta. K35.2 como DP que justificó la cirugía de urgencia, seguido de sepsis y choque séptico.",
        "B": "Incorrecta: R65.21 no puede ser DP según las normas de codificación del Ministerio de Sanidad.",
        "C": "Incorrecta: Existía rotura apendicular y peritonitis purulenta en los cuatro cuadrantes.",
        "D": "Incorrecta: Omite el código R65.21 de choque séptico en paciente con aminas vasoactivas."
      }
    },
    "errorCategory": "jerarquia_diagnostica"
  }
];
