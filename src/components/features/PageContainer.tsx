"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function MotionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isBack, setIsBack] = useState(false);

  useEffect(() => {
    // 如果 pathname 是 motion，就说明是返回
    setIsBack(pathname === "/motion");
  }, [pathname]);

  return (
    <div className={isBack ? "back-transition" : "forward-transition"}>
      {children}
    </div>
  );
}
