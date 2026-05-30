# UAE Voting Booth — Demo

A small face-scan voting demo. Walk up, scan your face, vote.

- **Frontend** — Vite + React + `face-api.js` (`packages/frontend`)
- **Backend** — Node + Express, JSON-file persistence (`packages/backend`)
- **Monorepo** — npm workspaces
- **Deploy** — single Render Blueprint (`render.yaml`)

> The UAE does not hold partisan elections. The five "parties" are fictional
> and exist so the demo has buttons to press.

---

## Quick start (local)

```bash
npm install
npm run dev
```

- Backend → http://localhost:4000
- Frontend → http://localhost:5173

The first time the app loads, it downloads ~6 MB of `face-api.js` model weights
from a CDN and computes face descriptors for the two seeded demo identities.
Watch the header status — it flips from *loading face models…* to *models ready*.

## The flow

1. **Home** — see registered voters (two seeds: Aisha Al Mansouri & Omar Al Hashimi).
2. **Scan** — webcam captures a face. If it matches a known voter, their card pops up.
3. **Register** — if no match, fill in info + capture face.
4. **Vote** — pick one of five fictional UAE platforms.
5. **Done** — live tally bars. Trying to vote twice is rejected.

## Demo-ing face matching

The two seeded users have reference photos hosted on Unsplash. On first load the
frontend runs them through `face-api.js` to produce a descriptor. Since you
(probably) don't look like an Unsplash stock model, your first scan won't match —
you'll get sent to `/register`, register yourself, and from then on your scan
matches you.

To reset and start over:
```bash
curl -X POST http://localhost:4000/api/_reset
```

---

## Deploying on Render

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, pick the repo. Render reads `render.yaml`.
3. Two services come up:
   - `voting-booth-backend` (web service)
   - `voting-booth-frontend` (static site)
4. The frontend's `VITE_API_BASE` is auto-wired to the backend hostname via
   `fromService` in the blueprint. Free tier works.

### Notes

- The backend persists to `packages/backend/data/db.json` — on Render's
  free plan disks aren't persistent across redeploys; votes will reset.
  For real persistence add a Render Disk or swap in Postgres.
- `face-api.js` weights load from the public CDN at
  `https://justadudewhohacks.github.io/face-api.js/models`. If that ever
  disappears, drop the model files into `packages/frontend/public/models/`
  and change `MODEL_URL` in `src/lib/face.js` to `/models`.

---

## Project layout

```
.
├── package.json            (workspaces)
├── render.yaml             (deploy blueprint)
└── packages/
    ├── backend/
    │   └── src/
    │       ├── server.js   (Express routes)
    │       ├── store.js    (JSON-file persistence)
    │       └── seed.js     (2 demo identities + 5 parties)
    └── frontend/
        └── src/
            ├── App.jsx
            ├── lib/
            │   ├── api.js  (fetch wrapper)
            │   └── face.js (face-api.js helpers + matching)
            ├── components/Webcam.jsx
            └── pages/      (Home, Scan, Register, Vote, Done)
```

## API surface

| Method | Path                          | Purpose                                  |
|-------:|-------------------------------|------------------------------------------|
| GET    | `/api/health`                 | health check (Render uses this)          |
| GET    | `/api/users`                  | list voters (with descriptors)           |
| POST   | `/api/users`                  | register new voter                       |
| POST   | `/api/users/:id/descriptor`   | attach descriptor to existing seed user  |
| GET    | `/api/parties`                | list parties                             |
| GET    | `/api/users/:id/vote`         | has this user voted?                     |
| POST   | `/api/vote`                   | cast vote (409 if already voted)         |
| GET    | `/api/results`                | counts per party                         |
| POST   | `/api/_reset`                 | dev-only: wipe state                     |

## Security disclaimer

This is a demo. Real biometric systems do not ship raw face descriptors over
the wire, store them in plain JSON, or accept self-supplied voter records.
Don't use this code to run an actual election. Obviously.
