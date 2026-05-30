import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Scan from "./pages/Scan.jsx";
import Register from "./pages/Register.jsx";
import Vote from "./pages/Vote.jsx";
import Done from "./pages/Done.jsx";
import { loadModels } from "./lib/face.js";
import { api } from "./lib/api.js";
import { describeFromImageUrl } from "./lib/face.js";

// Seed-photo descriptor bootstrap: on first app load we compute descriptors
// for any seed users that don't have one yet (their reference photo URL is
// shipped from the backend). We then PUT them back so a refresh skips the work.
function useBootstrapSeedDescriptors() {
  const [status, setStatus] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadModels();
        const users = await api.listUsers();
        const missing = users.filter((u) => !u.descriptor && u.referenceImageUrl);
        for (const u of missing) {
          if (cancelled) return;
          try {
            const desc = await describeFromImageUrl(u.referenceImageUrl);
            if (desc) await api.attachDescriptor(u.id, desc);
          } catch (e) {
            console.warn("seed descriptor failed for", u.id, e);
          }
        }
        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);
  return status;
}

export default function App() {
  const status = useBootstrapSeedDescriptors();
  const location = useLocation();

  return (
    <div className="app">
      <header className="header">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand"><span className="dot" />UAE Voting Booth — Demo</div>
        </Link>
        <div className="muted" style={{ fontSize: 13 }}>
          {status === "loading" && "loading face models…"}
          {status === "ready"   && "models ready"}
          {status === "error"   && "model load failed"}
        </div>
      </header>

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
