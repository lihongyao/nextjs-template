// src/components/features/dialogs/X1Dialog.tsx
"use client";

import { useDialog } from "@/providers/dialog.provider";

export interface X1DialogProps {
  message?: string;
  onClose?: () => void;
}

export default function X1Dialog({ message, onClose }: X1DialogProps) {
  const dialog = useDialog();

  const onClose1 = () => onClose?.();
  const onClose2 = () => dialog.closeTop();
  const onClose3 = () => dialog.close("X1Dialog");

  return (
    <div data-name="X1Dialog" className="w-[400px] rounded bg-white p-4 shadow-lg">
      <h2 className="text-lg font-bold">X1 Dialog</h2>
      <p>{message || "这是 X1 弹框内容"}</p>
      <div className="flex gap-4">
        <button onClick={onClose1}>关闭弹框m1</button>
        <button onClick={onClose2}>关闭弹框m2</button>
        <button onClick={onClose3}>关闭弹框m3</button>
      </div>
    </div>
  );
}
