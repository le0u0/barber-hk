# Barber HK — MTR

Visitor chrome uses the tokens in `app/globals.css`: cream ground `#F7F4EB`, ink `#0A0A0A`, MTR yellow `#FFD300`, 44px targets, 2px radius.

## Cut photos

Demo angles are the figmay pack. Provenance, hashes, and the off-demo list live in `docs/angles/PROVENANCE.md` (`docs/angles/MANIFEST.json`, `docs/angles/ENG-README.md`). They are synthetic references, not customer photos and not a face morph. Swap them for a real shoot later.

Public URLs stay on the pack path, served from `public/`:

`/mtr-assets/angles/{cutId}/{front|three-quarter|side|back}.jpg`

A cut gets that carousel only when `docs/angles/MANIFEST.json` marks all four angles `generated`. The carousel shows a badge, “Synthetic ref 合成參考”, and the caption “Not a customer photo 唔係客人相”.

`strip-4.jpg` sits beside those frames and is not shown in the carousel.

| Cut | Frames in the UI |
| --- | --- |
| Textured crop fade | front, three-quarter, side, back |
| French crop | front, three-quarter, side, back |
| Two-block | front, three-quarter, side, back |
| Office side part, Curtain middle part, Slick undercut, Short pompadour, Induction buzz | front only (`/mtr-assets/angles/{cutId}/front.jpg`), labeled “Front only 只有正面” and “Synthetic ref 合成參考” |

Front-only cards do not open a carousel and do not reuse one photo as fake side or back frames. Their other angles stay `off-demo-path`.

## Carousel

An orbit card opens a non-modal region above the grid. Swipe, arrows, and dots move front → three-quarter → side → back. Arrow keys, Home, and End work while the region is focused. Escape closes it. Reduced motion swaps the frame with no slide. There is no autoplay.
