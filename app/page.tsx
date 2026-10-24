import Image from "next/image";
import Link from "next/link";
import { listCuts } from "@/lib/catalog";
import { LastPick } from "./header";

export default function Home() {
  const cuts = listCuts();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">A brief for your barber</h1>
        <p lang="zh-HK">畀師傅睇嘅備忘。英文同粵語一齊出。</p>
        <LastPick />
      </div>
      <div className="flex gap-3">
        <Link href="/quiz" className="border border-stone-900 px-3 py-2">
          Quiz 問卷
        </Link>
        <Link href="/selfie" className="border border-stone-900 px-3 py-2">
          Selfie 自拍
        </Link>
      </div>
      <section>
        <h2 className="mb-3 text-sm font-semibold">
          {cuts.length} cuts <span lang="zh-HK">八款</span>
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cuts.map((cut) => (
            <li key={cut.id} className="border border-stone-600 bg-white p-2">
              <Image src={cut.image} alt="" width={120} height={160} unoptimized />
              <p className="mt-1 text-sm font-medium">{cut.nameEn}</p>
              <p lang="zh-HK" className="text-sm">
                {cut.nameYue}
              </p>
              <p className="text-xs text-stone-600">
                <code>{cut.id}</code>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
