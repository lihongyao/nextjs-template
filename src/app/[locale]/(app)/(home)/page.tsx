"use client";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
import { Routes } from "@/lib/routes";
export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    console.log("Home Page Loaded");
  }, []);
  return (
    <div data-name="HomePage">
      <div className="w-[300px] h-[200px] mx-auto mt-4 rounded-lg flex justify-center items-center  bg-blue-300">
        <span className="text-xl text-gray-500 italic font-bold"></span>
      </div>
      <div className="p-4 flex gap-2 flex-wrap">
        <Button onClick={() => router.push(Routes.I18n)}>国际化</Button>
        <Button onClick={() => router.push(Routes.ThemeAndSkin)}>主题皮肤</Button>
        <Button onClick={() => router.push(Routes.DynamicComps)}>组件动态导入</Button>
        <Button onClick={() => router.push(Routes.ModalProfile)}>路由弹框</Button>
        <Button onClick={() => router.push(Routes.Dialog)}>普通弹框</Button>
        <Button onClick={() => router.push(Routes.Motion)}>Motion</Button>
        <Button onClick={() => router.push(Routes.CdnImage)}>CDN图片参数优化</Button>
      </div>
      <div className="flex flex-col justify-center items-center gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={String(i)} className="w-[300px] h-[200px] rounded-lg flex justify-center items-center  bg-blue-300">
            <span className="text-xl text-gray-500 italic font-bold">{i + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
