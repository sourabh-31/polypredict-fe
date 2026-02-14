import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      isDark: false,

      setTheme: (theme) =>
        set({
          theme,
          isDark: theme === "dark",
        }),

      toggleTheme: () => {
        const newTheme = get().theme === "dark" ? "light" : "dark";
        set({
          theme: newTheme,
          isDark: newTheme === "dark",
        });

        // Apply theme class to document
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    }),
    {
      name: "polypredict_theme",
      onRehydrateStorage: () => (state) => {
        // Apply theme class when store is rehydrated
        if (state?.theme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
    },
  ),
);
