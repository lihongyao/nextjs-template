// src/components/features/RouteModalRenderer.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ModalComponents } from "@/app/[lang]/(modals)";
import { usePathname, useRouter } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";
import { cn } from "@/lib/class-helpers";

export type ModalComponentProps = {
  onCloseAction: () => void;
};

export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter(Boolean);
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  // 过滤出所有 modal-xxx
  const modalKeys = useMemo(() => pathSegments.filter((s) => ModalComponents[s]), [pathSegments]);
  const ModalComponent = useMemo(() => modalKeys.filter(Boolean).map((m) => ModalComponents[m]), [modalKeys]);
  const C = ModalComponent[0];

  const onCloseAction = useCallback(() => {
    if (ModalComponent.length <= 0) return;

    // 判断浏览器是否有可回退的历史记录（>2 表示有正常页面历史）
    const canGoBack = window.history.length > 2;
    if (canGoBack) {
      router.back();
      return;
    }

    // 手动从 URL 中移除 modal 参数，并更新路由
    const params = new URLSearchParams(searchParamsString);
    const nextQuery = params.toString();

    // 移除最后一个 modal 段
    const newPathSegments = [...pathSegments];
    newPathSegments.pop();
    const nextPath = "/" + newPathSegments.join("/");
    const finalPath = nextPath || `/${defaultLocale}`;
    const nextUrl = nextQuery ? `${finalPath}?${nextQuery}` : finalPath;

    // 使用 replace 替换当前路由（不触发页面刷新，不滚动）
    router.replace(nextUrl, { scroll: false });
  }, [ModalComponent, pathSegments, searchParamsString, router]);

  return (
    <div className={cn("w-screen h-screen fixed inset-0 bg-black/70 backdrop-blur-xs justify-center items-center ", ModalComponent.length > 0 ? "flex" : "hidden")}>
      {C && <C onCloseAction={onCloseAction} />}
    </div>
  );
}
