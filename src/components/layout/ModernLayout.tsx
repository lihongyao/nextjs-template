// src/components/layout/ModernLayout.tsx
export default function ModernLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-name="ModernLayout" className="min-h-dvh">
      <header className="h-[56px] bg-blue-400 flex items-center justify-center">
        <span className="text-xl font-bold tracking-wider text-white">Modern Layout</span>
      </header>
      <main className="flex">
        <aside className="sticky top-0 left-0 w-[252px] h-screen border-r border-gray-300">
          <span>Aside</span>
        </aside>
        <div className="max-w-[1200px] w-full mx-auto bg-gray-200 px-3">{children}</div>
      </main>
    </div>
  );
}
