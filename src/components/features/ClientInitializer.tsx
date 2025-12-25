"use client";

import { useEffect } from "react";

export default function ClientInitializer() {
  useEffect(() => {
    console.log("绑定时间");
    // old page
    window.addEventListener("pageswap", (event) => {
      console.log(event);
    });

    // new page
    window.addEventListener("pagereveal", (event) => {
      console.log(event);
    });
  }, []);
  return null;
}
