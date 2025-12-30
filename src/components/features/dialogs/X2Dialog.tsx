// src/components/features/dialogs/X2Dialog.tsx
"use client";

import Button from "@/components/ui/Button";
import { useDialog } from "@/components/ui/Dialog";
import { useRouter } from "@/i18n/navigation";
import { Routes } from "@/lib/routes";
import { useBrandConfig } from "@/providers/brand.provider";

export default function X2Dialog({ closeDialog }: { closeDialog?: () => void }) {
  const brand = useBrandConfig();
  const dialog = useDialog();
  const router = useRouter();
  return (
    <div className="w-[400px] rounded bg-white p-6 shadow-lg flex flex-col gap-4">
      <h2 className="text-xl font-bold">X2 Dialog 标题</h2>
      <p>这是 X2 弹框内容</p>
      <p>
        {brand.brandName} - {brand.skin}
      </p>
      <div className="flex items-center gap-4">
        <Button
          onClick={() => {
            dialog.open("X3Dialog", {
              onAfterClose() {
                console.log("X3 after closed");
              },
            });
          }}
        >
          打开X3
        </Button>
        <Button
          onClick={() => {
            dialog.close().then(() => router.push(Routes.Motion));
          }}
        >
          跳转其他页面
        </Button>
        <Button onClick={() => router.back()}>返回</Button>
      </div>
    </div>
  );
}
