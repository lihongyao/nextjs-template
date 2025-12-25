import { Link } from "next-view-transitions";
import { Routes } from "@/lib/routes";

export default function MotionPage() {
  return (
    <div className="w-full h-svh bg-orange-400 flex flex-col justify-center items-center">
      <Link href={Routes.MotionSub}>详情</Link>
    </div>
  );
}
