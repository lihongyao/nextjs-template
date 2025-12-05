"use client";
import { useEffect, useState } from "react";
import type { BannerProps } from ".";

export default function Banner(props: BannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log("Banner data >>> ", props);
    setTimeout(() => setVisible(true), 1000);
  }, [props]);

  if (!visible) return <div style={{ height: 24 * 4 }}></div>;

  return (
    <div data-name="Banner">
      <h2>{props?.title}</h2>
      <ul>
        {props?.banners.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
