// src/components/features/RouteModalRenderer.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ModalComponents } from "@/app/[locale]/(modals)";
import { cn } from "@/lib/class-helpers";

export type ModalComponentProps = {
  onCloseAction: () => void;
};

export default function RouteModalRenderer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 从 pathname 和 query 双保险读取 modalKey
  const pathSegments = pathname.split("/").filter(Boolean);
  const modalFromPath = pathSegments.find((s) => ModalComponents[s]);
  const modalFromQuery = searchParams.get("modal");
  const modalKey = modalFromPath || modalFromQuery;

  const ModalComponent = modalKey ? ModalComponents[modalKey] : null;

  const onCloseAction = useCallback(() => {
    if (!ModalComponent) return;

    // 优先尝试回退
    if (window.history.state?.idx > 0) {
      router.back();
      return;
    }

    // fallback: 移除 modal
    const newPathSegments = pathSegments.filter((s) => !s.startsWith("modal-"));
    const basePath = `/${newPathSegments.join("/")}`;
    const nextUrl = searchParams.toString() ? `${basePath}?${searchParams.toString()}` : basePath;

    router.replace(nextUrl, { scroll: false });
  }, [ModalComponent, router, pathSegments, searchParams]);

  return (
    <div data-name="RouteModalRenderer" className={cn("w-screen h-screen fixed inset-0 justify-center items-center bg-black/70 backdrop-blur-xs", ModalComponent ? "flex" : "hidden")}>
      {ModalComponent && <ModalComponent onCloseAction={onCloseAction} />}
    </div>
  );
}
