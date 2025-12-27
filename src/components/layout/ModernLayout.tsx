// src/components/layout/ModernLayout.tsx
export default function ModernLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="h-14 flex items-center border-b px-(--card-padding) border-(--header-border-color)">
        <h1 className="tracking-(--gap-sm)">Modern Layout</h1>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
