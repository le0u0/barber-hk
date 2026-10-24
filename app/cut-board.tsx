"use client";

import Image from "next/image";
import { BarberShow } from "./barber-show";
import { barberCopy, type BarberCard } from "@/lib/barber-show";
import { useBarberShow } from "@/lib/use-barber-show";

export function CutBoard({ cuts }: { cuts: BarberCard[] }) {
  const show = useBarberShow();

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cuts.map((cut) => (
          <li key={cut.id} className="border border-stone-300 bg-white p-2">
            <button
              type="button"
              className="block w-full min-h-11 bg-transparent p-0 text-left"
              aria-haspopup="dialog"
              onClick={() => void show.open(cut)}
            >
              <Image src={cut.image} alt="" width={120} height={160} unoptimized />
              <span className="mt-1 block text-sm font-medium">{cut.nameEn}</span>
              <span lang="zh-HK" className="block text-sm">
                {cut.nameYue}
              </span>
              <span className="mt-2 block text-sm font-bold">
                {barberCopy.open.en} <span lang="zh-HK">{barberCopy.open.yue}</span>
              </span>
            </button>
            <p className="text-xs text-stone-600">
              <code>{cut.id}</code>
            </p>
          </li>
        ))}
      </ul>
      {show.card ? (
        <BarberShow card={show.card} status={show.status} onClose={() => void show.close()} onBright={() => void show.retryBright()} />
      ) : null}
    </>
  );
}
