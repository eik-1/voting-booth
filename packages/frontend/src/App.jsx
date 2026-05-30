import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Scan from "./pages/Scan.jsx";
import Register from "./pages/Register.jsx";
import Vote from "./pages/Vote.jsx";
import Done from "./pages/Done.jsx";
import { loadModels, describeFromImageUrl } from "./lib/face.js";
import { api, API_BASE_DISPLAY } from "./lib/api.js";

// Phased bootstrap so the UI can pinpoint which step failed.
// Models loading is the only HARD requirement to mark the app "ready" —
// seed-descriptor work runs after, and failures there are surfaced but
// non-fatal (you can still register and vote).
function useBootstrap() {
  const [phase, setPhase] = useState("models");      // models | api | seeds | ready
  const [error, setError] = useState(null);          // { where, message }
  const [seedWarn, setSeedWarn] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // (A) face-api.js weights from CDN
      try {
        await loadModels();
      } catch (e) {
        if (!cancelled) setError({ where: "models (CDN)", message: e.message });
        return;
      }

      // (B) backend round-trip
      let users;
      try {
        if (cancelled) return;
        setPhase("api");
        users = await api.listUsers();
      } catch (e) {
        if (!cancelled) setError({
          where: `backend (${API_BASE_DISPLAY})`,
          message: e.message,
        });
        return;
      }

      // App is functional from here — mark ready before doing the slow
      // seed-descriptor work so the UI isn't blocked.
      if (!cancelled) setPhase("ready");

      // (C) compute descriptors for seed users that don't have them yet
      setPhase("seeds");
      const missing = users.filter((u) => !u.descriptor && u.referenceImageUrl);
      const failures = [];
      for (const u of missing) {
        if (cancelled) return;
        try {
          const desc = await describeFromImageUrl(u.referenceImageUrl);
          if (desc) await api.attachDescriptor(u.id, desc);
          else failures.push(`${u.name}: no face detected in reference photo`);
        } catch (e) {
          failures.push(`${u.name}: ${e.message}`);
        }
      }
      if (!cancelled) {
        if (failures.length) setSeedWarn(failures);
        setPhase("ready");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { phase, error, seedWarn };
}

function StatusBadge({ phase, error }) {
  if (error) {
    return <span style={{ color: "#fca5a5" }}>fail @ {error.where}</span>;
  }
  const label = {
    models: "loading face models…",
    api:    "checking backend…",
    seeds:  "preparing seed identities…",
    ready:  "ready",
  }[phase];
  return <span className="muted">{label}</span>;
}

export default function App() {
  const { phase, error, seedWarn } = useBootstrap();
  const location = useLocation();

  return (
    <div className="app">
      <header className="header">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand"><span className="dot" />UAE Voting Booth — Demo</div>
        </Link>
        <div style={{ fontSize: 13 }}>
          <StatusBadge phase={phase} error={error} />
        </div>
      </header>

      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          <strong>{error.where} failed.</strong>
          <div style={{ fontFamily: "monospace", fontSize: 12, marginTop: 6 }}>
            {error.message}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
            API base in this build: <code>{API_BASE_DISPLAY || "(empty — calls go to same origin)"}</code>
          </div>
        </div>
      )}

      {seedWarn && (
        <div className="alert warn" style={{ marginBottom: 16 }}>
          Seed identities could not be prepared (you can still register & vote):
          <ul style={{ margin: "6px 0 0 18px" }}>
            {seedWarn.map((w, i) => <li key={i} style={{ fontSize: 13 }}>{w}</li>)}
          </ul>
        </div>
      )}

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/scan"      element={<Scan />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/vote"      element={<Vote />} />
        <Route path="/done"      element={<Done />} />
      </Routes>

      {location.pathname === "/" && (
        <p className="disclaimer">
          Demo only. The UAE does not hold partisan elections; party names here are fictional
          and intended to illustrate the voting flow.
        </p>
      )}
    </div>
  );
}
