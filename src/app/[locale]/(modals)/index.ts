// src/app/[lang]/(modals)/index.ts
import type { ComponentType } from "react";
import type { ModalComponentProps } from "@/components/features/RouteModalRenderer";
import Profile from "./Profile";

export const ModalComponents: Record<string, ComponentType<ModalComponentProps>> = {
  "modal-profile": Profile,
};
