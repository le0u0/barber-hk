import Image from "next/image";

type CutFace = {
  nameEn: string;
  nameYue: string;
  image: string;
};

export function CutCatalog({ cuts }: { cuts: CutFace[] }) {
  return (
    <section className="border-t border-stone-300 pt-6" aria-labelledby="cut-catalog">
      <h2 id="cut-catalog" className="text-sm font-semibold">
        Reference cuts <span lang="zh-HK">八款參考</span>
      </h2>
      <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-600">
        Photos to recognise the cut. This is not a menu.
        <span lang="zh-HK" className="block">
          睇圖認髮型，唔係選單。備忘會寫明點同師傅講。
        </span>
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4">
        {cuts.map((cut) => (
          <li key={cut.nameEn} className="cursor-default">
            <figure>
              <Image
                src={cut.image}
                alt=""
                width={360}
                height={480}
                unoptimized
                className="aspect-[3/4] w-full object-cover object-top"
              />
              <figcaption className="mt-1.5">
                <p className="text-sm font-medium leading-snug">{cut.nameEn}</p>
                <p lang="zh-HK" className="text-sm leading-snug text-stone-700">
                  {cut.nameYue}
                </p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
