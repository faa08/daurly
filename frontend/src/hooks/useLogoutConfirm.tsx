"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/ConfirmDialog";
import { authService } from "@/backend/authService";

type UseLogoutConfirmOptions = {
  redirectTo?: string;
  onBeforeLogout?: () => void;
};

export function useLogoutConfirm(options: UseLogoutConfirmOptions = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const redirectTo = options.redirectTo ?? "/";

  const requestLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      options.onBeforeLogout?.();
      await authService.logout();
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const LogoutConfirmDialog = () => null;

  return { requestLogout, LogoutConfirmDialog };
}
