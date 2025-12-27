"use client";

import { useEffect } from "react";

export default function ClientInitializer() {
  useEffect(() => {
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
