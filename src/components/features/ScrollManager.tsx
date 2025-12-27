"use client";

import {
  type UseScrollManagerOptions,
  useScrollManager,
} from "@/hooks/useScrollManager";

export default function ScrollManager(props: UseScrollManagerOptions) {
  useScrollManager(props);
  return null;
}
