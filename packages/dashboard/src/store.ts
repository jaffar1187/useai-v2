import { create } from "zustand";
import type { Session } from "@useai/types";
import { fetchSessions as apiFetchSessions } from "./lib/api.js";

interface DashboardState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  activeTab: "sessions" | "insights" | "settings";
  fetchSessions: () => Promise<void>;
  setActiveTab: (tab: DashboardState["activeTab"]) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  sessions: [],
  loading: true,
  error: null,
  activeTab: "sessions",

  fetchSessions: async () => {
    try {
      const sessions = await apiFetchSessions();
      set({ sessions, loading: false, error: null });
    } catch (err) {
      set({
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load sessions",
      });
    }
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
}));
