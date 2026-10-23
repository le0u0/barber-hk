import { listCutCards } from "@/lib/catalog";
import { CutCatalog } from "./cut-catalog";
import { HomeIntro } from "./home-intro";

export default function Home() {
  const cuts = listCutCards().map(({ nameEn, nameYue, image }) => ({ nameEn, nameYue, image }));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col px-4 pb-12">
      <HomeIntro />
      <CutCatalog cuts={cuts} />
    </main>
  );
}
