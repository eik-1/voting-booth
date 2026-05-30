import express from "express";
import cors from "cors";
import { store } from "./store.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Users — descriptors are returned so the frontend can do the matching.
// (Demo scope: a real system would do matching server-side and never ship
// raw biometric vectors over the wire.)
app.get("/api/users", (_req, res) => {
  res.json(store.listUsers());
});

app.post("/api/users", (req, res) => {
  const { name, age, emirate, nationalId, descriptor } = req.body ?? {};
  if (!name || !descriptor || !Array.isArray(descriptor)) {
    return res.status(400).json({ error: "name and descriptor[] required" });
  }
  const user = store.registerUser({
    name,
    age: Number(age) || null,
    emirate: emirate ?? null,
    nationalId: nationalId ?? null,
    descriptor,
  });
  res.status(201).json(user);
});

// Attach a freshly-captured descriptor to an existing seed user (used when
// the frontend processes a seed photo and wants to persist the result).
app.post("/api/users/:id/descriptor", (req, res) => {
  const { descriptor } = req.body ?? {};
  if (!Array.isArray(descriptor))
    return res.status(400).json({ error: "descriptor[] required" });
  const user = store.attachDescriptor(req.params.id, descriptor);
  if (!user) return res.status(404).json({ error: "not found" });
  res.json(user);
});

app.get("/api/parties", (_req, res) => res.json(store.listParties()));

app.get("/api/users/:id/vote", (req, res) => {
  res.json({
    hasVoted: store.hasVoted(req.params.id),
    partyId: store.voteFor(req.params.id),
  });
});

app.post("/api/vote", (req, res) => {
  const { userId, partyId } = req.body ?? {};
  if (!userId || !partyId)
    return res.status(400).json({ error: "userId and partyId required" });
  const result = store.castVote(userId, partyId);
  if (!result.ok) return res.status(409).json(result);
  res.json(result);
});

app.get("/api/results", (_req, res) => res.json(store.results()));

// dev-only reset — handy when you want to re-record the demo
app.post("/api/_reset", (_req, res) => {
  store.reset();
  res.json({ ok: true });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`[voting-booth] backend listening on :${port}`);
});
