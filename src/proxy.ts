// src/proxy.ts
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// -- 路由前缀
const MODAL_PREFIX = "modal-";

export function proxy(request: NextRequest) {
  // 1️⃣ 先处理国际化
  const intlResponse = intlMiddleware(request);
  // 2️⃣ modal rewrite
  const rewriteTarget = modalRewriteUrl(request);
  if (rewriteTarget) {
    intlResponse.headers.set("x-middleware-rewrite", rewriteTarget.toString());
  }

  return intlResponse;
}

function modalRewriteUrl(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.includes(MODAL_PREFIX)) {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);
  const modalIndex = segments.findIndex((segment) => segment.startsWith(MODAL_PREFIX));
  if (modalIndex === -1) {
    return null;
  }

  const modalPathname = segments[modalIndex];
  const basePaths = segments.slice(0, modalIndex);

  const locales = routing.locales;
  const defaultLocale = routing.defaultLocale;

  // 检查路径是否包含语言前缀，则加上默认语言
  const hasLocalePrefix = basePaths.length > 0 && locales.includes(basePaths[0]);
  if (!hasLocalePrefix) {
    basePaths.unshift(defaultLocale);
  }

  const basePath = `/${basePaths.join("/")}`;
  // 克隆请求的URL对象，在其基础上修改
  const rewriteUrl = request.nextUrl.clone();
  // 设置基础路径，确保没有多余的斜杠
  rewriteUrl.pathname = basePath.replace(/\/{2,}/g, "/");

  const nextParams = new URLSearchParams(searchParams.toString());
  // 添加或覆盖 modal 参数（例如 "?modal=modal-login"）
  nextParams.set("modal", modalPathname);
  // 将查询参数赋值给 URL
  rewriteUrl.search = nextParams.toString() ? `?${nextParams.toString()}` : "";
  // 返回新的 URL（Next.js 会用它来执行 rewrite）
  console.log("rewriteUrl >>> ", rewriteUrl);
  return rewriteUrl;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
