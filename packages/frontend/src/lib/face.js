// face-api.js is loaded lazily so it doesn't bloat the initial page bundle.
// The first call to loadModels() pulls down both the library code and the
// model weights from the CDN. Subsequent calls reuse the cached promise.

const MODEL_URL = "https://justadudewhohacks.github.io/face-api.js/models";

export const MATCH_THRESHOLD = 0.55;

let modelsPromise = null;
let faceapiModule = null;
let detectorOptions = null;

async function ensureReady() {
  if (modelsPromise) return modelsPromise;
  modelsPromise = (async () => {
    const mod = await import("face-api.js");
    const faceapi = mod.default ?? mod;
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    faceapiModule = faceapi;
    detectorOptions = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320,
      scoreThreshold: 0.5,
    });
    return faceapi;
  })().catch((err) => {
    modelsPromise = null;
    throw err;
  });
  return modelsPromise;
}

export function loadModels() {
  return ensureReady().then(() => undefined);
}

export async function describeFromVideo(videoEl) {
  const faceapi = await ensureReady();
  const detection = await faceapi
    .detectSingleFace(videoEl, detectorOptions)
    .withFaceLandmarks()
    .withFaceDescriptor();
  return detection ? Array.from(detection.descriptor) : null;
}

export function bestMatch(queryDescriptor, users) {
  let best = null;
  for (const user of users) {
    if (!Array.isArray(user.descriptor) || user.descriptor.length === 0) continue;
    const dist = euclideanDistance(queryDescriptor, user.descriptor);
    if (best === null || dist < best.distance) {
      best = { user, distance: dist };
    }
  }
  return best && best.distance <= MATCH_THRESHOLD ? best : null;
}

function euclideanDistance(a, b) {
  let sum = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
