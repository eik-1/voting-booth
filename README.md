# UAE Voting Booth

A face-scan voting demo: walk up to the camera, register, cast a single vote.

- **Frontend** — Vite + React + face-api.js (`packages/frontend`)
- **Backend** — Node + Express, JSON-file storage (`packages/backend`)
- **Monorepo** — npm workspaces
- **Deploy** — two independent Render services declared in `render.yaml`

> Demonstration only. The UAE does not hold partisan elections; the parties
> shown are fictional and exist solely to illustrate the voting flow.

---

## Local development

```bash
npm install
npm run dev
```

| Service  | URL                         |
| -------- | --------------------------- |
| Frontend | http://localhost:5173       |
| Backend  | http://localhost:4000       |

The Vite dev server proxies `/api/*` to the backend automatically, so you
don't need to set `VITE_API_BASE` locally.

## Application flow

1. **Home** — see the registry of voters.
2. **Scan** — webcam captures a face. If it matches a registered voter, their
   card appears and you can continue to vote.
3. **Register** — first-time voters provide their details and capture a face.
4. **Vote** — choose one of five parties. Re-voting is rejected server-side.
5. **Confirmation** — live tally bars; subsequent scans of the same voter
   land here.

---

## Deploying to Render

### 1. Push to GitHub

```bash
git init && git add . && git commit -m "initial"
gh repo create voting-booth --public --source=. --push
```

### 2. Create the Blueprint

In Render: **New → Blueprint** → select the repository.

Render reads `render.yaml` and provisions two services:

| Service                  | Type        |
| ------------------------ | ----------- |
| `voting-booth-backend`   | Web service |
| `voting-booth-frontend`  | Static site |

Both services declare `sync: false` env vars, so the first deploy will create
them but leave the values blank — that's expected.

### 3. Wire the services together

Once both services finish their first build:

1. Copy the **backend's** public URL from its service page
   (`https://voting-booth-backend-XXXX.onrender.com`).
2. Open the **frontend** service → **Environment** →
   set `VITE_API_BASE` to that URL → **Save Changes**.
3. Trigger a frontend rebuild: **Manual Deploy → Clear build cache & deploy**.
   This is required because Vite inlines env vars at build time.
4. Copy the **frontend's** public URL.
5. Open the **backend** service → **Environment** →
   set `CORS_ORIGIN` to the frontend URL → **Save Changes**.
   The backend restarts automatically; no cache clear needed.

### 4. Verify

- `GET https://<backend>/api/health` → `{"status":"ok"}`
- `GET https://<backend>/api/parties` → JSON list of five parties
- Open the frontend URL → "Registered voters" panel shows the two seed voters

---

## Configuration reference

### Backend env vars

| Variable      | Required | Description                                                              |
| ------------- | -------- | ------------------------------------------------------------------------ |
| `PORT`        | no       | Render injects this automatically.                                        |
| `NODE_ENV`    | no       | `production` in deploys; controls Express's perf optimisations.           |
| `CORS_ORIGIN` | yes      | Comma-separated list of allowed origins. Unset = allow all (dev only).    |

### Frontend env vars

| Variable          | Required | Description                                                                  |
| ----------------- | -------- | ---------------------------------------------------------------------------- |
| `VITE_API_BASE`   | yes      | Public URL of the backend (e.g. `https://voting-booth-backend.onrender.com`). |

> Vite inlines `VITE_*` variables at build time. Changes require a redeploy
> with cache cleared on the frontend service.

---

## API reference

| Method | Path                          | Purpose                                          |
| ------ | ----------------------------- | ------------------------------------------------ |
| GET    | `/api/health`                 | Liveness check; used by Render's health probe.   |
| GET    | `/api/users`                  | List registered voters.                          |
| POST   | `/api/users`                  | Register a new voter.                            |
| GET    | `/api/parties`                | List available parties.                          |
| GET    | `/api/users/:id/vote`         | Check whether a voter has voted.                 |
| POST   | `/api/vote`                   | Cast a vote (409 if already voted).              |
| GET    | `/api/results`                | Current tally.                                   |

---

## Project layout

```
.
├── package.json            (workspaces root)
├── render.yaml             (deploy blueprint)
└── packages/
    ├── backend/
    │   └── src/
    │       ├── server.js
    │       ├── store.js
    │       └── seed.js
    └── frontend/
        └── src/
            ├── App.jsx
            ├── lib/{api,face}.js
            ├── components/Webcam.jsx
            └── pages/{Home,Scan,Register,Vote,Done}.jsx
```

## Notes on persistence

The backend persists state to `packages/backend/data/db.json`. Render's free
plan does not retain disks across deploys; registrations and votes reset on
each redeploy. Add a Render Disk or swap in a managed database for durable
storage.

## Notes on free-tier behaviour

Free-tier Render services sleep after ~15 minutes of inactivity. The first
request after sleep takes 30–60 seconds while the instance wakes. Before
demoing, warm the backend by hitting `/api/health` once.
