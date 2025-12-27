"use client";

import { forwardRef, type ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createRoot, type Root } from "react-dom/client";
import { cn } from "@/lib/class-helpers";
import "./animate.css";
import React, { createContext, useContext } from "react";
import { dialogRegistry } from "@/components/features/dialogs";

/** 进入动画 */
export type DialogEnterAnimation = "fade-in" | "zoom-in" | "slide-up-in" | "slide-right-in";
/** 退出动画 */
export type DialogExitAnimation = "fade-out" | "zoom-out" | "slide-up-out" | "slide-right-out";

/** Dialog 组件 props */
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
  /** 关闭 */
  onClose?: () => void;
  /** 路由前进/后退时是否自动关闭 */
  closeOnPopstate?: boolean;
  /** 内部使用，标记是否由 Provider 管理，避免重复监听 popstate */
  _managedByProvider?: boolean;
}

// === 全局 Dialog 基础 ===

/** 全局可见 Dialog 集合，用于 body scroll 管理 */
const visibleDialogs = new Set<string>();

/** 锁住 body 滚动 */
const lockBodyScroll = () => {
  document.body.style.overflow = "hidden";
};

/** 解锁 body 滚动（只有没有任何弹窗时才解锁） */
const unlockBodyScroll = () => {
  if (visibleDialogs.size === 0) document.body.style.overflow = "";
};

/** 对外暴露的 Ref 方法类型 */
interface DialogRef {
  setIsExiting: () => void;
}

// === Dialog 组件 ===

/** 支持 forwardRef，以便静态方法或 Provider 控制弹窗关闭 */
const DialogComponent = forwardRef<DialogRef, DialogProps>((props, ref) => {
  const {
    open = true,
    children,
    zIndex = 4000,
    maskClosable = true,
    autoDestroy,
    maskClassName,
    contentClassName,
    enterAnimation = "zoom-in",
    exitAnimation = "zoom-out",
    onClose,
    closeOnPopstate = true,
    _managedByProvider = false,
  } = props;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);

  // 是否为受控组件（通过是否显式传入 open 判断）
  const isControlled = open !== undefined;

  const dialogId = useRef(`DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`);
  const autoDestroyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    setIsExiting: () => setIsExiting(true),
  }));

  // 初始化挂载
  useEffect(() => setMounted(true), []);

  // 响应受控组件 open 状态变化
  useEffect(() => {
    if (!isControlled) return;
    if (open) {
      setVisible(true);
      setIsExiting(false);
    } else if (visible) {
      setIsExiting(true);
    }
  }, [open, isControlled, visible]);

  // 自动销毁逻辑
  useEffect(() => {
    if (!autoDestroy || !visible) return;

    autoDestroyTimer.current = setTimeout(() => setIsExiting(true), autoDestroy * 1000);

    return () => {
      if (autoDestroyTimer.current) {
        clearTimeout(autoDestroyTimer.current);
        autoDestroyTimer.current = null; // ✅ 清理引用，防止重复清理
      }
    };
  }, [autoDestroy, visible]);

  // 点击遮罩关闭
  const handleMaskClick = () => maskClosable && setIsExiting(true);

  // 动画结束处理
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    // 只响应遮罩自身动画结束，避免子元素动画冒泡
    if (e.target !== e.currentTarget) return;
    if (!isExiting) return;

    setVisible(false);
    setIsExiting(false);

    visibleDialogs.delete(dialogId.current);
    unlockBodyScroll();
    onClose?.();
  };

  // 管理全局可见 Dialog 集合，锁滚动
  useEffect(() => {
    if (visible && !isExiting) {
      visibleDialogs.add(dialogId.current);
      lockBodyScroll();
    }
    return () => {
      visibleDialogs.delete(dialogId.current);
      unlockBodyScroll();
    };
  }, [visible, isExiting]);

  // ✅ 兼容单独使用 Dialog 时的 popstate
  useEffect(() => {
    // 如果关闭功能被禁用，或者由 Provider 管理，则跳过
    if (!closeOnPopstate || _managedByProvider) return;

    const handlePopstate = () => setIsExiting(true);
    window.addEventListener("popstate", handlePopstate);

    return () => window.removeEventListener("popstate", handlePopstate);
  }, [closeOnPopstate, _managedByProvider]);

  if (!mounted || !visible) return null;

  const content = (
    <div data-name="dialog-root" className="fixed inset-0" style={{ zIndex }}>
      <div
        className={cn("h-full w-full bg-black/70 backdrop-blur-xs flex justify-center items-center", isExiting ? "fade-out" : "fade-in", maskClassName)}
        onClick={handleMaskClick}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className={cn(isExiting ? exitAnimation : enterAnimation, contentClassName)} onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
});

// === 导出 Dialog ===
export const Dialog = DialogComponent as typeof DialogComponent & {
  open: (options: DialogStaticOptions) => { key: string; close: () => void };
  close: (key?: string) => void;
};

// === 静态方法管理 ===
type DialogStaticOptions = Omit<DialogProps, "open" | "children"> & {
  content: ReactNode;
};

type DialogEntry = {
  root: Root;
  container: HTMLDivElement;
  key: string;
  close: () => void;
  closeDialog: () => void;
};

let dialogZIndex = 4000;
const dialogMap = new Map<string, DialogEntry>();

Dialog.open = (options: DialogStaticOptions) => {
  const key = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
  let closing = false;

  const close = () => {
    if (closing) return;
    closing = true;
    dialogMap.get(key)?.closeDialog();
  };

  const dialogRef: { current: DialogRef | null } = { current: null };

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  root.render(
    <DialogComponent
      ref={dialogRef}
      open
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
      closeOnPopstate={options.closeOnPopstate}
    >
      {options.content}
    </DialogComponent>,
  );

  dialogMap.set(key, {
    root,
    container,
    key,
    close,
    closeDialog: () => dialogRef.current?.setIsExiting(),
  });

  return { key, close };
};

Dialog.close = (key?: string) => {
  if (key) dialogMap.get(key)?.close();
  else
    dialogMap.forEach((entry) => {
      entry.close();
    });
};

// === Provider + useDialog ===

export type DialogType = keyof typeof dialogRegistry;

export type OpenDialogOptions<K extends DialogType = DialogType> = Omit<DialogProps, "open" | "children"> & {
  props?: Partial<React.ComponentProps<(typeof dialogRegistry)[K]>>;
};

type DialogInstance = {
  key: string;
  type: DialogType;
  content: ReactNode;
  zIndex: number;
  requestClose: () => void;
  closeOnPopstate: boolean;
};

type DialogContextValue = {
  open: <K extends DialogType>(type: K, options?: OpenDialogOptions<K>) => DialogInstance;
  queue: <K extends DialogType>(type: K, options?: OpenDialogOptions<K>) => Promise<void>;
  closeTop: () => void;
  close: (type?: DialogType) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialogContext must be used within DialogProvider");
  return ctx;
};

// 全局 dialog 实例，用于在非 React 上下文中调用
let globalDialogInstance: DialogContextValue | null = null;
// 获取全局 dialog 实例（用于非 React 上下文）
export const getGlobalDialog = (): DialogContextValue => {
  if (!globalDialogInstance) {
    throw new Error("DialogProvider 尚未初始化，无法使用全局 dialog");
  }
  return globalDialogInstance;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);
  const dialogsRef = useRef<DialogInstance[]>([]);
  const zIndexBaseRef = useRef(4000);

  // 监听浏览器前进后退，关闭弹框
  useEffect(() => {
    const handlePopstate = () => {
      dialogsRef.current.forEach((d) => {
        if (d.closeOnPopstate) {
          d.requestClose();
        }
      });
    };
    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  const updateDialogs = (updater: (prev: DialogInstance[]) => DialogInstance[]) => {
    setDialogs((prev) => {
      const next = updater(prev);
      dialogsRef.current = next;
      return next;
    });
  };

  const open = <K extends DialogType>(type: K, options: OpenDialogOptions<K> = {}): DialogInstance => {
    const { props = {} as OpenDialogOptions<K>["props"], onClose, closeOnPopstate = true, ...dialogProps } = options;

    const Component = dialogRegistry[type];
    if (!Component) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
    let requestClose: () => void;

    const instance: DialogInstance = {
      key: dialogKey,
      type,
      zIndex: Math.min(zIndexBaseRef.current++, 9999), // ✅ 限制 zIndex 最大值
      closeOnPopstate,
      content: (
        <Dialog
          key={dialogKey}
          {...dialogProps}
          closeOnPopstate={closeOnPopstate}
          _managedByProvider={true} // ✅ 由 Provider 管理，避免重复监听 popstate
          onClose={() => {
            updateDialogs((prev) => prev.filter((d) => d.key !== dialogKey));
            onClose?.();
          }}
        >
          {/* @ts-expect-error */}
          <Component {...props} onClose={() => requestClose()} />
        </Dialog>
      ),
      requestClose: () => {},
    };

    requestClose = () => {
      updateDialogs((prev) =>
        prev.map((d) => {
          if (d.key !== dialogKey) return d;
          if (React.isValidElement(d.content)) {
            // 通过 controlled open 触发退出动画
            return {
              ...d,
              content: React.cloneElement(d.content as React.ReactElement<{ open?: boolean }>, { open: false }),
            };
          }
          return d;
        }),
      );
    };
    instance.requestClose = requestClose;

    updateDialogs((prev) => [...prev, instance]);

    return instance;
  };

  const queue: DialogContextValue["queue"] = (type, options) =>
    new Promise<void>((resolve) => {
      open(type, {
        ...options,
        onClose: () => {
          options?.onClose?.();
          resolve();
        },
      });
    });

  const closeTop = () => {
    const top = dialogsRef.current[dialogsRef.current.length - 1];
    top?.requestClose();
  };

  const close = (type?: DialogType) => {
    if (type) {
      dialogsRef.current
        .filter((d) => d.type === type)
        .forEach((d) => {
          d.requestClose();
        });
    } else {
      dialogsRef.current.forEach((d) => {
        d.requestClose();
      });
    }
  };

  // 更新全局实例
  const dialogValue: DialogContextValue = { open, queue, closeTop, close };
  globalDialogInstance = dialogValue;

  // ✅ 性能优化：只在 dialogs 数组变化时重新渲染内容
  const dialogContent = useMemo(() => dialogs.map((d) => d.content), [dialogs]);

  return (
    <DialogContext.Provider value={dialogValue}>
      {children}
      {dialogContent}
    </DialogContext.Provider>
  );
};
