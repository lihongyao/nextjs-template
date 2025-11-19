import Cookies from "js-cookie";
import type { Skin, Theme } from "@/configs/brands/types";

export function useThemeActions() {
  const setSkin = (newSkin: Skin) => {
    Cookies.set("skin", newSkin, { path: "/", expires: 365 });
    window.location.reload();
  };
  const setTheme = (newTheme: Theme) => {
    Cookies.set("theme", newTheme, { path: "/", expires: 365 });
    window.location.reload();
  };
  return { setSkin, setTheme };
}
