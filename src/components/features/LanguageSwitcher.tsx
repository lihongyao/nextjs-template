// src/components/features/LanguageSwitcher.tsx
"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";
import { useBrandConfig } from "@/providers/brand.provider";

/**
 * LanguageSwitcher 组件
 *
 * 功能：
 * - 显示可用语言列表，每个按钮带国旗
 * - 当前选中语言高亮
 * - 点击按钮切换语言，使用 router.replace 替换当前 URL，不增加历史记录
 *
 * 数据依赖：
 * - routing.locales: 项目支持的语言列表
 * - routing.defaultLocale: 默认语言
 *
 * 用法：
 * <LanguageSwitcher />
 *
 * 备注：
 * - 使用了 clsx 工具函数来处理 Tailwind 类名动态拼接
 */

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const brand = useBrandConfig();

  // 当前语言前缀
  const currentLang =
    routing.locales.find((locale) => pathname?.startsWith(`/${locale}`)) ??
    routing.defaultLocale;

  // 切换语言
  const onSwitchLang = (lang: { code: string; label: string }) => {
    const segments = pathname.split("/").filter(Boolean);

    // 如果 URL 首段是已知语言，直接替换；否则在前面添加
    if (routing.locales.includes(segments[0])) {
      segments[0] = lang.code;
    } else {
      segments.unshift(lang.code);
    }

    // 替换当前页面，不增加浏览历史
    router.replace(`/${segments.join("/")}`);
  };

  return (
    <div className="flex items-center gap-2">
      {brand.locales.map((lang) => {
        const isActive = lang.code === currentLang;

        return (
          <button
            key={lang.code}
            type="button"
            onClick={() => onSwitchLang(lang)}
            className={clsx(
              "px-3 py-1.5 border rounded text-sm transition-colors cursor-pointer",
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
            )}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
