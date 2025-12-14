// src/api/apiConfig/helpers.ts

import Cookie from "js-cookie";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY } from "@/constants";

/**
 * 获取 Token
 * @returns
 */
export async function getToken() {
  if (typeof window === "undefined") {
    return getServerToken(); // SSR
  } else {
    return getClientToken(); // CSR
  }
}

/**
 * 获取 Token - 服务端
 * @returns
 */
export async function getServerToken() {
  return (await cookies()).get(ACCESS_TOKEN_KEY)?.value ?? null;
}

/**
 * 获取 Token - 客户端
 * @returns
 */
export function getClientToken() {
  try {
    return Cookie.get(ACCESS_TOKEN_KEY) ?? null;
  } catch {
    return null;
  }
}
