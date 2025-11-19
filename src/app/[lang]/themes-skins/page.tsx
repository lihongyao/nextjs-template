// src/app/[lang]/page.tsx
import ThemeSkinSwitcher from "@/components/features/ThemeSkinSwitcher";
import Card from "./_components/Card";
export default async function Page() {
  return (
    <div>
      <ThemeSkinSwitcher />
      <Card />
    </div>
  );
}
