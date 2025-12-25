import ClientComp from "@/components/features/ClientComp";
import Counter from "@/components/features/Counter";
import LanguageSwitcher from "@/components/features/LanguageSwitcher";
import ServerComp from "@/components/features/ServerComp";
import { Link } from "@/i18n/navigation";
import { Routes } from "@/lib/routes";
export default function Page() {
  return (
    <div className="p-4 flex flex-col items-center gap-4 bg-red-400">
      {/* 国际化 */}
      <LanguageSwitcher />
      <div className="flex gap-4 items-start">
        <ClientComp />
        <ServerComp />
      </div>
      {/* 状态管理 */}
      <Counter />
      <Link href={Routes.Details}>Details</Link>
    </div>
  );
}
