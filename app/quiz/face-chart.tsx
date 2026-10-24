"use client";

import { getCut } from "@/lib/catalog";
import {
  FACE_CHART_COPY,
  FACE_OUTLINES,
  FACE_SHAPES,
  faceShapeById,
  type FaceShapeId,
} from "@/lib/face-shape";

export function FaceChart({
  value,
  onChange,
}: {
  value: FaceShapeId | null;
  onChange: (id: FaceShapeId) => void;
}) {
  const selected = faceShapeById(value);

  return (
    <fieldset className="border border-stone-300 p-3">
      <legend className="px-1 text-sm font-medium">
        {FACE_CHART_COPY.legendEn} <span lang="zh-HK">{FACE_CHART_COPY.legendYue}</span>
      </legend>
      <p id="face-chart-note" className="text-sm">
        {FACE_CHART_COPY.disclaimerEn}
      </p>
      <p lang="zh-HK" className="text-sm">
        {FACE_CHART_COPY.disclaimerYue}
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2" role="radiogroup" aria-describedby="face-chart-note">
        {FACE_SHAPES.map((shape) => {
          const checked = value === shape.id;
          return (
            <label
              key={shape.id}
              className={`flex cursor-pointer flex-col items-center gap-1 border bg-white p-2 text-center text-sm ${
                checked ? "border-stone-900" : "border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="faceShape"
                value={shape.id}
                checked={checked}
                onChange={() => onChange(shape.id)}
              />
              <svg viewBox="0 0 64 80" className="h-16 w-12" aria-hidden="true">
                <path d={FACE_OUTLINES[shape.id]} fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span>{shape.nameEn}</span>
              <span lang="zh-HK">{shape.nameYue}</span>
            </label>
          );
        })}
      </div>
      {selected ? (
        <div className="mt-3 text-sm">
          <p>{selected.noteEn}</p>
          <p lang="zh-HK">{selected.noteYue}</p>
          <p className="mt-2">
            <span className="font-medium">{FACE_CHART_COPY.suitsEn}. </span>
            {selected.suits
              .map((id) => getCut(id)?.nameEn)
              .filter((name): name is string => Boolean(name))
              .join(", ")}
          </p>
          <p lang="zh-HK">
            <span className="font-medium">{FACE_CHART_COPY.suitsYue}。 </span>
            {selected.suits
              .map((id) => getCut(id)?.nameYue)
              .filter((name): name is string => Boolean(name))
              .join("、")}
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
