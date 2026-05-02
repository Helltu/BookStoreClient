'use client';

import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AiConsultant } from './ai-consultant';

export function AiConsultantWrapper() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  if (pathname.startsWith('/manager') || user?.role === 'MANAGER') return null;
  return <AiConsultant />;
}
