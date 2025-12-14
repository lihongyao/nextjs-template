// src/app/[lang]/(modals)/Profile.tsx
"use client";
import type { ModalComponentProps } from "@/components/features/RouteModalRenderer";

export default function Profile({ onCloseAction }: ModalComponentProps) {
  return (
    <div data-name="Profile" className="w-[300px] h-[100px] bg-white rounded-lg flex justify-center items-center flex-col gap-2">
      <div>个人中心</div>
      <button onClick={onCloseAction}>关闭</button>
    </div>
  );
}
