import { forwardRef, useEffect, useRef } from "react";

const Webcam = forwardRef(function Webcam({ onReady }, ref) {
  const videoRef = useRef(null);

  // expose video element to parent
  useEffect(() => {
    if (typeof ref === "function") ref(videoRef.current);
    else if (ref) ref.current = videoRef.current;
  });

  useEffect(() => {
    let stream;
    let cancelled = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => onReady?.();
        }
      } catch (err) {
        console.error("camera error", err);
        onReady?.(err);
      }
    })();
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="video-wrap">
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
});

export default Webcam;
