import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/session';
import { maskDni } from '@/lib/auth/crypto';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      maskedDni: maskDni(user.dniNie),
      email: user.email,
      phone: user.phone,
      academicGroup: user.academicGroup,
      role: user.role,
      activeRole: user.activeRole || user.role,
      canSwitchRole: Boolean(user.canSwitchRole),
      mustChangePassword: Boolean(user.mustChangePassword),
      courseId: user.courseId,
      status: user.status,
      createdAt: user.createdAt,
    },
  });
}
