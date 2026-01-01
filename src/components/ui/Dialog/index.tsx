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

// === 全局 Dialog 基础 ===

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
  /** 内部使用：实例动画结束 promise */
  _afterClosePromise?: Promise<void>;
  /** 内部使用：设置动画结束 promise */
  _setAfterClosePromise?: (p: Promise<void>) => void;
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

  // 是否为受控组件
  const isControlled = open !== undefined;

  // states
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(open ?? true);
  const [isExiting, setIsExiting] = useState(false);

  // refs
  const dialogId = useRef(`DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`);
  const autoDestroyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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
      onClose?.();
    } else {
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
      setIsExiting(true);
    }
  }, [open, isControlled, visible]);

  // 自动销毁逻辑
  useEffect(() => {
    if (!autoDestroy || !visible) return;
    autoDestroyTimer.current = setTimeout(() => setIsExiting(true), autoDestroy * 1000);
    return () => {
      if (autoDestroyTimer.current) clearTimeout(autoDestroyTimer.current);
      autoDestroyTimer.current = null;
    };
  }, [autoDestroy, visible]);

  // 点击遮罩关闭
  const handleMaskClick = () => {
    if (!maskClosable) return;
    requestClose();
  };

  // 动画结束处理
  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.target !== e.currentTarget) return;
    if (!isExiting) return;

    setVisible(false);
    setIsExiting(false);

    visibleDialogs.delete(dialogId.current);
    unlockBodyScroll();

    onAfterClose?.();
    afterCloseResolveRef.current?.();
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

  // popstate 关闭
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

  const closeDialog = () => dialogRef.current?.setIsExiting();

  root.render(
    <DialogComponent
      ref={dialogRef}
      maskClosable={options.maskClosable}
      autoDestroy={options.autoDestroy}
      contentClassName={options.contentClassName}
      maskClassName={options.maskClassName}
      zIndex={options.zIndex ?? dialogZIndex++}
      _managedByProvider
      _setAfterClosePromise={(p) => p.then(() => resolveFn?.())}
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
/** 弹框类型 */
export type DialogType = keyof typeof dialogRegistry;
/** 弹框内容组件 Props */
type PropsOf<K extends DialogType> = ComponentProps<(typeof dialogRegistry)[K]>;
/** 构造 dialog.open options */
type OpenDialogOmitProps = "open" | "children" | "onClose" | "_managedByProvider" | "_afterClosePromise" | "_setAfterClosePromise";
type OpenDialogTypeOptions = Omit<DialogProps, OpenDialogOmitProps>;

/** 弹框实例 */
export type DialogInstance<K extends DialogType = DialogType> = {
  key: string;
  type: K;
  zIndex: number;
  closeOnPopstate: boolean;
  props: PropsOf<K>;
  content: ReactNode;
  requestClose: () => void;
  updateProps: (updater: PropsOf<K> | ((prev: PropsOf<K> | null) => PropsOf<K>)) => void;
  /** 内部字段：存储最新的 onAfterClose 回调 */
  _onAfterClose?: () => void;
  /** 内部字段：动画结束 promise */
  _afterClosePromise?: Promise<void>;
};

/** DialogContext */
export type DialogContextValue = {
  open: <K extends DialogType>(
    type: K,
    ...args: keyof PropsOf<K> extends never
      ? [options?: OpenDialogTypeOptions & { props?: PropsOf<K> }]
      : [options: OpenDialogTypeOptions & { props: PropsOf<K> | ((prev: PropsOf<K> | null) => PropsOf<K>) }]
  ) => DialogInstance;

  queue: <K extends DialogType>(
    type: K,
    ...args: keyof PropsOf<K> extends never ? [options?: OpenDialogTypeOptions & { props?: PropsOf<K> }] : [options: OpenDialogTypeOptions & { props: PropsOf<K> }]
  ) => Promise<void>;

  updateProps: <K extends DialogType>(type: K, updater: PropsOf<K> | ((prev: PropsOf<K> | null) => PropsOf<K>)) => void;

  closeTop: () => void;
  close: (type?: DialogType) => Promise<void>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

/** Hook 使用 */
export const useDialog = () => {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialogContext must be used within DialogProvider");
  return ctx;
};

// 全局 dialog 实例
let globalDialogInstance: DialogContextValue | null = null;
export const getGlobalDialog = () => {
  if (!globalDialogInstance) {
    throw new Error("DialogProvider 尚未初始化，无法使用全局 dialog");
  }
  return globalDialogInstance;
};

/** DialogProvider */
export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);
  const dialogsRef = useRef<DialogInstance[]>([]);
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

  // 更新 dialogs 数组
  const updateDialogs = (updater: (prev: DialogInstance<DialogType>[]) => DialogInstance<DialogType>[]) => {
    setDialogs((prev) => {
      const next = updater(prev);
      dialogsRef.current = next;
      return next;
    });
  };

  /** open 方法 */
  function open<K extends DialogType>(
    type: K,
    ...args: keyof PropsOf<K> extends never ? [options?: OpenDialogTypeOptions & { props?: PropsOf<K> }] : [options: OpenDialogTypeOptions & { props: PropsOf<K> }]
  ): DialogInstance<K> {
    const options = args[0] ?? {};
    const { props, onAfterClose, closeOnPopstate = true, ...dialogProps } = options;

    // 检查已存在实例
    const existing = dialogsRef.current.find((d) => d.type === type);
    if (!dialogProps.multiple && existing) {
      existing.updateProps(props);
      existing._onAfterClose = onAfterClose;
      return existing as unknown as DialogInstance<K>;
    }

    const Component = dialogRegistry[type];
    if (!Component) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;

    const instance: DialogInstance<typeof type> & { _onAfterClose?: () => void } = {
      key: dialogKey,
      type,
      props: props as PropsOf<typeof type>,
      zIndex: Math.min(zIndexBaseRef.current++, 9999),
      closeOnPopstate,
      content: null,
      requestClose: () => {},
      updateProps: () => {},
      _onAfterClose: onAfterClose,
    };

    // requestClose 实现
    instance.requestClose = () => {
      updateDialogs((prev) =>
        prev.map((d) => (d.key === dialogKey && React.isValidElement(d.content) ? { ...d, content: React.cloneElement(d.content as ReactElement<{ open?: boolean }>, { open: false }) } : d)),
      );
    };

    // 渲染 Dialog
    const element = (() => {
      const Comp = Component as React.ComponentType<unknown>;
      // 有 props
      if (props != null) {
        return <Comp {...props} />;
      }
      // 无 props
      return <Comp />;
    })();
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
          instance._onAfterClose?.();
        }}
      >
        {element}
      </Dialog>
    );

    // updateProps 方法
    instance.updateProps = (updater) => {
      updateDialogs((prev) =>
        prev.map((d) => {
          if (d.key !== dialogKey) return d;

          const prevProps = d.props as PropsOf<typeof type>;
          const nextProps = typeof updater === "function" ? (updater as (p: PropsOf<typeof type>) => void)(prevProps) : Object.assign({}, prevProps, updater);

          if (!React.isValidElement(d.content)) return { ...d, props: nextProps };

          const parent = d.content as ReactElement<{ children: ReactElement }>;
          const child = parent.props.children;

          if (!React.isValidElement(child)) return { ...d, props: nextProps };

          return {
            ...d,
            props: nextProps,
            content: React.cloneElement(parent, {}, React.cloneElement(child, Object.assign({}, child.props, nextProps))),
          };
        }),
      );
    };

    updateDialogs((prev) => [...prev, instance as DialogInstance<DialogType>]);

    return instance;
  }

  /** queue 方法 */
  const queue = async (type: DialogType, options?: OpenDialogTypeOptions & { props?: PropsOf<DialogType> }) => {
    return new Promise<void>((resolve) => {
      open(type, {
        ...options,
        onAfterClose() {
          options?.onAfterClose?.();
          resolve();
        },
      });
    });
  };

  /** closeTop */
  const closeTop = () => dialogsRef.current.at(-1)?.requestClose();

  /** close */
  const close = async (type?: DialogType) => {
    const promises: Promise<void>[] = [];
    dialogsRef.current
      .filter((d) => !type || d.type === type)
      .forEach((d) => {
        d.requestClose();
        if (d._afterClosePromise) promises.push(d._afterClosePromise);
      });
    await Promise.all(promises);
  };

  /** updateProps */
  const updateProps = <K extends DialogType>(type: K, updater: PropsOf<K> | ((prev: PropsOf<K> | null) => PropsOf<K>)) => {
    const dialog = dialogsRef.current.find((d) => d.type === type) as DialogInstance<K> | undefined;
    dialog?.updateProps(updater);
  };

  // @ts-expect-error
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
