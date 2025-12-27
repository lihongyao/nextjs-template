"use client";

import { AnimatePresence, motion } from "motion/react";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { usePathname } from "next/navigation";
import { type ReactNode, useContext, useEffect, useRef, useState } from "react";

function FrozenRouter({ children }: { children: ReactNode }) {
  const context = useContext(LayoutRouterContext ?? {});
  const frozen = useRef(context).current;

  if (!frozen) return <>{children}</>;
  return (
    <LayoutRouterContext.Provider value={frozen}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

const PageTransitionEffect = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [prevChildren, setPrevChildren] = useState<ReactNode | null>(null);
  const [isBack, setIsBack] = useState(false);

  const prevPathRef = useRef<string | null>(null);

  // 判断 push / pop
  useEffect(() => {
    if (!prevPathRef.current) {
      prevPathRef.current = pathname;
      return;
    }
    setIsBack(
      window.history.state?.idx <
        (prevPathRef.current ? window.history.state?.idx : 0),
    );
    prevPathRef.current = pathname;
  }, [pathname]);

  // 保存上一页
  useEffect(() => {
    setPrevChildren(children);
  }, [children]);

  const variants = {
    hidden: { x: isBack ? -window.innerWidth : window.innerWidth, opacity: 1 },
    enter: { x: 0, opacity: 1 },
    exit: { x: isBack ? window.innerWidth : -window.innerWidth, opacity: 1 },
  };

  return (
    <div
      style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
    >
      {/* 底层页面 */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {isBack && prevChildren}
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={pathname}
          initial="hidden"
          animate="enter"
          exit="exit"
          variants={variants}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
        >
          <FrozenRouter>{children}</FrozenRouter>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PageTransitionEffect;
