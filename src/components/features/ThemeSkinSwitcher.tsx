// src/components/features/ThemeSkinSwitcher.tsx
"use client";

import clsx from "clsx";
import { useThemeActions } from "@/hooks/useThemeActions";
import { useBrandConfig } from "@/providers/brand.provider";

export default function ThemeSkinSwitcher() {
  const { setTheme, setSkin } = useThemeActions();
  const { theme, skin } = useBrandConfig();
  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <span>主题切换：</span>
        <button
          type="button"
          className={clsx("cursor-pointer", {
            "text-(--color-primary)": theme === "modern",
          })}
          onClick={() => setTheme("modern")}
        >
          Modern
        </button>
        <button
          type="button"
          className={clsx("cursor-pointer", {
            "text-(--color-primary)": theme === "classic",
          })}
          onClick={() => setTheme("classic")}
        >
          Classic
        </button>
      </div>
      <div className="flex items-center gap-4">
        <span>皮肤切换：</span>
        <button
          type="button"
          className={clsx("cursor-pointer", {
            "text-(--color-primary)": skin === "light",
          })}
          onClick={() => setSkin("light")}
        >
          Light
        </button>
        <button
          type="button"
          className={clsx("cursor-pointer", {
            "text-(--color-primary)": skin === "dark",
          })}
          onClick={() => setSkin("dark")}
        >
          Dark
        </button>
      </div>
    </div>
  );
}
