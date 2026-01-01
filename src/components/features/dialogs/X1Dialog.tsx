"use client";

import Button from "@/components/ui/Button";
import { useDialog } from "@/components/ui/Dialog";
import { useBrandConfig } from "@/providers/brand.provider";

export interface X1DialogProps {
  message?: string;
  count: number;
}

export default function X1Dialog({ message, count }: X1DialogProps) {
  const dialog = useDialog();
  const brand = useBrandConfig();

  const onClose1 = () => dialog.closeTop();
  const onClose2 = () => dialog.close("X1Dialog");

  return (
    <div data-name="X1Dialog" className="rounded bg-white p-4 shadow-lg  w-full h-full">
      <h2 className="text-lg font-bold">X1 Dialog</h2>

      <p>{message}</p>
      <p>count: {count || "-"}</p>
      <p>Theme: {brand.theme}</p>
      <p>Skin: {brand.skin}</p>

      <div className="flex gap-4 flex-wrap mt-4">
        <Button onClick={onClose1}>关闭m1</Button>
        <Button onClick={onClose2}>关闭m2</Button>
        <Button
          onClick={() => {
            dialog.open("X2Dialog", {
              closeOnPopstate: false,
              onAfterClose() {
                console.log("X2 closed");
              },
            });
          }}
        >
          显示弹框2
        </Button>
      </div>
    </div>
  );
}
