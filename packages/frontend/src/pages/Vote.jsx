import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";

export default function Vote() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [parties, setParties] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    if (!userId) { navigate("/"); return; }
    (async () => {
      const [ps, status] = await Promise.all([
        api.listParties(), api.voteStatus(userId),
      ]);
      setParties(ps);
      if (status.hasVoted) {
        setAlreadyVoted(true);
        navigate("/done", { state: { userId, alreadyVoted: true, partyId: status.partyId } });
      }
    })();
  }, [userId]);

  async function submit() {
    if (!selected) return;
    setBusy(true); setError(null);
    try {
      await api.castVote(userId, selected);
      navigate("/done", { state: { userId, partyId: selected } });
    } catch (e) {
      if (String(e.message).includes("409")) {
        setAlreadyVoted(true);
        navigate("/done", { state: { userId, alreadyVoted: true } });
      } else {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h1>Cast your vote</h1>
      <p className="muted">Pick one. You can't vote twice.</p>

      <div className="col" style={{ gap: 10, marginTop: 14 }}>
        {parties.map((p) => (
          <div key={p.id} className="party"
               data-selected={selected === p.id}
               onClick={() => setSelected(p.id)}>
            <div className="swatch" style={{ background: p.color }} />
            <div className="meta">
              <div className="name">{p.name}</div>
              <div className="slogan">{p.slogan}</div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="alert error" style={{ marginTop: 14 }}>{error}</div>}
      {alreadyVoted && <div className="alert warn" style={{ marginTop: 14 }}>You have already voted.</div>}

      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn success" disabled={!selected || busy} onClick={submit}>
          {busy ? "Submitting…" : "Submit vote"}
        </button>
      </div>
    </div>
  );
}
