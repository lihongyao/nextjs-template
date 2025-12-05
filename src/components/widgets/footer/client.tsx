"use client";
import { useEffect } from "react";
import type { FooterProps } from ".";

export default function Footer(props: FooterProps) {
  useEffect(() => {
    console.log("Footer data >>> ", props);
  }, [props]);
  return <footer data-name="Footer">{props?.text}</footer>;
}
