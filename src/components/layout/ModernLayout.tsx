"use client";

import { cn } from "@/lib/class-helpers";
import { useGlobalStore } from "@/stores/globalStore";
import Button from "../ui/Button";

// src/components/layout/ModernLayout.tsx

export default function ModernLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, toggleSidebar } = useGlobalStore();
  return (
    <div data-name="ModernLayout" className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 h-[56px] bg-blue-400 flex items-center justify-center">
        <Button onClick={() => toggleSidebar()}>{isSidebarOpen ? "关闭" : "打开"}</Button>
        <span className="text-xl font-bold tracking-wider text-white">Modern Layout</span>
      </header>
      <main className="flex">
        <aside className={cn("transition-all duration-300 border-r border-gray-300", isSidebarOpen ? "w-[252px] translate-x-0" : "w-0 -translate-x-full")}>
          <span>Aside</span>
        </aside>
        <div className="flex-1  px-3">
          <div className="max-w-[1200px] mx-auto bg-gray-200">{children}</div>
        </div>
      </main>
    </div>
  );
}
