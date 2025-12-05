// src/providers/dialog.provider.tsx
"use client";

import React, { createContext, type ReactNode, useContext, useRef, useState } from "react";
import { dialogRegistry } from "@/components/features/dialogs";
import { Dialog } from "@/components/ui/Dialog";

export type DialogType = keyof typeof dialogRegistry;

export type OpenDialogOptions<K extends DialogType = DialogType> = {
  props?: Partial<React.ComponentProps<(typeof dialogRegistry)[K]>>;
  maskClosable?: boolean;
  autoDestroy?: number;
  maskClassName?: string;
  contentClassName?: string;
  onClose?: () => void;
};

type DialogInstance = {
  key: string;
  type: DialogType;
  content: ReactNode;
  zIndex: number;
  requestClose: () => void;
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

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);
  const dialogsRef = useRef<DialogInstance[]>([]);
  let zIndexBase = 4000;

  const updateDialogs = (updater: (prev: DialogInstance[]) => DialogInstance[]) => {
    setDialogs((prev) => {
      const next = updater(prev);
      dialogsRef.current = next;
      return next;
    });
  };

  const open = <K extends DialogType>(type: K, options: OpenDialogOptions<K> = {}): DialogInstance => {
    const { props = {} as OpenDialogOptions<K>["props"], maskClosable = true, autoDestroy, maskClassName, contentClassName, onClose } = options;
    const Component = dialogRegistry[type];
    if (!Component) throw new Error(`Dialog "${type}" is not registered`);

    const dialogKey = `DIALOG_${Math.random().toString(36).slice(2).toUpperCase()}`;
    let requestClose: () => void;

    const instance: DialogInstance = {
      key: dialogKey,
      type,
      zIndex: zIndexBase++,
      content: (
        <Dialog
          key={dialogKey}
          maskClosable={maskClosable}
          autoDestroy={autoDestroy}
          maskClassName={maskClassName}
          contentClassName={contentClassName}
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
      // 关闭指定类型
      dialogsRef.current
        .filter((d) => d.type === type)
        .forEach((d) => {
          d.requestClose();
        });
    } else {
      // 关闭全部
      dialogsRef.current.forEach((d) => {
        d.requestClose();
      });
    }
  };
  return (
    <DialogContext.Provider value={{ open, queue, closeTop, close }}>
      {children}
      {dialogs.map((d) => d.content)}
    </DialogContext.Provider>
  );
};
