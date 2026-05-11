'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { RecommendationSection } from '@/components/recommendation-section';

export function PersonalRecommendations() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== 'CLIENT') return null;

  return <RecommendationSection title="Для вас" type="personal" />;
}
