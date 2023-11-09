import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="space-y-4 flex-1 flex flex-col overflow-auto py-4">
      <h1 className="text-xl font-bold px-8 uppercase">Dashboard</h1>
      <div className="text-sm text-gray-300 px-8 font-semibold">
        <p className="inline">
          Charts
        </p>
      </div>
      <div className="bg-sky-800 px-8 w-full py-12 space-y-2 flex-grow">

</div>
       <Footer />
    </main>
  );
}
