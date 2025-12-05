// src/components/features/dialogs/X2Dialog.tsx
"use client";

import { useBrandConfig } from "@/providers/brand.provider";

export default function X2Dialog() {
  const brand = useBrandConfig();
  return (
    <div className="w-[400px] rounded bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold">X2 Dialog 标题</h2>
      <p>这是 X2 弹框内容</p>
      <p>
        {brand.brandName} - {brand.skin}
      </p>
    </div>
  );
}
