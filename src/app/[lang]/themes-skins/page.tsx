// src/app/[lang]/page.tsx
import ThemeSkinSwitcher from "@/components/features/ThemeSkinSwitcher";
import Card from "./_components/Card";
export default async function ThemesSkinsPage() {
  console.log("__ThemesSkinsPage__");
  return (
    <div>
      <ThemeSkinSwitcher />
      <Card />
    </div>
  );
}
