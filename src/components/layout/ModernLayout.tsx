// src/components/layout/ModernLayout.tsx

"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/class-helpers";
import { Routes } from "@/lib/routes";
import { useGlobalStore } from "@/stores/globalStore";
import Button from "../ui/Button";

const ASIDE_WIDTH = 252;
const HEADER_HEIGHT = 56;
export default function ModernLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useGlobalStore();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div data-name="ModernLayout" className="min-h-dvh flex flex-col">
      {/* 头部 */}
      <header
        className="sticky top-0 z-10 bg-blue-200 flex items-center px-4 gap-4"
        style={{
          height: HEADER_HEIGHT,
        }}
      >
        <Button onClick={() => toggleSidebar()}>{isSidebarOpen ? "关闭" : "打开"}</Button>
        {pathname !== Routes.Home && <Button onClick={() => router.back()}>返回</Button>}
        <span className="text-xl text-gray-500 italic font-bold">Modern Layout</span>
      </header>
      {/* 侧栏 */}
      <aside
        className={cn(
          "fixed left-0 transition-all duration-300 border-r overflow-hidden border-gray-300 flex flex-col justify-center items-center",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
        style={{
          width: ASIDE_WIDTH,
          top: HEADER_HEIGHT,
          height: `calc(100dvh - ${HEADER_HEIGHT}px)`,
        }}
      >
        <span className="text-xl text-gray-500 italic font-bold">ASIDE BAR</span>
      </aside>
      {/* 内容 */}
      <main className="flex">
        <div className="transition-all duration-300" style={{ width: isSidebarOpen ? ASIDE_WIDTH : 0 }} />
        <div className="flex-1 max-w-[1200px] mx-auto  px-3">
          <div className=" mx-auto bg-gray-100">{children}</div>
        </div>
      </main>
    </div>
  );
}
