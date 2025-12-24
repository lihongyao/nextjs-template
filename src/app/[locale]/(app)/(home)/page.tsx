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
    <div className="p-4 flex gap-2 flex-wrap">
      <Button onClick={() => router.push(Routes.I18n)}>国际化</Button>
      <Button onClick={() => router.push(Routes.ThemeAndSkin)}>主题皮肤</Button>
      <Button onClick={() => router.push(Routes.DynamicComps)}>组件动态导入</Button>
      <Button onClick={() => router.push(Routes.ModalProfile)}>路由弹框</Button>
      <Button onClick={() => router.push(Routes.Dialog)}>普通弹框</Button>
    </div>
  );
}
