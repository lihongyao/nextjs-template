// src/app/[lang]/_components/Counter.tsx
"use client";
import { useGlobalStore } from "@/stores/globalStore";

export default function Counter() {
  const { count, increment, decrement } = useGlobalStore((state) => state);
  return (
    <div>
      <div>计数器：{count}</div>
      <div className="flex items-center gap-4">
        <button className="cursor-pointer w-[100px] h-[30px] bg-green-600 text-white flex justify-center items-center rounded-sm" type="button" onClick={increment}>
          +1
        </button>
        <button className="cursor-pointer w-[100px] h-[30px] bg-green-600 text-white flex justify-center items-center rounded-sm" type="button" onClick={decrement}>
          -1
        </button>
      </div>
    </div>
  );
}
