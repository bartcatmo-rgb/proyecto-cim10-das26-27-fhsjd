import React from 'react';
import { getCurrentUser } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import CommunicationDashboard from '@/components/chat/CommunicationDashboard';

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return <CommunicationDashboard user={user} />;
}
