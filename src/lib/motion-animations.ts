/**
 * 预定义的动效变体
 */

import type { Variants } from "motion/react";

/** PageLayout 从右到左滑动动画配置 */
export const pageLayoutSlideVariants: Variants = {
  hidden: {
    opacity: 0,
    x: "100%",
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      damping: 35,
      stiffness: 400,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: {
      duration: 0.3,
      ease: [0.32, 0, 0.67, 0],
    },
  },
};
