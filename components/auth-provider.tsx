"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import apiClient from "@/lib/api/axios";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();
  const setCount = useWishlistStore((s) => s.setCount);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!isAuthenticated || user?.role === "MANAGER") return;
    apiClient
      .get("/users/me/wishlist", { skipErrorToast: true } as any)
      .then((res) => setCount((res.data || []).length))
      .catch(() => {});
  }, [isAuthenticated, user, setCount]);

  return <>{children}</>;
}