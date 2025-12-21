"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { usePathname } from "@/i18n/navigation";

type ScrollBehavior = "auto" | "smooth";

export interface UseScrollManagerOptions {
  /** 默认是否滚动到顶部（true: 默认页面切换滚顶，false: 默认保持滚动） */
  defaultScrollToTop?: boolean;

  /** 覆盖默认行为的页面正则数组（命中则取反默认行为） */
  overrideScrollRegex?: string[];

  /**
   * 来源感知配置
   * key: 目标页面正则
   * value: 来源页面正则数组
   * 只有从来源页面返回时才恢复滚动
   */
  restoreFrom?: Record<string, string[]>;

  /** 滚动行为 "auto" | "smooth" */
  behavior?: ScrollBehavior;

  /** 最大滚动缓存数量（超过则淘汰最旧缓存） */
  maxCacheLength?: number;

  /** 滚动阈值（px），小于此值不更新缓存） */
  threshold?: number;

  /** 恢复滚动延迟（ms），等待 DOM 渲染完成再滚动 */
  restoreDelay?: number;
}

/** 全局滚动缓存 Map */
const scrollCache = new Map<string, number>();

/** 判断是否匹配任意正则 */
function matchAny(pathname: string, regexList: RegExp[]) {
  return regexList.some((r) => r.test(pathname));
}

/** 判断是否允许 restore */
function canRestoreFrom(pathname: string, fromPath: string | null, restoreFrom: Record<string, string[]> | undefined) {
  if (!fromPath || !restoreFrom) return false;

  for (const [toPattern, fromPatterns] of Object.entries(restoreFrom)) {
    if (!new RegExp(toPattern).test(pathname)) continue;

    if (fromPatterns.some((p) => new RegExp(p).test(fromPath))) return true;
  }

  return false;
}

export function useScrollManager(options: UseScrollManagerOptions = {}) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);

  const { defaultScrollToTop = false, overrideScrollRegex = [], restoreFrom, behavior = "auto", maxCacheLength = 50, threshold = 10, restoreDelay = 0 } = options;

  /** 初始化 override 正则 */
  const overrideRegexList = useMemo(() => overrideScrollRegex.map((r) => new RegExp(r)), [overrideScrollRegex]);

  /** 离开页面 → 缓存滚动位置 */
  useEffect(() => {
    return () => {
      const prevPath = prevPathRef.current;
      if (!prevPath) return;

      const currentY = window.scrollY;
      const prevY = scrollCache.get(prevPath) ?? 0;
      if (Math.abs(currentY - prevY) < threshold) return;

      // LRU 淘汰最旧缓存
      if (!scrollCache.has(prevPath) && scrollCache.size >= maxCacheLength) {
        const firstKey = scrollCache.keys().next().value;
        if (firstKey) scrollCache.delete(firstKey);
      }

      scrollCache.set(prevPath, currentY);
    };
  }, [threshold, maxCacheLength]);

  /** 进入页面 → 决定滚动 */
  useLayoutEffect(() => {
    const fromPath = prevPathRef.current;
    const cachedY = scrollCache.get(pathname);

    // 判断是否覆盖默认行为
    const isOverride = matchAny(pathname, overrideRegexList);

    // 默认行为 + 覆盖行为
    const shouldScrollToTop = defaultScrollToTop ? !isOverride : isOverride;

    // 来源感知 restore
    const allowRestore = canRestoreFrom(pathname, fromPath, restoreFrom);

    const scrollFn = () => {
      if (allowRestore && cachedY !== undefined) {
        // 来源页面命中 restore → 恢复滚动位置
        window.scrollTo({ top: cachedY, behavior: "auto" });
      } else if (shouldScrollToTop) {
        // 来源不命中 restore → 滚顶
        window.scrollTo({ top: 0, behavior });
      }
      // 否则保持默认 Next.js App Router 行为（共享 layout 时自动保留滚动）
    };

    if (restoreDelay) {
      const t = setTimeout(scrollFn, restoreDelay);
      return () => clearTimeout(t);
    } else {
      scrollFn();
    }

    // 更新 prevPathRef，供下次判断来源
    prevPathRef.current = pathname;
  }, [pathname, defaultScrollToTop, overrideRegexList, restoreFrom, behavior, restoreDelay]);
}
