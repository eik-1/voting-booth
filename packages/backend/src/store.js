import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { seedUsers, seedParties } from "./seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function emptyDb() {
  return {
    users: seedUsers.map((u) => ({ ...u, descriptor: null, registeredAt: null })),
    votes: {}, // { userId: partyId }
  };
}

function load() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const fresh = emptyDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    const fresh = emptyDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2));
    return fresh;
  }
}

let db = load();

function persist() {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const store = {
  listUsers: () => db.users,
  listParties: () => seedParties,
  getUser: (id) => db.users.find((u) => u.id === id),

  registerUser({ name, age, emirate, nationalId, descriptor }) {
    const id = "u_" + Math.random().toString(36).slice(2, 9);
    const user = {
      id,
      name,
      age,
      emirate,
      nationalId,
      descriptor,
      registeredAt: new Date().toISOString(),
    };
    db.users.push(user);
    persist();
    return user;
  },

  attachDescriptor(userId, descriptor) {
    const user = db.users.find((u) => u.id === userId);
    if (!user) return null;
    user.descriptor = descriptor;
    user.registeredAt = user.registeredAt ?? new Date().toISOString();
    persist();
    return user;
  },

  hasVoted: (userId) => Boolean(db.votes[userId]),
  voteFor: (userId) => db.votes[userId] ?? null,

  castVote(userId, partyId) {
    if (db.votes[userId]) return { ok: false, reason: "already_voted" };
    if (!seedParties.find((p) => p.id === partyId))
      return { ok: false, reason: "unknown_party" };
    db.votes[userId] = partyId;
    persist();
    return { ok: true };
  },

  results() {
    const counts = Object.fromEntries(seedParties.map((p) => [p.id, 0]));
    for (const partyId of Object.values(db.votes)) {
      if (counts[partyId] !== undefined) counts[partyId] += 1;
    }
    return { counts, total: Object.keys(db.votes).length };
  },

  // dev-only: wipe to a clean slate
  reset() {
    db = emptyDb();
    persist();
  },
};
