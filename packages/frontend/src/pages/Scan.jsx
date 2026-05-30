import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "../components/Webcam.jsx";
import { api } from "../lib/api.js";
import { describeFromVideo, bestMatch, loadModels } from "../lib/face.js";

export default function Scan() {
  const videoRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [match, setMatch] = useState(null); // { user, distance }
  const navigate = useNavigate();

  async function handleScan() {
    setBusy(true); setError(null); setMatch(null);
    try {
      await loadModels();
      const descriptor = await describeFromVideo(videoRef.current);
      if (!descriptor) {
        setError("No face detected. Center your face in the frame and try again.");
        return;
      }
      const users = await api.listUsers();
      const hit = bestMatch(descriptor, users);
      if (hit) {
        setMatch(hit);
      } else {
        // No match → off to registration, carry the descriptor along.
        navigate("/register", { state: { descriptor } });
      }
    } catch (e) {
      console.error(e);
      setError(e.message || "Scan failed.");
    } finally {
      setBusy(false);
    }
  }

  async function continueAsMatched() {
    const status = await api.voteStatus(match.user.id);
    if (status.hasVoted) navigate("/done", { state: { userId: match.user.id, alreadyVoted: true } });
    else navigate("/vote", { state: { userId: match.user.id } });
  }

  return (
    <div className="panel">
      <h1>Identity check</h1>
      <p className="muted">Look at the camera and press <em>Scan</em>.</p>

      <div style={{ marginTop: 14 }}>
        <Webcam ref={videoRef} onReady={(err) => setReady(!err)} />
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn" disabled={!ready || busy} onClick={handleScan}>
          {busy ? "Scanning…" : "Scan"}
        </button>
      </div>

      {error && <div className="alert error" style={{ marginTop: 14 }}>{error}</div>}

      {match && (
        <div className="panel" style={{ marginTop: 18 }}>
          <div className="identity-card">
            {match.user.referenceImageUrl && (
              <img src={match.user.referenceImageUrl} alt={match.user.name} />
            )}
            <div className="col" style={{ gap: 2 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{match.user.name}</div>
              <div className="muted" style={{ fontSize: 13 }}>
                {match.user.emirate ?? "—"} · ID {match.user.nationalId ?? "—"}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                match distance {match.distance.toFixed(3)}
              </div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn success" onClick={continueAsMatched}>Continue to vote →</button>
          </div>
        </div>
      )}
    </div>
  );
}
