"use client";

import { useEffect } from "react";
import { useUserStore } from "@/stores/user-store";

export function AuthSessionSync({ accessToken, email }: { accessToken?: string; email?: string }) {
  const setSession = useUserStore((state) => state.setSession);

  useEffect(() => {
    setSession(accessToken ? { accessToken, email } : null);
  }, [accessToken, email, setSession]);

  return null;
}
