// src/proxy.ts
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * next-intl middleware
 * 只负责 locale 相关的 rewrite / redirect
 */
const intlMiddleware = createMiddleware(routing);

/**
 * modal 路由前缀
 * e.g. /user/modal-login
 */
const MODAL_PREFIX = "modal-";

export function proxy(request: NextRequest) {
  /**
   * 1️⃣ 先处理 modal rewrite（业务语义）
   *    - /user/modal-login
   *    → /user?modal=modal-login
   */
  const modalRewriteUrl = getModalRewriteUrl(request);
  if (modalRewriteUrl) {
    return NextResponse.rewrite(modalRewriteUrl);
  }

  /**
   * 2️⃣ 再交给 next-intl 统一处理语言前缀
   *    - /user
   *    → /zh/user
   */
  return intlMiddleware(request);
}

/**
 * 根据 pathname 判断是否是 modal 路由
 * 命中则返回 rewrite URL，否则返回 null
 */
function getModalRewriteUrl(request: NextRequest): URL | null {
  const { pathname } = request.nextUrl;

  /**
   * 拆分路径段
   * /zh/user/modal-login → ["zh", "user", "modal-login"]
   */
  const segments = pathname.split("/").filter(Boolean);

  /**
   * 找到 modal 段
   */
  const modalIndex = segments.findIndex((segment) => segment.startsWith(MODAL_PREFIX));

  if (modalIndex === -1) {
    return null;
  }

  /**
   * modal 名称
   * modal-login
   */
  const modal = segments[modalIndex];

  /**
   * modal 之前的路径作为 base pathname
   * ["zh", "user"]
   */
  const baseSegments = segments.slice(0, modalIndex);

  /**
   * 构造 rewrite URL
   */
  const url = request.nextUrl.clone();

  /**
   * ⚠️ 不处理 locale
   * locale 是否存在 / 是否需要补
   * 完全交给 next-intl middleware
   */
  url.pathname = baseSegments.length ? `/${baseSegments.join("/")}` : "/";

  /**
   * 通过 query 参数传递 modal 信息
   */
  url.searchParams.set("modal", modal);

  return url;
}

/**
 * middleware 匹配规则
 * - 排除 api / trpc / _next / _vercel
 * - 排除静态资源
 */
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
