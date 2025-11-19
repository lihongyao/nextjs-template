// src/app/[lang]/_components/Card.tsx

import Image from "next/image";
import { getBrandConfigSSR } from "@/libs/brand";
import { getImgUrl } from "@/libs/utils";
import ClientInfo from "./ClientInfo";
import ServerInfo from "./ServerInfo";

export default async function Card() {
  const brand = await getBrandConfigSSR();
  return (
    <div className="flex gap-4 border border-(--card-border-color)  rounded-(--card-radius) p-(--card-padding) bg-(--card-bg) text-(--card-text)">
      <Image width={300} height={200} src={getImgUrl(brand, "banner.jpg")} alt="banner" priority />
      <div className="space-y-4">
        <p>Example card. Colors and radius come from theme/skin tokens.</p>
        <button type="button" className="px-4 py-2 inline-block text-sm bg-(--color-primary) text-white">
          Primary
        </button>
        <div className="flex items-center gap-4">
          <ClientInfo />
          <div className="h-10 w-px bg-gray-400 mx-4"></div>
          <ServerInfo />
        </div>
      </div>
    </div>
  );
}
