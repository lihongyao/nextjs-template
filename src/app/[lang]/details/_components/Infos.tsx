"use client";
import { useGlobalStore } from "@/stores/globalStore";

export default function Infos() {
  const count = useGlobalStore((state) => state.count);
  return <div>当前计数：{count}</div>;
}
