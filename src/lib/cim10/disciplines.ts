import { ServiceArea } from '@/types';

export interface DisciplineInfo {
  id: ServiceArea;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  icon: string;
  keyConcepts: string[];
}

export const DISCIPLINE_CATALOG: Record<ServiceArea, DisciplineInfo> = {
  atencion_primaria: {
    id: 'atencion_primaria',
    name: 'Atención Primaria y Comunitaria',
    shortName: 'At. Primaria',
    badge: 'AP',
    description: 'Medicina de Familia y Comunitaria: Códigos Z, motivos de consulta, síntomas inespecíficos, seguimiento de cronicidad y cribados poblacionales.',
    color: 'from-emerald-600 to-teal-700',
    bgLight: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderColor: 'border-emerald-300',
    textColor: 'text-emerald-700',
    icon: 'Stethoscope',
    keyConcepts: ['Códigos Z (Z00-Z99)', 'Síntomas R00-R99', 'Cronicidad e hipertensión', 'Control postquirúrgico y vacunas'],
  },
  urgencias: {
    id: 'urgencias',
    name: 'Urgencias Hospitalarias',
    shortName: 'Urgencias',
    badge: 'URG',
    description: 'Atención de emergencias: Motivo de urgencia como diagnóstico principal, traumatismos, causas externas (V00-Y99), episodio inicial vs. secuelas y descarte de sospechas no confirmadas.',
    color: 'from-amber-600 to-red-600',
    bgLight: 'bg-amber-50 text-amber-800 border-amber-200',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-700',
    icon: 'AlertTriangle',
    keyConcepts: ['Motivo principal de urgencia', 'Causas externas de lesión', 'Séptimo carácter A/D/S', 'Diagnósticos no confirmados (sospechas)'],
  },
  especializada_medica: {
    id: 'especializada_medica',
    name: 'Especializada Médica y Hospitalización',
    shortName: 'Esp. Médica',
    badge: 'MED',
    description: 'Hospitalización Médica y Consultas Externas: Diagnóstico Principal tras estudio vs. Secundarios, comorbilidades (NDP/POAD) y manifestaciones etiológicas.',
    color: 'from-blue-600 to-indigo-700',
    bgLight: 'bg-blue-50 text-blue-800 border-blue-200',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    icon: 'Building2',
    keyConcepts: ['Diagnóstico Principal (DP)', 'Comorbilidades y complicaciones', 'Etiología y manifestación', 'Reglas de exclusión 1 y 2'],
  },
  especializada_quirurgica: {
    id: 'especializada_quirurgica',
    name: 'Especializada Quirúrgica y Obstetricia',
    shortName: 'Esp. Quirúrgica',
    badge: 'CX',
    description: 'Cirugía general, Traumatología y Obstetricia: Lateralidad estricta, complicaciones de procedimientos quirúrgicos (T80-T88) y codificación obstétrica.',
    color: 'from-violet-600 to-purple-800',
    bgLight: 'bg-violet-50 text-violet-800 border-violet-200',
    borderColor: 'border-violet-300',
    textColor: 'text-violet-700',
    icon: 'Scissors',
    keyConcepts: ['Lateralidad (derecho/izquierdo/bilateral)', 'Complicaciones quirúrgicas', 'Capítulo 15 Embarazo/Parto', 'Procedimientos y afecciones concurrentes'],
  },
  laboratorio_ap: {
    id: 'laboratorio_ap',
    name: 'Laboratorio y Anatomía Patológica',
    shortName: 'Lab / AP',
    badge: 'LAB',
    description: 'Diagnóstico anatomopatológico y microbiológico: Morfología y comportamiento neoplásico (in situ vs. invasivo), agentes infecciosos (B95-B97) y biomarcadores.',
    color: 'from-cyan-600 to-sky-700',
    bgLight: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    borderColor: 'border-cyan-300',
    textColor: 'text-cyan-700',
    icon: 'Microscope',
    keyConcepts: ['Neoplasias primarias vs secundarias', 'Comportamiento histológico', 'Microorganismos causales', 'Hallazgos de laboratorio'],
  },
  salud_mental: {
    id: 'salud_mental',
    name: 'Salud Mental y Neuropsiquiatría',
    shortName: 'Salud Mental',
    badge: 'SM',
    description: 'Capítulo 5 CIM-10: Trastornos mentales y del comportamiento, consumo de sustancias (uso, abuso, dependencia), psicosis orgánicas y secuelas neurocognitivas.',
    color: 'from-fuchsia-600 to-pink-700',
    bgLight: 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200',
    borderColor: 'border-fuchsia-300',
    textColor: 'text-fuchsia-700',
    icon: 'Brain',
    keyConcepts: ['Capítulo 5 (F01-F99)', 'Consumo / Abuso / Dependencia', 'Trastornos del estado de ánimo', 'Manifestaciones orgánicas'],
  },
  simulacro_integral: {
    id: 'simulacro_integral',
    name: 'Simulacro Integral MEAP (Todos los ámbitos)',
    shortName: 'Simulacro',
    badge: 'GLOBAL',
    description: 'Evaluación global combinada: Casos clínicos cruzados de todos los niveles y servicios asistenciales, simulando la práctica profesional real del técnico superior en Documentación y Administración Sanitarias.',
    color: 'from-slate-700 to-slate-900',
    bgLight: 'bg-slate-100 text-slate-900 border-slate-300',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-800',
    icon: 'FileCheck',
    keyConcepts: ['Visión transversal hospitalaria', 'Integración de todos los capítulos', 'Gestión de alta complejidad', 'Tiempo y precisión profesional'],
  },
};

export interface LevelInfo {
  level: number;
  name: string;
  badge: string;
  description: string;
  requiredPassPercentage: number;
  complexity: string;
  focus: string;
}

export const LEVELS_CONFIG: Record<number, LevelInfo> = {
  1: {
    level: 1,
    name: 'Nivel 1: Principiante',
    badge: 'NV1',
    description: 'Estructura general, capítulos y categorías principales de 3 caracteres.',
    requiredPassPercentage: 80,
    complexity: 'Baja',
    focus: 'Estructura de la clasificación y búsqueda inicial de categorías.',
  },
  2: {
    level: 2,
    name: 'Nivel 2: Básico',
    badge: 'NV2',
    description: 'Subcategorías de 4 a 5 caracteres, localización anatómica y lateralidad simple.',
    requiredPassPercentage: 80,
    complexity: 'Media-Baja',
    focus: 'Especificación de localización y diferenciación de derecha/izquierda.',
  },
  3: {
    level: 3,
    name: 'Nivel 3: Intermedio',
    badge: 'NV3',
    description: 'Notas normativas de Inclusión, Excluye 1 (mutuamente excluyentes) y Excluye 2 (no incluidas aquí).',
    requiredPassPercentage: 85,
    complexity: 'Media',
    focus: 'Aplicación estricta de notas de inclusión y exclusión.',
  },
  4: {
    level: 4,
    name: 'Nivel 4: Avanzado',
    badge: 'NV4',
    description: 'Códigos combinados, etiología/manifestación, causa externa y 7º carácter.',
    requiredPassPercentage: 85,
    complexity: 'Alta',
    focus: 'Doble codificación, código primario + manifestación y episodios inicial/subsiguiente.',
  },
  5: {
    level: 5,
    name: 'Nivel 5: Experto',
    badge: 'NV5',
    description: 'Informes de alta hospitalaria complejos: Selección del Diagnóstico Principal vs. Secundarios, comorbilidades y procedimientos.',
    requiredPassPercentage: 85,
    complexity: 'Experto',
    focus: 'Criterio MEAP de selección de Diagnóstico Principal y jerarquía médica.',
  },
};

export const ALL_SERVICE_AREAS: ServiceArea[] = [
  'atencion_primaria',
  'urgencias',
  'especializada_medica',
  'especializada_quirurgica',
  'laboratorio_ap',
  'salud_mental',
  'simulacro_integral',
];
