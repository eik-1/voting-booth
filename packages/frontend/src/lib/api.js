// In dev, vite proxies /api → backend. In prod (Render), the blueprint wires
// VITE_API_BASE from the backend service. Render returns just a hostname, so
// we prepend `https://` if no scheme is present.
function resolveBase() {
  const raw = import.meta.env.VITE_API_BASE;
  if (!raw) return "";
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}
const BASE = resolveBase();

async function json(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    let detail = "";
    try { detail = (await res.json()).error ?? ""; } catch {}
    throw new Error(`${res.status} ${res.statusText} ${detail}`);
  }
  return res.json();
}

export const api = {
  listUsers:        ()                       => json("/api/users"),
  registerUser:     (body)                   => json("/api/users", { method: "POST", body: JSON.stringify(body) }),
  attachDescriptor: (id, descriptor)         => json(`/api/users/${id}/descriptor`, { method: "POST", body: JSON.stringify({ descriptor }) }),
  listParties:      ()                       => json("/api/parties"),
  voteStatus:       (id)                     => json(`/api/users/${id}/vote`),
  castVote:         (userId, partyId)        => json("/api/vote", { method: "POST", body: JSON.stringify({ userId, partyId }) }),
  results:          ()                       => json("/api/results"),
};
