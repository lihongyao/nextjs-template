"use client";

import { useRouter } from "@/i18n/navigation";

export default function MinePage() {
  const router = useRouter();
  return (
    <div data-name="MinePage">
      <div>MinePage</div>
      <button onClick={() => router.push("/mine/modal-profile")}>
        个人中心
      </button>
    </div>
  );
}
