function resolveBase() {
  const raw = import.meta.env.VITE_API_BASE;
  if (!raw) return "";
  const trimmed = raw.replace(/\/+$/, "");
  return /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const BASE = resolveBase();

async function request(path, init = {}) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { "content-type": "application/json" },
    ...init,
  });
  if (!response.ok) {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      /* non-JSON body */
    }
    const err = new Error(message);
    err.status = response.status;
    throw err;
  }
  return response.json();
}

export const api = {
  listUsers:     ()                       => request("/api/users"),
  registerUser:  (payload)                => request("/api/users", { method: "POST", body: JSON.stringify(payload) }),
  listParties:   ()                       => request("/api/parties"),
  voteStatus:    (userId)                 => request(`/api/users/${userId}/vote`),
  castVote:      (userId, partyId)        => request("/api/vote", { method: "POST", body: JSON.stringify({ userId, partyId }) }),
  results:       ()                       => request("/api/results"),
};
