"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <>{children}</>;
}