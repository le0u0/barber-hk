# Angle pack provenance — demo path freeze

Rule: **3 cuts × 4 angles** for the carousel. The other five ship a front still until a real orbit lands.

Synthetic = AI reference, not customer photos. Same-face lock per cut across angles. Replace with real shoot when available.

## Demo path (ship carousel)

| cutId | files | status | notes |
|-------|-------|--------|-------|
| two-block | `front.jpg` `three-quarter.jpg` `side.jpg` `back.jpg` + `strip-4.jpg` | generated | Distinct panels (hashes differ). Old carousel-copy stubs deleted. |
| crop-fade | same 4 + `strip-4.jpg` | generated | Eng may use strip or panels |
| french-crop | same 4 + `strip-4.jpg` | generated | Eng may use strip or panels |

## Front-only (home grid — not a carousel)

side-part · curtain · undercut · pompadour · induction each ship `front.jpg` only. The file is a synthetic reference, not a customer photo and not a face morph.

| cutId | file | status | source |
|-------|------|--------|--------|
| side-part | `front.jpg` | generated | front-only synthetic |
| curtain | `front.jpg` | generated | front-only synthetic |
| undercut | `front.jpg` | generated | front-only synthetic |
| pompadour | `front.jpg` | generated | front-only synthetic |
| induction | `front.jpg` | generated | front-only synthetic |

`three-quarter`, `side`, and `back` stay `off-demo-path` with no file. A cut opens swipe chrome only when every angle is `generated`, so these five stay labeled “Front only 只有正面” and “Synthetic ref 合成參考”.

## Path pattern

`mtr-assets/angles/{cutId}/{angle}.jpg` with angle ∈ front | three-quarter | side | back.
