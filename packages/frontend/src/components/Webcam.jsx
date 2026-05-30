import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const Webcam = forwardRef(function Webcam({ onReady }, ref) {
  const videoRef = useRef(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useImperativeHandle(ref, () => videoRef.current, []);

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
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        video.onloadedmetadata = () => onReadyRef.current?.();
      } catch (err) {
        if (!cancelled) onReadyRef.current?.(err);
      }
    })();

    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="video-wrap">
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
});

export default Webcam;
