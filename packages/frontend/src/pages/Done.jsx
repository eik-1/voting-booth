import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Done() {
  const { state } = useLocation();
  const [results, setResults] = useState(null);
  const [parties, setParties] = useState([]);
  const userPartyId = state?.partyId;

  useEffect(() => {
    Promise.all([api.results(), api.listParties()]).then(([r, p]) => {
      setResults(r); setParties(p);
    });
  }, []);

  const chosen = parties.find((p) => p.id === userPartyId);

  return (
    <div className="panel">
      <h1>{state?.alreadyVoted ? "You've already voted" : "Thanks for voting"}</h1>
      {chosen && (
        <p className="muted">
          You picked <strong style={{ color: chosen.color }}>{chosen.name}</strong>.
        </p>
      )}

      {results && (
        <div style={{ marginTop: 18 }}>
          <h2>Live tally ({results.total} {results.total === 1 ? "vote" : "votes"})</h2>
          <div className="col" style={{ gap: 8, marginTop: 8 }}>
            {parties.map((p) => {
              const count = results.counts[p.id] ?? 0;
              const pct = results.total ? Math.round((count / results.total) * 100) : 0;
              return (
                <div key={p.id} className="col" style={{ gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{p.name}</span>
                    <span className="muted">{count} · {pct}%</span>
                  </div>
                  <div style={{
                    height: 8, background: "#0e1431", borderRadius: 6,
                    border: "1px solid var(--border)", overflow: "hidden",
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", background: p.color,
                      transition: "width 200ms ease",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="row" style={{ marginTop: 18 }}>
        <Link to="/" className="btn secondary">Back to start</Link>
      </div>
    </div>
  );
}
