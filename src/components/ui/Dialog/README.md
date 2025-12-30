# DialogProps

```
interface DialogProps {
  /** 类名 - 遮罩 */
  maskClassName?: string;
  /** 类名 - 内容 */
  contentClassName?: string;
  /** 弹框是否打开 */
  open?: boolean;
  /** 弹框层级 */
  zIndex?: number;
  /** 弹框内容 */
  children: ReactNode;
  /** 是否允许点击遮罩关闭 */
  maskClosable?: boolean;
  /** 自动销毁 */
  autoDestroy?: number;
  /** 进入动画 */
  enterAnimation?: DialogEnterAnimation;
  /** 退出动画 */
  exitAnimation?: DialogExitAnimation;
  /** 是否允许同一类型 Dialog 同时打开多个实例 */
  multiple?: boolean;

  /** 用户点击遮罩 / 主动调用 close 时的回调（意图层） */
  onClose?: () => void;
  /** 弹框完全关闭后的回调（动画结束 / 卸载，生命周期） */
  onAfterClose?: () => void;

  /** 路由前进/后退时是否自动关闭 */
  closeOnPopstate?: boolean;
}
```
# 调用方式

## 受控组件
```tsx
"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
export default function Page() {
  const [open, setOpen] = useState(false);
  return (
    <div className="DialogExamples">
      <button onClick={() => setOpen(true)}>显示弹框</button>
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

```

## 注册模式

## 静态方法