// components/I18nLink.tsx
"use client";

import { Link as VTLink } from "next-view-transitions";
import { i18nNav } from "@/i18n/navigation";

export function I18nLink(props: any) {
  const href = i18nNav.getPathname(props.href);
  return <VTLink {...props} href={href} />;
}
