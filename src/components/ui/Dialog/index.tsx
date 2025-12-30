"use client";

import { type ComponentProps, forwardRef, type ReactElement, type ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
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
  /** 弹框是否打开（受控模式） */
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

  /** 用户意图关闭（仅受控模式触发） */
  onClose?: () => void;
  /** 弹窗完全关闭后触发（任何模式） */
  onAfterClose?: () => void;

  /** 路由前进/后退时是否自动关闭 */
  closeOnPopstate?: boolean;
  /** 内部使用，标记是否由 Provider 管理，避免重复监听 popstate */
  _managedByProvider?: boolean;

  /** 内部使用：动画结束 promise */
  _afterClosePromise?: Promise<void>;
  _setAfterClosePromise?: (p: Promise<void>) => void;
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
    open,
    children,
    zIndex = 4000,
    maskClosable = true,
    autoDestroy,
    maskClassName,
    contentClassName,
    enterAnimation = "zoom-in",
    exitAnimation = "zoom-out",
    onClose,
    onAfterClose,
    closeOnPopstate = true,
    _managedByProvider = false,
    _setAfterClosePromise,
  } = props;

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open ?? true);
  const [isExiting, setIsExiting] = useState(false);

  // 是否为受控组件（通过是否显式传入 open 判断）
  const isControlled = open !== undefined;

  const dialogId = useRef(`DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`);
  const autoDestroyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 内部动画结束 promise
  // 内部动画结束 promise
  const afterCloseResolveRef = useRef<(() => void) | null>(null);
  const afterClosePromiseRef = useRef<Promise<void> | null>(null);

  useImperativeHandle(ref, () => ({
    setIsExiting: () => setIsExiting(true),
  }));

  // 初始化挂载
  useEffect(() => setMounted(true), []);

  // 创建动画结束 promise
  useEffect(() => {
    const p = new Promise<void>((resolve) => {
      afterCloseResolveRef.current = resolve;
    });
    afterClosePromiseRef.current = p;
    _setAfterClosePromise?.(p);
  }, [_setAfterClosePromise]);

  // 用户触发关闭意图（遮罩/closeDialog）
  const requestClose = () => {
    if (isControlled) {
      // 受控组件：通知调用者“用户希望关闭”，由调用者决定 open=false
      onClose?.();
    } else {
      // 非受控组件：直接执行退出动画
      setIsExiting(true);
    }
  };

  // 响应受控组件 open 状态变化
  useEffect(() => {
    if (!isControlled) return;
    if (open) {
      setVisible(true);
      setIsExiting(false);
    } else if (visible) {
      setIsExiting(true); // 受控组件 open=false，触发动画
    }
  }, [open, isControlled, visible]);

  // 自动销毁逻辑（系统关闭）
  useEffect(() => {
    if (!autoDestroy || !visible) return;

    autoDestroyTimer.current = setTimeout(() => {
      setIsExiting(true);
    }, autoDestroy * 1000);

    return () => {
      if (autoDestroyTimer.current) {
        clearTimeout(autoDestroyTimer.current);
        autoDestroyTimer.current = null;
      }
    };
  }, [autoDestroy, visible]);

  // 点击遮罩关闭（用户意图）
  const handleMaskClick = () => {
    if (!maskClosable) return;
    requestClose();
  };

  // 动画结束处理（唯一 onAfterClose 出口）
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isExiting) return;

    setVisible(false);
    setIsExiting(false);

    visibleDialogs.delete(dialogId.current);
    unlockBodyScroll();

    onAfterClose?.();
    afterCloseResolveRef.current?.(); // 动画结束时 resolve promise
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

  // popstate 关闭（系统关闭）
  useEffect(() => {
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
  open: (options: DialogStaticOptions) => { key: string; close: () => Promise<void> };
  close: (key?: string) => Promise<void>;
};

// === 静态方法管理 ===

type DialogStaticOptions = Omit<DialogProps, "open" | "children" | "onClose"> & {
  content: ReactNode;
};

type DialogEntry = {
  root: Root;
  container: HTMLDivElement;
  key: string;
  closeDialog: () => void;
  promise?: Promise<void>;
  resolve?: () => void;
};

let dialogZIndex = 4000;
const dialogMap = new Map<string, DialogEntry>();

Dialog.open = (options: DialogStaticOptions) => {
  const key = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  let resolveFn: () => void;
  const promise = new Promise<void>((resolve) => {
    resolveFn = resolve;
  });

  const dialogRef: { current: DialogRef | null } = { current: null };

  const closeDialog = () => {
    dialogRef.current?.setIsExiting();
  };

  root.render(
    <DialogComponent
      ref={dialogRef}
      maskClosable={options.maskClosable}
      autoDestroy={options.autoDestroy}
      contentClassName={options.contentClassName}
      maskClassName={options.maskClassName}
      zIndex={options.zIndex ?? dialogZIndex++}
      _managedByProvider
      _setAfterClosePromise={(p) => {
        p.then(() => resolveFn?.());
      }}
      onAfterClose={() => {
        root.unmount();
        container.remove();
        dialogMap.delete(key);
        options.onAfterClose?.();
      }}
    >
      {options.content}
    </DialogComponent>,
  );

  dialogMap.set(key, { root, container, key, closeDialog, promise, resolve: resolveFn! });

  return { key, close: () => dialogMap.get(key)?.promise ?? Promise.resolve() };
};

Dialog.close = async (key?: string) => {
  if (key) {
    const entry = dialogMap.get(key);
    if (!entry) return;
    entry.closeDialog();
    return entry.promise;
  } else {
    const promises: Promise<void>[] = [];
    dialogMap.forEach((entry) => {
      entry.closeDialog();
      if (entry.promise) promises.push(entry.promise);
    });
    return Promise.all(promises).then(() => {});
  }
};

// === Provider + useDialog ===

export type DialogType = keyof typeof dialogRegistry;
type DialogComponentProps<K extends DialogType> = Partial<React.ComponentProps<(typeof dialogRegistry)[K]>>;

export type OpenDialogOptions<K extends DialogType = DialogType> = Omit<DialogProps, "open" | "children" | "onClose"> & {
  props?:
    | Partial<React.ComponentProps<(typeof dialogRegistry)[K]>>
    | ((prev: Partial<React.ComponentProps<(typeof dialogRegistry)[K]>> | null) => Partial<React.ComponentProps<(typeof dialogRegistry)[K]>>);
};

type DialogInstance<K extends DialogType = DialogType> = {
  key: string;
  type: K;
  zIndex: number;
  closeOnPopstate: boolean;
  props: DialogComponentProps<K>;
  content: ReactNode;
  requestClose: () => void;
  updateProps: (updater: DialogComponentProps<K> | ((prev: DialogComponentProps<K> | null) => DialogComponentProps<K>)) => void;
  /** 内部字段：存储最新的 onAfterClose 回调 */
  _onAfterClose?: () => void;
  /** 内部字段：动画结束 promise */
  _afterClosePromise?: Promise<void>;
};

type DialogContextValue = {
  open: <K extends DialogType>(type: K, options?: OpenDialogOptions<K>) => DialogInstance<K>;
  queue: <K extends DialogType>(type: K, options?: OpenDialogOptions<K>) => Promise<void>;
  updateProps: <K extends DialogType>(type: K, updater: DialogComponentProps<K> | ((prev: DialogComponentProps<K> | null) => DialogComponentProps<K>)) => void;
  closeTop: () => void;
  close: (type?: DialogType) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialogContext must be used within DialogProvider");
  return ctx;
};

// 全局 dialog 实例
let globalDialogInstance: DialogContextValue | null = null;
export const getGlobalDialog = (): DialogContextValue => {
  if (!globalDialogInstance) {
    throw new Error("DialogProvider 尚未初始化，无法使用全局 dialog");
  }
  return globalDialogInstance;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInstance<DialogType>[]>([]);
  const dialogsRef = useRef<DialogInstance<DialogType>[]>([]);
  const zIndexBaseRef = useRef(4000);

  // popstate（系统关闭）
  useEffect(() => {
    const handlePopstate = () => {
      dialogsRef.current.forEach((d) => {
        if (d.closeOnPopstate) d.requestClose();
      });
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  const updateDialogs = (updater: (prev: DialogInstance[]) => DialogInstance[]) => {
    setDialogs((prev) => {
      const next = updater(prev);
      dialogsRef.current = next;
      return next;
    });
  };

  const open = <K extends DialogType>(type: K, options: OpenDialogOptions<K> = {}): DialogInstance<K> => {
    const { props = {}, onAfterClose, closeOnPopstate = true, ...dialogProps } = options;

    const existing = dialogsRef.current.find((d) => d.type === type);
    if (!dialogProps.multiple && existing) {
      // 如果已存在实例且 multiple=false，直接更新 props
      existing.updateProps(props ?? {});
      // 更新 onAfterClose 回调
      existing._onAfterClose = onAfterClose;
      return existing as unknown as DialogInstance<K>;
    }

    const Component = dialogRegistry[type];
    if (!Component) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
    let requestClose: () => void;

    // 创建实例
    const instance: DialogInstance<K> & { _onAfterClose?: () => void } = {
      key: dialogKey,
      type,
      props: props ?? {},
      zIndex: Math.min(zIndexBaseRef.current++, 9999),
      closeOnPopstate,
      content: null,
      requestClose: () => {},
      updateProps: () => {},
      _onAfterClose: onAfterClose,
    };

    requestClose = () => {
      updateDialogs((prev) =>
        prev.map((d) =>
          d.key === dialogKey && React.isValidElement(d.content)
            ? { ...d, content: React.cloneElement(d.content as React.ReactElement<{ open?: boolean; _setAfterClosePromise?: (p: Promise<void>) => void }>, { open: false }) }
            : d,
        ),
      );
    };
    instance.requestClose = requestClose;

    // 非受控模式渲染 Dialog
    instance.content = (
      <Dialog
        key={dialogKey}
        {...dialogProps}
        closeOnPopstate={closeOnPopstate}
        _managedByProvider
        _setAfterClosePromise={(p) => {
          instance._afterClosePromise = p;
        }}
        onAfterClose={() => {
          updateDialogs((prev) => prev.filter((d) => d.key !== dialogKey));
          // ✅ 触发最新的 onAfterClose
          instance._onAfterClose?.();
        }}
      >
        {/* 子组件调用 closeDialog 可以主动关闭 */}
        {/* @ts-expect-error */}
        <Component {...(props ?? {})} closeDialog={() => requestClose()} />
      </Dialog>
    );
    // updateProps 方法
    instance.updateProps = (updater) => {
      updateDialogs((prev) =>
        prev.map((d) => {
          if (d.key !== dialogKey) return d;

          type PropsOf<K extends DialogType> = ComponentProps<(typeof dialogRegistry)[K]>;
          const prevProps = d.props as PropsOf<K> | null;
          const nextProps: Partial<PropsOf<K>> = typeof updater === "function" ? updater(prevProps ?? {}) : { ...(prevProps ?? {}), ...updater };

          if (!React.isValidElement(d.content)) return d;

          const parent = d.content;
          const child = (parent.props as { children: ReactElement<{ props: object }> }).children;
          if (!React.isValidElement(child)) return d;

          return {
            ...d,
            props: nextProps,
            content: React.cloneElement(parent, {}, React.cloneElement(child, { ...child.props, ...nextProps })),
          };
        }),
      );
    };

    updateDialogs((prev) => [...prev, instance as unknown as DialogInstance<DialogType>]);

    return instance;
  };

  const queue: DialogContextValue["queue"] = (type, options) =>
    new Promise<void>((resolve) => {
      open(type, {
        ...options,
        onAfterClose: () => {
          options?.onAfterClose?.();
          resolve();
        },
      });
    });

  const closeTop = () => dialogsRef.current.at(-1)?.requestClose();

  const close = async (type?: DialogType) => {
    const promises: Promise<void>[] = [];
    dialogsRef.current
      .filter((d) => !type || d.type === type)
      .forEach((d) => {
        d.requestClose();
        const p = d._afterClosePromise as Promise<void>;
        if (p) promises.push(p);
      });
    await Promise.all(promises);
  };

  const updateProps = <K extends DialogType>(type: K, updater: DialogComponentProps<K> | ((prev: DialogComponentProps<K> | null) => DialogComponentProps<K>)) => {
    const dialog = dialogsRef.current.find((d) => d.type === type) as DialogInstance<K> | undefined;
    dialog?.updateProps(updater);
  };

  const dialogValue: DialogContextValue = { open, queue, closeTop, close, updateProps };
  globalDialogInstance = dialogValue;

  const dialogContent = useMemo(() => dialogs.map((d) => d.content), [dialogs]);

  return (
    <DialogContext.Provider value={dialogValue}>
      {children}
      {dialogContent}
    </DialogContext.Provider>
  );
};
