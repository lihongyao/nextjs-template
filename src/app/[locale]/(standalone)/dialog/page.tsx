"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { useDialog } from "@/providers/dialog.provider";

export default function Demo() {
  const [open, setOpen] = useState(false);
  const dialog = useDialog();

  const openX1 = () => {
    dialog.open("X1Dialog", { props: { message: "Hello X1!" }, onClose: () => console.log("X1 closed") });
  };

  const openX2 = () => {
    dialog.open("X2Dialog", { onClose: () => console.log("X1 closed") });
  };

  const openX2AutoClose = () => {
    const x = dialog.open("X2Dialog", { autoDestroy: 2, onClose: () => console.log("X2 closed") });
    setTimeout(() => {
      // x.requestClose();
      // dialog.closeTop();
      // dialog.close("X2Dialog");
    }, 1000);
  };

  const openQueue = async () => {
    await dialog.queue("X1Dialog", { props: { message: "Hello X1!" }, onClose: () => console.log("X1 closed") });
    await dialog.queue("X2Dialog", { props: { message: "Hello X2!" }, onClose: () => console.log("X2 closed") });
  };

  const openStatic = () => {
    Dialog.open({
      maskClosable: true,
      content: (
        <div className="p-10 bg-white rounded-md">
          <div>这是弹框内容</div>
          <div
            onClick={() => {
              Dialog.close();
            }}
          >
            关闭
          </div>
        </div>
      ),
      onClose: () => console.log("closed"),
    });
  };

  return (
    <div className="flex items-center gap-4 p-4">
      <Button onClick={() => setOpen(true)}>组件调用</Button>
      <Button onClick={openX1}>Open X1</Button>
      <Button onClick={openX2}>Open X2</Button>
      <Button onClick={openX2AutoClose}>openX2AutoClose</Button>
      <Button onClick={openQueue}>queue dialogs</Button>
      <Button onClick={openStatic}>静态调用</Button>

      <Dialog open={open} onClose={() => setOpen(false)} maskClosable={true}>
        <div className="p-10 bg-white rounded-md">
          <div>这是弹框内容</div>
          <div onClick={() => setOpen(false)}>关闭</div>
        </div>
      </Dialog>
    </div>
  );
}
