"use client";

import { type ReactNode, useEffect, useState } from "react";

type ClientOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export const ClientOnly = (props: ClientOnlyProps) => {
  const { children, fallback = null } = props;

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return fallback;
  }

  return children;
};
