"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/useAuthStore";

export function useAuth(redirectTo: string = "/") {
  const router = useRouter();
  const { token, baseUrl, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, redirectTo, router]);

  return {
    token,
    baseUrl,
    isAuthenticated: isAuthenticated(),
  };
}

export function useRequireAuth(redirectTo: string = "/") {
  const auth = useAuth(redirectTo);
  
  if (!auth.isAuthenticated) {
    return null;
  }
  
  return auth;
}
