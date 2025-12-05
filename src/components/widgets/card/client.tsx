"use client";
import { useEffect } from "react";
import type { CardProps } from ".";

export default function Card(props: CardProps) {
  useEffect(() => {
    console.log("Card data >>> ", props);
  }, [props]);

  return (
    <div data-name="Card">
      <h3>{props?.name}</h3>
      <ul>
        {props?.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
