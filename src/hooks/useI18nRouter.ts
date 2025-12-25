// navigation/useI18nRouter.ts
"use client";

import { useTransitionRouter } from "next-view-transitions";
import { i18nNav } from "@/i18n/navigation";

export function useI18nRouter() {
  const vtRouter = useTransitionRouter();
  const i18nRouter = i18nNav.useRouter();

  return {
    push: (href: Parameters<typeof i18nRouter.push>[0], options?: any) => {
      // const pathname = i18nNav.getPathname(href);
      vtRouter.push(href, options);
    },

    replace: (href: Parameters<typeof i18nRouter.replace>[0], options?: any) => {
      const pathname = i18nNav.getPathname(href);
      vtRouter.replace(pathname, options);
    },

    back: () => vtRouter.back(),
    forward: () => vtRouter.forward(),
  };
}
