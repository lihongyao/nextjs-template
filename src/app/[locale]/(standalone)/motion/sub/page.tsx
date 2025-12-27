"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";
export default function MotionPage() {
  const router = useRouter();
  const dirty = true;

  return (
    <div className="w-full h-svh bg-blue-400 flex flex-col justify-center items-center">
      <Button key={"back"} onClick={() => router.back()}>
        返回
      </Button>
    </div>
  );
}
