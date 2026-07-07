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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const redirectTo = options.redirectTo ?? "/";

  const requestLogout = () => setOpen(true);

  const cancelLogout = () => {
    if (!loading) setOpen(false);
  };

  const confirmLogout = async () => {
    setLoading(true);
    try {
      options.onBeforeLogout?.();
      await authService.logout();
      setOpen(false);
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const LogoutConfirmDialog = () => (
    <ConfirmDialog
      open={open}
      title="Keluar dari akun?"
      message="Anda yakin ingin logout? Anda perlu masuk lagi untuk mengakses pesanan dan profil."
      confirmLabel="Logout"
      cancelLabel="Batal"
      loading={loading}
      danger
      onConfirm={() => {
        void confirmLogout();
      }}
      onCancel={cancelLogout}
    />
  );

  return { requestLogout, LogoutConfirmDialog };
}
