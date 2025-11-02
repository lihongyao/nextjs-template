"use client";

import { usePathname, useRouter } from "next/navigation";
import { type Locale, routing } from "@/i18n/routing";

export default function SwitchLangs() {
  const router = useRouter();
  const pathname = usePathname(); // 当前 URL，例如 /en-US/page

  const langs: { code: Locale; label: string }[] = [
    { code: "zh-CN", label: "Chinese" },
    { code: "en-US", label: "English" },
    { code: "pt", label: "Português" },
    { code: "es", label: "Español" },
  ];

  const onSwitchLang = (lang: { code: Locale; label: string }) => {
    const segments = pathname.split("/").filter(Boolean) as Locale[];

    // 判断首段是否为已知 locale
    if (routing.locales.includes(segments[0])) {
      segments[0] = lang.code; // 替换现有语言
    } else {
      segments.unshift(lang.code); // 如果没有语言前缀，则添加
    }

    const newPath = `/${segments.join("/")}`;

    // 使用 replace 替换当前页面，不产生新的浏览历史
    router.replace(newPath);
  };

  return (
    <div className="flex items-center gap-4">
      {langs.map((lang) => (
        <button
          key={lang.code}
          onClick={() => onSwitchLang(lang)}
          className="px-2 py-1 border rounded cursor-pointer"
          type="button"
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
