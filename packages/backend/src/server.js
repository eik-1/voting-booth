import express from "express";
import cors from "cors";
import { store } from "./store.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: false,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/users", (_req, res) => {
  res.json(store.listUsers());
});

app.post("/api/users", (req, res) => {
  const { name, age, emirate, nationalId, descriptor } = req.body ?? {};
  if (!name || !Array.isArray(descriptor) || descriptor.length === 0) {
    return res.status(400).json({ error: "name and descriptor are required" });
  }
  const user = store.registerUser({
    name: String(name).trim(),
    age: Number(age) || null,
    emirate: emirate ?? null,
    nationalId: nationalId ?? null,
    descriptor,
  });
  res.status(201).json(user);
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
  if (!userId || !partyId) {
    return res.status(400).json({ error: "userId and partyId are required" });
  }
  const result = store.castVote(userId, partyId);
  if (!result.ok) {
    const code = result.reason === "already_voted" ? 409 : 400;
    return res.status(code).json(result);
  }
  res.json(result);
});

app.get("/api/results", (_req, res) => res.json(store.results()));

app.use((_req, res) => res.status(404).json({ error: "not found" }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Voting booth backend listening on :${port}`);
});
