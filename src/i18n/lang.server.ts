import { getLocale } from "next-intl/server";
import { langMap } from "./routing";

export async function getLang() {
  const code = await getLocale();
  return langMap[code];
}
