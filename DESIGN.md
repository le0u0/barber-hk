# Barber HK — MTR

Visitor chrome uses the tokens in `app/globals.css`: cream ground `#F7F4EB`, ink `#0A0A0A`, MTR yellow `#FFD300`, 44px targets, 2px radius.

## Cut photos

Generated portraits for this branch. They are not customer photos and not the direction comps. A front portrait was the identity lock; the other frames were generated from that reference so the crop and eye-line stay put. Only hair, or the camera angle, changes.

| Cut | Frames in the UI |
| --- | --- |
| Textured crop fade | front, three-quarter, side, back |
| Two-block | front, three-quarter, side, back |
| Curtain middle part | front, three-quarter, side, back |
| French crop, Office side part, Slick undercut, Short pompadour, Induction buzz | front only, labeled “Front only 只有正面” |

Front-only cards do not open a carousel and do not reuse one photo as fake side or back frames.

## Carousel

An orbit card opens a non-modal region above the grid. Swipe, arrows, and dots move front → three-quarter → side → back. Arrow keys, Home, and End work while the region is focused. Escape closes it. Reduced motion swaps the frame with no slide. There is no autoplay.
