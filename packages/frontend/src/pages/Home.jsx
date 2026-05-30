import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/api.js";

export default function Home() {
  const [users, setUsers] = useState([]);
  useEffect(() => { api.listUsers().then(setUsers).catch(() => {}); }, []);

  return (
    <>
      <div className="panel">
        <h1>Welcome to the Voting Booth</h1>
        <p className="muted">
          Step up to the camera and we'll verify your identity. New voters can register
          on the spot.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link to="/scan" className="btn">Scan my face</Link>
          <Link to="/register" className="btn secondary">Register as new voter</Link>
        </div>
      </div>

      <div className="panel">
        <h2>Registered voters ({users.length})</h2>
        <div className="col" style={{ gap: 12, marginTop: 8 }}>
          {users.map((u) => (
            <div key={u.id} className="identity-card">
              {u.referenceImageUrl
                ? <img src={u.referenceImageUrl} alt={u.name} />
                : <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "#1c2550", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontWeight: 700, fontSize: 22,
                  }}>{u.name?.[0] ?? "?"}</div>}
              <div className="col" style={{ gap: 2 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>
                  {u.emirate ?? "—"} · ID {u.nationalId ?? "—"}
                </div>
              </div>
            </div>
          ))}
          {users.length === 0 && <div className="muted">No voters yet.</div>}
        </div>
      </div>
    </>
  );
}
