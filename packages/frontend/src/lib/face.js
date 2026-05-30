import * as faceapi from "face-api.js";

// We pull face-api.js model weights from a CDN at runtime so the repo stays
// small (~6 MB of weights would otherwise need to be committed).
const MODEL_URL =
  "https://justadudewhohacks.github.io/face-api.js/models";

let modelsReady = false;
let modelsPromise = null;

export function loadModels() {
  if (modelsReady) return Promise.resolve();
  if (!modelsPromise) {
    modelsPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => { modelsReady = true; });
  }
  return modelsPromise;
}

const DETECTOR_OPTS = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,
  scoreThreshold: 0.5,
});

export async function describeFromVideo(videoEl) {
  await loadModels();
  const result = await faceapi
    .detectSingleFace(videoEl, DETECTOR_OPTS)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  return Array.from(result.descriptor);
}

export async function describeFromImageUrl(url) {
  await loadModels();
  const img = await faceapi.fetchImage(url);
  const result = await faceapi
    .detectSingleFace(img, DETECTOR_OPTS)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (!result) return null;
  return Array.from(result.descriptor);
}

// Euclidean distance — face-api convention is <0.6 = same person.
export function distance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export const MATCH_THRESHOLD = 0.55;

export function bestMatch(queryDescriptor, users) {
  let best = null;
  for (const u of users) {
    if (!u.descriptor) continue;
    const d = distance(queryDescriptor, u.descriptor);
    if (best === null || d < best.distance) best = { user: u, distance: d };
  }
  if (best && best.distance <= MATCH_THRESHOLD) return best;
  return null;
}
