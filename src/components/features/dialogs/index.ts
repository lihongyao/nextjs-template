// src/components/features/dialogs/index.ts
import X1Dialog from "./X1Dialog";
import X2Dialog from "./X2Dialog";
import X3Dialog from "./X3Dialog";

// 注册弹框组件
export const dialogRegistry = {
  X1Dialog,
  X2Dialog,
  X3Dialog,
} as const;
