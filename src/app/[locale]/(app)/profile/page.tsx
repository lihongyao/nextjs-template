export default function ProfilePage() {
  return (
    <div data-name="CartPage" className="">
      <header className="text-center py-10">
        <span className="text-xl text-gray-500 italic font-bold">ProfilePage</span>
      </header>
      <main className="flex flex-col gap-4 items-center">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={String(i)} className="w-[300px] h-[200px] rounded-lg flex justify-center items-center  bg-blue-300">
            <span className="text-xl text-gray-500 italic font-bold"> {i + 1}</span>
          </div>
        ))}
      </main>
    </div>
  );
}
