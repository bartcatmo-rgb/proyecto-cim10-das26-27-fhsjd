import { NextRequest, NextResponse } from 'next/server';
import { getUserByUsername, getUserByDni, createUser } from '@/lib/db/queries';
import { hashPassword, validateDniNie } from '@/lib/auth/crypto';
import { setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit } from '@/lib/auth/rate-limit';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register:${ip}`, 10, 60 * 1000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Demasiadas solicitudes. Por favor espera ${rateCheck.resetInSeconds} segundos.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password, fullName, dniNie, email, phone, academicGroup } = body;

    // Basic presence checks
    if (!username || !password || !fullName || !dniNie || !email || !academicGroup) {
      return NextResponse.json(
        { error: 'Todos los campos marcados como obligatorios deben completarse.' },
        { status: 400 }
      );
    }

    // Password strength check (min 8 chars)
    if (String(password).length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe contener al menos 8 caracteres.' },
        { status: 400 }
      );
    }

    // Strict official DNI/NIE validation algorithm
    const dniValidation = validateDniNie(String(dniNie));
    if (!dniValidation.valid) {
      return NextResponse.json(
        { error: dniValidation.error || 'DNI o NIE no válido según el algoritmo oficial.' },
        { status: 400 }
      );
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email).trim())) {
      return NextResponse.json(
        { error: 'El formato de correo electrónico no es válido.' },
        { status: 400 }
      );
    }

    // Uniqueness checks
    const existingUsername = getUserByUsername(String(username).trim());
    if (existingUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está registrado en el aula.' },
        { status: 409 }
      );
    }

    const existingDni = getUserByDni(dniValidation.formatted);
    if (existingDni) {
      return NextResponse.json(
        { error: 'Ya existe un alumno registrado con este documento (DNI/NIE).' },
        { status: 409 }
      );
    }

    // Hash password with scrypt + salt
    const { hash, salt } = hashPassword(String(password));

    // Role is strictly 'student' from the registration endpoint (no privilege escalation)
    const newUser = createUser({
      username: String(username).trim().toLowerCase(),
      passwordHash: hash,
      passwordSalt: salt,
      fullName: String(fullName).trim(),
      dniNie: dniValidation.formatted,
      email: String(email).trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      academicGroup: String(academicGroup).trim(),
      role: 'student',
    });

    // Automatically set session
    await setSessionCookie(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role,
        academicGroup: newUser.academicGroup,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'Error interno al registrar el alumno.' },
      { status: 500 }
    );
  }
}
