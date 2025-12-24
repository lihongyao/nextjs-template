"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const overlayVariants = {
  hidden: { opacity: 0, x: "100%" }, // 右侧初始
  visible: { opacity: 1, x: 0 }, // 覆盖显示
  exit: { opacity: 0, x: "100%" }, // 向右滑出 + 淡出
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <AnimatePresence mode="popLayout">
      {" "}
      {/* 🔹 并行动画 */}
      <motion.div
        key={key}
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{
          type: "tween",
          ease: "easeInOut",
          duration: 0.35,
        }}
        style={{
          position: "absolute", // 叠加在父页面上
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          willChange: "transform, opacity",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
