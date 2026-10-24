"use client";

import { listCutCards } from "@/lib/cut-views";
import { CutFigure } from "./cut-figure";

export function CutBoard() {
  const cards = listCutCards();

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => (
        <li key={card.id} className="border border-stone-300 bg-white p-2">
          <CutFigure card={card} />
          <p className="mt-1 text-sm font-medium">{card.nameEn}</p>
          <p lang="zh-HK" className="text-sm">
            {card.nameYue}
          </p>
          <p className="text-xs text-stone-600">
            <code>{card.id}</code>
          </p>
        </li>
      ))}
    </ul>
  );
}
