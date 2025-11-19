// src/app/[lang]/_components/ClientInfo.tsx
"use client";
import { useBrandConfig } from "@/providers/brand.provider";

export default function ClientInfo() {
  const brand = useBrandConfig();
  return (
    <div>
      <h2 className="mb-4">—— 客户端组件 ——</h2>
      <h2>当前主题: {brand?.theme}</h2>
      <h2>当前皮肤: {brand?.skin}</h2>
      <h2>当前品牌: {brand?.brandName}</h2>
    </div>
  );
}
