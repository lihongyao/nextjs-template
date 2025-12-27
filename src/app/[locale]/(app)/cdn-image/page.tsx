import { headers } from "next/headers";
import { getCdnImageUrl } from "@/lib/cdn-image";

export default async function CdnImagePage() {
  const userAgent = (await headers()).get("user-agent");
  const imgSrc = "https://img.engames.com/cdn-cgi/image/format=auto/afunbet/1765557850915915110.jpeg";
  return (
    <div data-name="CdnImagePage" className="p-4">
      <img className="w-[300px]" src={getCdnImageUrl(imgSrc, { userAgent, imageOptions: { w: 300 } })} alt="" />
    </div>
  );
}
