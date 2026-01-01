"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { Dialog, type DialogType, useDialog } from "@/components/ui/Dialog";
import { useRouter } from "@/i18n/navigation";
import { Routes } from "@/lib/routes";
import { openWithGlobalInstance } from ".";

type DialogConfig = {
  type: DialogType; // 对应 dialogRegistry 的 key
  props?: Record<string, unknown>; // 传递给弹窗组件的 props
  maskClosable?: boolean;
  autoDestroy?: number;
  maskClassName?: string;
  contentClassName?: string;
};

export default function Demo() {
  const [open, setOpen] = useState(false);
  const dialog = useDialog();
  const router = useRouter();

  const openX1 = () => {
    dialog.open("X1Dialog", {
      props: { message: "Hello X1!", count: 3.14 },
      contentClassName: "w-[80%]",
      onAfterClose: () => console.log("X1 closed"),
    });
  };

  const openX2 = () => {
    dialog.open("X2Dialog", {
      onAfterClose() {
        console.log("X2 closed");
      },
    });
  };

  const openX2AutoClose = () => {
    const x = dialog.open("X2Dialog", {
      autoDestroy: 2,
      onAfterClose() {
        console.log("X2 closed");
      },
    });
    setTimeout(() => {
      // x.requestClose();
      // dialog.closeTop();
      // dialog.close("X2Dialog");
    }, 1000);
  };

  const openQueue = async () => {
    await dialog.queue("X1Dialog", {
      props: { message: "Hello X1!", count: 30 },
      onAfterClose: () => console.log("X1 closed"),
    });
    await dialog.queue("X2Dialog", {
      onAfterClose: () => console.log("X2 closed"),
    });
  };

  const openStatic = () => {
    Dialog.open({
      maskClosable: true,
      autoDestroy: 2,
      content: (
        <div className="p-10 bg-white rounded-md flex flex-col justify-center gap-4 items-center">
          <div>这是弹框内容</div>
          <Button onClick={() => Dialog.close()}>关闭</Button>
        </div>
      ),
      onAfterClose: () => console.log("static open dialog closed"),
    });
  };

  const showDialogQueue = async (queue: DialogConfig[]) => {
    console.log("showDialogQueue >>> ", queue);
    setTimeout(async () => {
      for (const item of queue) {
        await dialog.queue(item.type, {
          props: item.props,
          maskClosable: item.maskClosable,
          autoDestroy: item.autoDestroy,
          maskClassName: item.maskClassName,
          contentClassName: item.contentClassName,
          onAfterClose: () => console.log(`${item.type} closed`),
        });
      }
    }, 0);
  };

  useEffect(() => {
    // 假设这是从服务器获取的弹框队列
    const dialogQueueFromServer: DialogConfig[] = [
      { type: "X1Dialog", props: { message: "Hello X1!" } },
      { type: "X2Dialog", props: { message: "Hello X2!" }, autoDestroy: 5 },
      {
        type: "X3Dialog",
        props: { message: "Hello X3!" },
        maskClosable: false,
      },
    ];
    if (dialogQueueFromServer.length > 0) {
      // showDialogQueue(dialogQueueFromServer);
    }
  }, []);

  const openMuiltipleSameDialog = () => {
    dialog.open("X1Dialog", {
      multiple: false,
      props: {
        count: 100,
        message: "哈哈哈哈",
      },
      onAfterClose() {
        console.log("X1 closed");
      },
    });

    // setTimeout(() => {
    //   dialog.open("X1Dialog", {
    //     multiple: false,
    //     onAfterClose() {
    //       console.log("X1 closed!");
    //     },
    //     props: (prev) => {
    //       console.log(prev);
    //       return {
    //         message: "嘿嘿嘿嘿",
    //         count: (prev?.count ?? 0) + 100,
    //       };
    //     },
    //   });
    // }, 2000);

    // setTimeout(() => {
    //   dialog.open("X1Dialog", {
    //     multiple: true,
    //     props: {
    //       count: 100,
    //       message: "哈哈哈哈",
    //     },
    //     onAfterClose() {
    //       console.log("X1 closed!");
    //     },
    //   });
    // }, 1000);

    setTimeout(() => {
      // dialog.updateProps("X1Dialog", {
      //   count: 300,
      // })
      // dialog.updateProps("X1Dialog", (prev) => {
      //   console.log(prev);
      //   return {
      //     message: "啦啦啦啦",
      //     count: (prev?.count ?? 0) + 100,
      //   };
      // });
    }, 2000);

    // setTimeout(() => {
    //   dialog.updateProps("X1Dialog", (prev) => {
    //     console.log(prev);
    //     return {
    //       message: "嘿嘿嘿嘿123",
    //       count: (prev?.count ?? 0) + 100,
    //     };
    //   });
    // }, 3000);
  };

  return (
    <div className="flex gap-4 p-4 flex-wrap">
      <Button onClick={() => setOpen(true)}>组件调用(受控)</Button>
      <Button onClick={openX1}>Open X1</Button>
      <Button onClick={openX2}>Open X2</Button>
      <Button onClick={openX2AutoClose}>openX2AutoClose</Button>
      <Button onClick={openQueue}>queue dialogs</Button>
      <Button onClick={openStatic}>静态调用</Button>
      <Button onClick={openWithGlobalInstance}>全局Dialog实例</Button>
      <Button onClick={openMuiltipleSameDialog}>延迟弹相同弹框</Button>
      <Button
        onClick={() => {
          router.back();
          dialog.open("X2Dialog", {
            closeOnPopstate: false,
          });
        }}
      >
        后退时是否自动关闭
      </Button>

      {/* 组件调用(受控) */}
      <Dialog
        open={open}
        onClose={() => {
          console.log("close");
          setOpen(false);
        }}
        onAfterClose={() => {
          console.log("onAfterClose");
        }}
      >
        <div className="p-5 w-[80%] flex flex-col justify-center gap-4 bg-white rounded-md items-center min-w-[300px] ">
          <div>这是弹框内容</div>
          <div className="flex gap-4 items-center">
            <Button onClick={() => setOpen(false)}>关闭</Button>
            <Button onClick={() => router.push(Routes.Home)}>跳转页面</Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
