import React from "react";

import { Dialog } from "@/components/ui/Dialog";
import X1Dialog from "./X1Dialog";
import X2Dialog from "./X2Dialog";

export enum DialogType {
  X1Dialog = "X1Dialog",
  X2Dialog = "X2Dialog",
}
export const dialogRegistry = {
  [DialogType.X1Dialog]: X1Dialog,
  [DialogType.X2Dialog]: X2Dialog,
} as const;

// -- 根据 registry 自动推导 DialogType
type DialogRegistry = typeof dialogRegistry;

// =========================
// 全局堆栈管理
// =========================
type DialogStackItem = {
  type: DialogType;
  close: () => void;
  zIndex: number;
};
const dialogStack: DialogStackItem[] = [];

// =========================
// API.openDialog - 显示弹框
// =========================
export type OpenDialogOptions<K extends DialogType = DialogType> = {
  props?: Partial<React.ComponentProps<DialogRegistry[K]>>;
  maskClosable?: boolean;
  autoDestroy?: number;
  maskClassName?: string;
  contentClassName?: string;
  onClose?: () => void;
};

export function openDialog<K extends DialogType>(type: K, options: OpenDialogOptions<K> = {}) {
  const { props = {} as OpenDialogOptions<K>["props"], maskClosable = true, autoDestroy, maskClassName, contentClassName, onClose } = options;

  const Component = dialogRegistry[type];
  if (!Component) throw new Error(`Dialog "${type}" is not registered`);

  const instance = Dialog.show({
    children: React.createElement(Component, {
      ...props,
      onClose: () => instance.close(),
    }),
    maskClosable,
    autoDestroy,
    maskClassName,
    contentClassName,
    onClose,
  });

  dialogStack.push({
    type,
    close: instance.close,
    zIndex: instance.zIndex,
  });

  return instance;
}

// =========================
// API.queueDialog - 队列弹框
// =========================
type QueueItem<K extends DialogType> = {
  type: K;
  options?: OpenDialogOptions<K>;
  resolve: () => void;
};
const dialogQueue: QueueItem<DialogType>[] = [];
let isProcessingQueue = false;

function processQueue() {
  if (isProcessingQueue) return;
  const next = dialogQueue.shift();
  if (!next) return;

  isProcessingQueue = true;

  openDialog(next.type, {
    ...next.options,
    onClose: () => {
      next.options?.onClose?.();
      next.resolve();
      isProcessingQueue = false;
      processQueue();
    },
  });
}

/**
 * 队列弹框
 * @param type 弹框类型
 * @param options openDialog 参数
 * @param onClose 弹框关闭时的回调
 */
export function queueDialog<K extends DialogType>(type: K, options: OpenDialogOptions<K> = {}) {
  return new Promise<void>((resolve) => {
    dialogQueue.push({ type, options, resolve });
    processQueue();
  });
}

// =========================
// API.closeDialog - 按类型关闭
// =========================
export function closeDialog(type?: DialogType) {
  if (type) {
    for (let i = dialogStack.length - 1; i >= 0; i--) {
      if (dialogStack[i].type === type) {
        dialogStack[i].close();
        dialogStack.splice(i, 1);
        break;
      }
    }
  } else {
    while (dialogStack.length) {
      dialogStack.pop()?.close();
    }
  }
}

// =========================
// API.closeTop - 关闭栈顶
// =========================
export function closeTop() {
  dialogStack.pop()?.close();
}
