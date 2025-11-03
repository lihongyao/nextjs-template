import { headers } from "next/headers";

/**
 * 判断是否在服务器环境
 */
export const isServer = () => typeof window === "undefined";

/**
 * 判断是否在客户端环境
 */
export const isClient = () => !isServer();

/**
 * 判断是否移动端
 */
export const isMobile = async (userAgent?: string) => {
  let ua = userAgent || navigator.userAgent;
  if (isServer()) {
    ua = (await headers()).get("user-agent") || "";
  }
  if (!ua) return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
};

/**
 * 判断是否 PC
 */
export const isPC = async (userAgent?: string) => !(await isMobile(userAgent));
