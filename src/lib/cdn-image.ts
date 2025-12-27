// src/lib/cdn-image.ts
/**
 * 🔥 使用 Cloudflare CDN 对图片进行统一处理
 * @see https://developers.cloudflare.com/images/transform-images/transform-via-url
 */

// === 类型定义 ===
interface CdnImageParts {
  /** 域名，例如 https://img.engames.com */
  origin: string;
  /** CDN 固定前缀，例如 /cdn-cgi/image */
  prefix: string;
  /** 图片处理选项，例如 /format=auto,q=80,dpr=2,w=100 */
  options: string;
  /** 源图片路径，例如 /afunbet/1757677181247956857.jpeg */
  path: string;
}

interface CdnImageOptions {
  format?: string;
  q?: number;
  dpr?: number;
  w?: number | string;
  h?: number | string;
  fit?: string;
  [key: string]: string | number | undefined;
}
// === 常量定义 ===
const CDN_PREFIX = "/cdn-cgi/image";
const ResConfig = {
  rootAddress: "https://img.engames.com",
};

/**
 * 获取 CDN 图片地址（SSR / CSR 通用）
 * @param path 图片路径(svn相对路径 or 完整地址)
 * @param options 选项参数
 * - options.userAgent 服务端渲染时传入 ua，用于判断设备类型
 * - options.imageOptions 图片处理选项，参数优化时会用到，理论上，只需要给宽度即可，高度会自适应
 * @returns
 */
export function getCdnImageUrl(
  path: string,
  options?: {
    userAgent?: string | null;
    imageOptions?: {
      q?: number;
      w?: number | string;
      h?: number | string;
    };
  },
) {
  if (!path?.trim()) return "";

  const { userAgent = "", imageOptions = {} } = options || {};

  const isHttp = /^http/.test(path);
  const seriesName = process.env.NEXT_PUBLIC_SERIES;

  const ua = typeof navigator !== "undefined" ? navigator.userAgent : userAgent || "";

  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  // DPR 策略：iOS 3x / Android 2x / Desktop 1x
  const dpr = isIOS ? 3 : isAndroid ? 2 : 1;

  // 构建基础 URL
  // FIXME: 临时处理
  const baseUrl = isHttp ? path : `${ResConfig.rootAddress}/cdn-cgi/image/format=auto/s_static_x/${seriesName}/${path}`;

  const parts = parseCdnImageUrl(baseUrl);
  if (!parts) return baseUrl;

  const { q = 80, w = "auto", h = "auto" } = imageOptions;

  const finalW = isIOS || isAndroid ? w : "auto";
  const finalH = isIOS || isAndroid ? h : "auto";

  return updateCdnImageOptions(baseUrl, {
    format: "auto",
    q,
    dpr,
    w: finalW,
    h: finalH,
  });
}

// === 工具函数 ===
function parseCdnImageUrl(url: string): CdnImageParts | null {
  if (!url.includes(CDN_PREFIX)) return null;

  const u = new URL(url);
  const pathname = u.pathname;

  const rest = pathname.slice(CDN_PREFIX.length);
  const segments = rest.split("/").filter(Boolean);

  let options = "";
  let path = "";

  // 约定：options 只能占用一个 segment，用逗号分隔
  if (/^[^/]+=/.test(segments[0] ?? "")) {
    options = `/${segments[0]}`;
    path = `/${segments.slice(1).join("/")}`;
  } else {
    path = `/${segments.join("/")}`;
  }

  return {
    origin: u.origin,
    prefix: CDN_PREFIX,
    options,
    path,
  };
}

function parseOptions(raw: string): CdnImageOptions {
  if (!raw) return {};

  return raw
    .replace(/^\//, "")
    .split(",")
    .filter(Boolean)
    .reduce((acc, cur) => {
      const [key, value] = cur.split("=");
      if (!key || value == null) return acc;

      // 数值参数自动转 number
      if (/^\d+(\.\d+)?$/.test(value)) {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }

      return acc;
    }, {} as CdnImageOptions);
}

export function updateCdnImageOptions(url: string, newOptions: CdnImageOptions): string {
  const parts = parseCdnImageUrl(url);
  if (!parts) return url;

  const current = parseOptions(parts.options);
  const merged = { ...current, ...newOptions };

  parts.options =
    "/" +
    Object.entries(merged)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${v}`)
      .join(",");

  return buildCdnImageUrl(parts);
}

function buildCdnImageUrl(parts: CdnImageParts): string {
  return `${parts.origin}${parts.prefix}${parts.options}${parts.path}`;
}
