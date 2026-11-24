import fs from 'fs';
import path from 'path';
import { User } from '@/types';

export interface ManualMeta {
  id: 'alumnos' | 'profesores' | 'administradores' | 'instituto_it';
  title: string;
  category: 'Estudiantes' | 'Docentes' | 'Administración y Seguridad' | 'Infraestructura IT';
  description: string;
  filename: string;
  targetRoles: Array<'student' | 'teacher' | 'admin'>;
}

export const MANUALS_REGISTRY: ManualMeta[] = [
  {
    id: 'alumnos',
    title: 'Manual de Usuario para Alumnos y Estudiantes',
    category: 'Estudiantes',
    description: 'Guía para acceso seguro (RGPD/LOPDGDD >= 14 años), navegación por temarios, casos MEAP, exámenes razonados, práctica inversa y Kahoot.',
    filename: 'MANUAL_ALUMNOS.md',
    targetRoles: ['student', 'teacher', 'admin'],
  },
  {
    id: 'profesores',
    title: 'Manual Metodológico y Operativo para Profesores',
    category: 'Docentes',
    description: 'Gestión de temas, importación de PDFs (%PDF-), generación en 3 niveles (Ollama / Cloud / Motor Clínico Offline) y seguimiento docente.',
    filename: 'MANUAL_PROFESORES.md',
    targetRoles: ['teacher', 'admin'],
  },
  {
    id: 'administradores',
    title: 'Manual de Administración, Seguridad y Gobernanza',
    category: 'Administración y Seguridad',
    description: 'Gestión de cuentas y roles duales, panel SOC de amenazas, alertas gratuitas (Email/Telegram), revocación de sesiones y derechos RGPD.',
    filename: 'MANUAL_ADMINISTRADORES.md',
    targetRoles: ['admin'],
  },
  {
    id: 'instituto_it',
    title: 'Manual de Arquitectura Técnica, Infraestructura y Operaciones IT',
    category: 'Infraestructura IT',
    description: 'Next.js 15, Node 22/24, SQLite AES-256-GCM + Blind Index HMAC, despliegue Vercel UE (cdg1) y paquete portable offline para aulas.',
    filename: 'MANUAL_INSTITUTO_IT.md',
    targetRoles: ['admin'],
  },
];

export function getEffectiveProfile(user: User): 'student' | 'teacher' | 'admin' {
  const isTeacherSpecific =
    user.username.toLowerCase().startsWith('profesor') ||
    user.username.toLowerCase().startsWith('docente') ||
    user.academicGroup?.toLowerCase().includes('claustro') ||
    user.academicGroup?.toLowerCase().includes('docente');

  const isAdminSpecific =
    user.username.toLowerCase().includes('admin') ||
    user.academicGroup?.toLowerCase().includes('dirección') ||
    user.id === 'usr_admin_initial';

  if (isTeacherSpecific && !isAdminSpecific) {
    return 'teacher';
  }

  if (user.activeRole === 'admin' || user.role === 'admin') {
    return 'admin';
  }

  return 'student';
}

export function getAllowedManualIds(user: User): Array<'alumnos' | 'profesores' | 'administradores' | 'instituto_it'> {
  const profile = getEffectiveProfile(user);
  if (profile === 'admin') {
    return ['alumnos', 'profesores', 'administradores', 'instituto_it'];
  }
  if (profile === 'teacher') {
    return ['profesores', 'alumnos'];
  }
  return ['alumnos'];
}

export function readManualContent(id: string): string {
  const manual = MANUALS_REGISTRY.find((m) => m.id === id);
  if (!manual) return '';

  try {
    const filePath = path.join(process.cwd(), 'docs', manual.filename);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
  } catch (err) {
    console.error(`Error reading manual file ${manual.filename}:`, err);
  }

  return `# ${manual.title}\n\n${manual.description}\n\n*Contenido disponible en el repositorio de documentación institucional.*`;
}
