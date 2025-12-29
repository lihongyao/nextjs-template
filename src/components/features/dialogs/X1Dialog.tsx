"use client";

import Button from "@/components/ui/Button";
import { useDialog } from "@/components/ui/Dialog";
import { useBrandConfig } from "@/providers/brand.provider";

export interface X1DialogProps {
  message?: string;
  count?: number;
  onClose?: () => void;
}

export default function X1Dialog({ message, count, onClose }: X1DialogProps) {
  const dialog = useDialog();

  const brand = useBrandConfig();

  const onClose1 = () => onClose?.();
  const onClose2 = () => dialog.closeTop();
  const onClose3 = () => dialog.close("X1Dialog");

  return (
    <div data-name="X1Dialog" className="rounded bg-white p-4 shadow-lg  w-full h-full">
      <h2 className="text-lg font-bold">X1 Dialog</h2>
      <p>{message || "这是 X1 弹框内容"}</p>
      <p>count: {count || "-"}</p>
      <p>
        {brand.theme} - {brand.skin}
      </p>

      <div className="flex gap-4 flex-wrap">
        <Button onClick={onClose1}>关闭m1</Button>
        <Button onClick={onClose2}>关闭m2</Button>
        <Button onClick={onClose3}>关闭m3</Button>
        <Button
          onClick={() => {
            dialog.open("X2Dialog", {
              onClose: () => console.log("X2 closed"),
            });
          }}
        >
          显示弹框2
        </Button>
      </div>
    </div>
  );
}
