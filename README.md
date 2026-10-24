# Barber HK

Free Next.js app for a Hong Kong men's barber brief. Quiz or selfie, then one screen in English and 粵語.

No accounts. Guest prefs stay in the browser. Gemini is optional.

## Run

```bash
npm install
npm run dev
```

Optional server env (see `.env.example`):

```bash
GEMINI_API_KEY=
```

Leave it empty. The quiz still returns a usable brief from `fixtures/cuts.json`. An invalid key does the same. Do not use `NEXT_PUBLIC_GEMINI_API_KEY`. Set `GEMINI_API_KEY` as a server secret on Vercel.

## Guest prefs

`localStorage` key `barber-hk:v1`:

- `lang`: `en` or `yue` (UI toggle)
- `quiz`: last quiz answers
- `lastCutId`: last cut id
- `compare`: two different cut ids, `{ "left", "right" }`, or omitted

## Compare

`/compare` puts two cuts side by side so you can read the difference to the barber. The pair stays in guest prefs. The same cut cannot be chosen twice.

The brief shown on `/brief` is held in `sessionStorage` (`barber-hk:brief`) for that tab. Nothing is stored on the server.

## QA fixtures

- `fixtures/cuts.json` — exactly 8 cuts, stable ids: `crop-fade`, `french-crop`, `two-block`, `side-part`, `curtain`, `undercut`, `pompadour`, `induction`
- `fixtures/selfie-sample.png` — sample selfie diagram for the upload path (not a customer photo). The same file is served at `/fixtures/selfie-sample.png`. The selfie screen has **Use sample fixture**.

Reference diagrams: `public/cuts/<id>.svg`. East Asian male hair notes are English only, on the brief.

## Deploy SHA (AC-06)

The footer prints `VERCEL_GIT_COMMIT_SHA`, then `GITHUB_SHA`, then `local`, and sets `data-deploy-sha` to the full value. Vercel injects the commit SHA at build, so the production page shows that deploy. This repo does not attach a custom domain.

## API

`POST /api/brief`

- Quiz: `{ "path": "quiz", "answers": { "sides", "top", "finish", "part" } }`
- Selfie: `{ "path": "selfie", "mimeType": "image/jpeg"|"image/png"|"image/webp", "imageBase64" }`

`GET /api/brief` returns `{ count: 8, ids: [...] }`.

Responses never include `GEMINI_API_KEY`.
