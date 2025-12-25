"use client";
import { useTransitionRouter } from "next-view-transitions";
import Button from "@/components/ui/Button";

export default function MotionPage() {
  const router = useTransitionRouter();
  return (
    <div className="w-full h-svh bg-blue-400 flex flex-col justify-center items-center">
      <Button key={"back"} onClick={() => router.back()}>
        返回
      </Button>
    </div>
  );
}
