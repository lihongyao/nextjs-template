// src/providers/brand.provider.tsx

// pnpm add js-cookie
// pnpm add @types/js-cookie -D

"use client";
import { createContext, type ReactNode, useContext } from "react";
import type { BrandConfig } from "@/configs/brands/types";

const BrandConfigContext = createContext<BrandConfig | null>(null);

export function BrandConfigProvider({
  value,
  children,
}: {
  value: BrandConfig;
  children: ReactNode;
}) {
  return (
    <BrandConfigContext.Provider value={value}>
      {children}
    </BrandConfigContext.Provider>
  );
}

export function useBrandConfig() {
  const ctx = useContext(BrandConfigContext);
  if (!ctx)
    throw new Error("必须在 BrandConfigProvider 上下文中使用 useBrandConfig");
  return ctx;
}
