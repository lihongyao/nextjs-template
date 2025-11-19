// src/components/layout/ClassicLayout.tsx
export default function ClassicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="h-14 flex items-center border-b px-(--card-padding) border-(--header-border-color)">
        <h1>Classic Layout</h1>
      </header>
      <main className="m-4">{children}</main>
    </div>
  );
}
