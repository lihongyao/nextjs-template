"use client";

import Button from "@/components/ui/Button";
import { useRouter } from "@/i18n/navigation";

export default function DialogPage() {
  const router = useRouter();
  return (
    <div>
      <Button
        onClick={() => {
          router.push("modal-profile");
        }}
      >
        路由弹框 modal-profile
      </Button>
    </div>
  );
}
