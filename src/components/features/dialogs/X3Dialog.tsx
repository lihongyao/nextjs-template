// src/components/features/dialogs/X2Dialog.tsx
"use client";

import Button from "@/components/ui/Button";
import { useDialog } from "@/components/ui/Dialog";

export default function X2Dialog() {
  const dialog = useDialog();
  return (
    <div className="w-[400px] rounded bg-white p-6 shadow-lg">
      <h2 className="text-xl font-bold">X3 Dialog 标题</h2>
      <p>这是 X3 弹框内容</p>
      <Button onClick={() => dialog.close("X3Dialog")}>关闭</Button>
    </div>
  );
}
