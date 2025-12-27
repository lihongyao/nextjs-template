// src/utils/cookie.ts

export interface CookieOptions {
  path?: string;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

/**
 * Cookie 工具类 —— 仅客户端使用
 *
 * 支持：
 * - 设置 cookie（encodeURIComponent）
 * - 获取 cookie（decodeURIComponent + 正则，支持 value 含 =）
 * - 删除 cookie（单个/多个/全部）
 */
export const CookieClient = {
  /**
   * 设置 cookie
   * @param key 键
   * @param value 值
   * @param expireDays 过期时间（天）
   * @param options 额外选项
   */
  set(
    key: string,
    value: string | number,
    expireDays = 1,
    options?: CookieOptions,
  ) {
    if (typeof window === "undefined") return; // SSR 忽略
    if (typeof value !== "string" && typeof value !== "number") return;

    const expires = new Date(Date.now() + expireDays * 24 * 60 * 60 * 1000);

    const parts = [
      `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      `expires=${expires.toUTCString()}`,
      `path=${options?.path ?? "/"}`,
    ];

    if (options?.secure) parts.push("Secure");
    if (options?.sameSite) parts.push(`SameSite=${options.sameSite}`);

    document.cookie = parts.join("; ");
  },

  /**
   * 获取 cookie
   * @param key 指定 key，则返回单个值，否则返回所有 cookie 对象
   */
  get(key?: string): string | Record<string, string> {
    if (typeof window === "undefined") return key ? "" : {};

    const cookieStr = document.cookie;
    if (!cookieStr) return key ? "" : {};

    const result: Record<string, string> = {};
    const regex = /(?:^|; )([^=]+)=([^;]*)/g;

    // 使用 matchAll，避免在表达式中赋值
    const matches = Array.from(cookieStr.matchAll(regex));
    matches.forEach((match) => {
      const k = decodeURIComponent(match[1]);
      const v = decodeURIComponent(match[2]);
      result[k] = v;
    });

    if (key) return result[key] ?? "";
    return result;
  },

  /**
   * 删除 cookie
   * @param key 单个 key、多个 key 或不传（删除全部）
   * @param options path/secure/sameSite
   */
  del(key?: string | string[], options?: CookieOptions) {
    if (typeof window === "undefined") return;

    const expires = new Date(0).toUTCString();

    const buildCookie = (k: string) =>
      `${encodeURIComponent(k)}=;expires=${expires};path=${options?.path ?? "/"}${options?.secure ? ";Secure" : ""}${options?.sameSite ? `;SameSite=${options.sameSite}` : ""}`;

    if (!key) {
      // 删除全部 cookie
      const keys = document.cookie
        .split(";")
        .map((c) => c.split("=")[0].trim())
        .filter(Boolean);
      keys.forEach((k) => {
        document.cookie = buildCookie(k);
      });
      return;
    }

    if (typeof key === "string") {
      document.cookie = buildCookie(key);
    } else if (Array.isArray(key)) {
      key.forEach((k) => {
        document.cookie = buildCookie(k);
      });
    }
  },
};
