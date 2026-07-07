import { apiFetch } from "@/lib/api-client";

export const systemSettingsService = {
  async getMaintenanceMode(): Promise<boolean> {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      const data = await res.json();
      return !!data.maintenance;
    } catch {
      return false;
    }
  },

  async setMaintenanceMode(maintenance: boolean): Promise<boolean> {
    try {
      const res = await apiFetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maintenance }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
