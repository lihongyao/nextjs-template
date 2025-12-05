// src/components/features/dialogs/index.ts
import X1Dialog from "./X1Dialog";
import X2Dialog from "./X2Dialog";

// 注册弹框组件
export const dialogRegistry = {
  X1Dialog,
  X2Dialog,
} as const;
