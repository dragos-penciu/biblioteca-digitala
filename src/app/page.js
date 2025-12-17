import TypingLogo from "@/components/TypingLogo";
import SearchBar from "@/components/SearchBar";
import PopularGrid from "@/components/PopularGrid";

async function getPopular() {
  const res = await fetch("http://127.0.0.1:3000/api/home?limit=20", {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

export default async function Home() {
  const data = await getPopular();

  return (
    <main className="select-none bg-bg min-h-screen flex flex-col items-start justify-start p-8">
      <div className="min-w-full flex justify-center items-center">
        <TypingLogo text="booklog." speed={60} />
      </div>
      <div className="mt-6 w-full">
        <SearchBar />
      </div>
      <PopularGrid items={data.items} />
    </main>
  );
}
