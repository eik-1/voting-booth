import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "../components/Webcam.jsx";
import { api } from "../lib/api.js";
import { describeFromVideo, loadModels } from "../lib/face.js";

const EMIRATES = [
  "Abu Dhabi", "Dubai", "Sharjah", "Ajman",
  "Umm Al Quwain", "Ras Al Khaimah", "Fujairah",
];

export default function Register() {
  const location = useLocation();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [descriptor, setDescriptor] = useState(location.state?.descriptor ?? null);
  const [cameraReady, setCameraReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    emirate: "Abu Dhabi",
    nationalId: "",
  });

  async function captureFace() {
    setBusy(true);
    setError(null);
    try {
      await loadModels();
      const result = await describeFromVideo(videoRef.current);
      if (!result) {
        setError("No face detected. Try again with better lighting.");
        return;
      }
      setDescriptor(result);
    } catch (err) {
      setError(err.message || "Couldn't capture your face. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAndContinue() {
    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!descriptor) {
      setError("Please capture your face before continuing.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const user = await api.registerUser({ ...form, descriptor });
      navigate("/vote", { state: { userId: user.id } });
    } catch (err) {
      setError(
        err?.status === undefined || err.status >= 500
          ? "Voting service is temporarily unavailable. Please try again."
          : err.message || "Could not save your registration.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <h1>Register</h1>
      <p className="muted">Tell us about yourself and capture your face.</p>

      <div className="col" style={{ gap: 10, marginTop: 12 }}>
        <div className="col">
          <label htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="col" style={{ flex: 1 }}>
            <label htmlFor="reg-age">Age</label>
            <input
              id="reg-age"
              type="number"
              className="input"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>
          <div className="col" style={{ flex: 1 }}>
            <label htmlFor="reg-emirate">Emirate</label>
            <select
              id="reg-emirate"
              className="select"
              value={form.emirate}
              onChange={(e) => setForm({ ...form, emirate: e.target.value })}
            >
              {EMIRATES.map((emirate) => (
                <option key={emirate}>{emirate}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="col">
          <label htmlFor="reg-id">National ID</label>
          <input
            id="reg-id"
            className="input"
            placeholder="784-YYYY-XXXXXXX-X"
            value={form.nationalId}
            onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
          />
        </div>
      </div>

      <div style={{ marginTop: 18 }}>
        <h2>Face capture</h2>
        <Webcam ref={videoRef} onReady={(err) => setCameraReady(!err)} />
        <div className="row" style={{ marginTop: 12 }}>
          <button
            className="btn secondary"
            disabled={!cameraReady || busy}
            onClick={captureFace}
          >
            {descriptor ? "Re-capture face" : "Capture face"}
          </button>
          {descriptor && <span className="alert ok">Face captured</span>}
        </div>
      </div>

      {error && <div className="alert error" style={{ marginTop: 14 }}>{error}</div>}

      <div className="row" style={{ marginTop: 18 }}>
        <button className="btn success" disabled={busy} onClick={saveAndContinue}>
          Save and continue
        </button>
      </div>
    </div>
  );
}
