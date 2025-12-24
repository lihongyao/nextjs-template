"use client";
import { useRouter } from "@/i18n/navigation";
import Button from "../ui/Button";

// src/components/layout/ClassicLayout.tsx
export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <header className="h-14 flex items-center border-b px-(--card-padding) border-(--header-border-color)">
        <Button
          onClick={() => {
            router.back();
          }}
        >
          返回
        </Button>
        <h1>Classic Layout</h1>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
