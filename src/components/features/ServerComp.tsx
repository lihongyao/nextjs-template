// src/components/features/ServerComp.tsx
import { getTranslations } from "next-intl/server";

export default async function ServerComp() {
  const t = await getTranslations();
  const point = 6000;
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div>服务端组件</div>
      <div>{process.env.NEXT_PUBLIC_API_BASE_URL}</div>
      <div className="bg-gray-200 w-full p-4 space-y-2 text-black">
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
    </div>
  );
}
