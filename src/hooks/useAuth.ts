"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {UserType} from "./../types/UserType"

export function useAuthUser() {
  const router = useRouter();
  const [user, setUser] = useState<UserType|null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });

        if (!res.ok) {
          router.replace("/login");
          return;
        }

        const data = await res.json();
        setUser(data);
      } catch (err) {
        router.replace("/login");
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, [router]);

  return { user, authLoading };
}
