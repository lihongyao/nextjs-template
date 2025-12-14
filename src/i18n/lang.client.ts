import { useLocale } from "next-intl";
import { langMap } from "./routing";

export function useLang() {
  const locale = useLocale();
  return langMap[locale];
}
