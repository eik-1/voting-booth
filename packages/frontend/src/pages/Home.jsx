import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Home() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api
      .listUsers()
      .then((list) => !cancelled && setUsers(list))
      .catch(() => !cancelled && setError("Voting service is unavailable. Please try again shortly."));
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="panel">
        <h1>Welcome to the Voting Booth</h1>
        <p className="muted">
          Step up to the camera and we'll verify your identity. New voters can register
          in a few seconds.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link to="/scan" className="btn">Scan my face</Link>
          <Link to="/register" className="btn secondary">Register as new voter</Link>
        </div>
      </div>

      <div className="panel">
        <h2>Registered voters{users ? ` (${users.length})` : ""}</h2>
        {error ? (
          <div className="alert error" style={{ marginTop: 8 }}>{error}</div>
        ) : users === null ? (
          <div className="muted" style={{ marginTop: 8 }}>Loading…</div>
        ) : users.length === 0 ? (
          <div className="muted" style={{ marginTop: 8 }}>No voters registered yet.</div>
        ) : (
          <div className="col" style={{ gap: 12, marginTop: 8 }}>
            {users.map((user) => (
              <div key={user.id} className="identity-card">
                {user.referenceImageUrl ? (
                  <img
                    src={user.referenceImageUrl}
                    alt={user.name}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <div
                    style={{
                      width: 72, height: 72, borderRadius: "50%",
                      background: "#1c2550", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontWeight: 700, fontSize: 22,
                    }}
                  >
                    {user.name?.[0] ?? "?"}
                  </div>
                )}
                <div className="col" style={{ gap: 2 }}>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div className="muted" style={{ fontSize: 13 }}>
                    {user.emirate ?? "—"} · ID {user.nationalId ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
