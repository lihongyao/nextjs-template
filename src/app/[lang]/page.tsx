"use client";

import { useTranslations } from "next-intl";
import SwitchLangs from "@/components/features/SwitchLangs";

export default function Page() {
  const t = useTranslations();
  const point = 6000;

  return (
    <div className="flex flex-col items-center gap-4">
      <SwitchLangs />

      {/* 1. 没有变量 */}
      <div>{t("title")}</div>
      <div>{t("profile.tips")}</div>

      {/* 2. 存在变量（插值） */}
      <div>{t("profile.reward1", { point })}</div>

      {/* 3. 自定义渲染 */}
      <div>
        {t.rich("profile.reward2", {
          tag: (children) => (
            <span className="text-red-500 font-bold">{children}</span>
          ),
          point,
        })}
      </div>
    </div>
  );
}
