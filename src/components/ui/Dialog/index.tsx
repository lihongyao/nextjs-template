// src/components/ui/Dialog/index.tsx
"use client";

import { type ReactNode, useEffect, useState } from "react";
import { cn } from "@/lib/class-helpers";
import "./animate.css";
import { createRoot, type Root } from "react-dom/client";

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
  /** 关闭 */
  onClose?: () => void;
  /** 动画结束 */
  onAnimationEnd?: () => void;
}

export function Dialog({ open = true, children, zIndex = 4000, maskClosable = true, autoDestroy, maskClassName, contentClassName, onClose, onAnimationEnd }: DialogProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);
  const [closing, setClosing] = useState(false);

  const isControlled = open !== undefined;

  // 挂载标记
  useEffect(() => setMounted(true), []);

  // 处理受控 open 状态
  useEffect(() => {
    if (!isControlled) return;

    if (open) {
      setVisible(true);
      setClosing(false);
    } else if (visible) {
      setClosing(true);
    }
  }, [open, isControlled, visible]);

  // 控制 body 滚动
  useEffect(() => {
    if (visible && !closing) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [visible, closing]);

  // autoDestroy，每次 open=true 都会触发
  useEffect(() => {
    if (!autoDestroy || !visible) return;

    const timer = setTimeout(() => setClosing(true), autoDestroy * 1000);
    return () => clearTimeout(timer);
  }, [autoDestroy, visible]);

  const handleMaskClick = () => {
    if (maskClosable) setClosing(true);
  };

  // 动画结束处理
  const handleAnimationEnd = () => {
    if (!closing) return;

    setVisible(false);
    setClosing(false);

    onAnimationEnd?.();
    onClose?.();
  };

  if (!mounted || !visible) return null;

  return (
    <div data-name="dialog-root" className="fixed inset-0" style={{ zIndex }}>
      <div className={cn("h-full w-full bg-black/70 backdrop-blur-xs", closing ? "fade-out" : "fade-in", maskClassName)} onClick={handleMaskClick} onAnimationEnd={handleAnimationEnd} />
      <div
        className={cn("absolute top-1/2 left-1/2 -translate-1/2 overflow-hidden", closing ? "zoom-out" : "zoom-in", contentClassName)}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        {children}
      </div>
    </div>
  );
}

// --- Static Dialog Manager ---
// ======================================
// 静态方法实现
// ======================================
type DialogStaticOptions = {
  content: ReactNode;
  maskClosable?: boolean;
  autoDestroy?: number;
  contentClassName?: string;
  maskClassName?: string;
  onClose?: () => void;
  zIndex?: number;
};

type DialogEntry = {
  container: HTMLDivElement;
  root: Root;
  key: string;
  close: () => void;
};

let dialogZIndex = 4000;
const dialogMap = new Map<string, DialogEntry>();

Dialog.open = (options: DialogStaticOptions) => {
  const key = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let closing = false;

  const close = () => {
    if (closing) return;
    closing = true;
    // 触发动画
    root.render(
      <Dialog
        open={false}
        maskClosable={options.maskClosable}
        autoDestroy={options.autoDestroy}
        contentClassName={options.contentClassName}
        maskClassName={options.maskClassName}
        zIndex={options.zIndex ?? dialogZIndex++}
        onClose={() => {
          root.unmount();
          container.remove();
          dialogMap.delete(key);
          options.onClose?.();
        }}
      >
        {options.content}
      </Dialog>,
    );
  };

  root.render(
    <Dialog
      open={true}
      maskClosable={options.maskClosable}
      autoDestroy={options.autoDestroy}
      contentClassName={options.contentClassName}
      maskClassName={options.maskClassName}
      zIndex={options.zIndex ?? dialogZIndex++}
      onClose={close}
    >
      {options.content}
    </Dialog>,
  );

  dialogMap.set(key, { container, root, key, close });

  return { key, close };
};

Dialog.close = (key?: string) => {
  if (key) {
    const entry = dialogMap.get(key);
    entry?.close();
  } else {
    dialogMap.forEach((entry) => {
      entry.close();
    });
  }
};
