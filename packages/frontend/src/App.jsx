import { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Scan from "./pages/Scan.jsx";
import Register from "./pages/Register.jsx";
import Vote from "./pages/Vote.jsx";
import Done from "./pages/Done.jsx";
import { loadModels } from "./lib/face.js";

function useFaceModels() {
  const [state, setState] = useState("loading");
  useEffect(() => {
    let cancelled = false;
    loadModels()
      .then(() => !cancelled && setState("ready"))
      .catch(() => !cancelled && setState("error"));
    return () => { cancelled = true; };
  }, []);
  return state;
}

export default function App() {
  const modelState = useFaceModels();
  const location = useLocation();
  const onHome = location.pathname === "/";

  return (
    <div className="app">
      <header className="header">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div className="brand">
            <span className="dot" />UAE Voting Booth
          </div>
        </Link>
      </header>

      {modelState === "error" && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          We couldn't initialise face recognition. Please check your connection and refresh.
        </div>
      )}

      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/scan"      element={<Scan />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/vote"      element={<Vote />} />
        <Route path="/done"      element={<Done />} />
      </Routes>

      {onHome && (
        <p className="disclaimer">
          Demonstration only. The UAE does not hold partisan elections; the parties shown
          are fictional and exist solely to illustrate the voting flow.
        </p>
      )}
    </div>
  );
}
