import { useRef, useEffect, useState, useCallback } from "react";

export interface FaceContext {
  isDetected: boolean;
  isTooClose: boolean;
  isTooFar: boolean;
  isOffCenter: boolean;
  headTilt: "none" | "left" | "right";
  lightingQuality: "good" | "low" | "bright";
  facePosition: { x: number; y: number } | null;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isStreaming: boolean;
  faceContext: FaceContext;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  error: string | null;
}

const DEFAULT_FACE_CONTEXT: FaceContext = {
  isDetected: false,
  isTooClose: false,
  isTooFar: false,
  isOffCenter: false,
  headTilt: "none",
  lightingQuality: "good",
  facePosition: null,
};

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null!);
  const canvasRef = useRef<HTMLCanvasElement>(null!);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number>(0);
  const [isStreaming, setIsStreaming] = useState(false);
  const [faceContext, setFaceContext] = useState<FaceContext>(DEFAULT_FACE_CONTEXT);
  const [error, setError] = useState<string | null>(null);

  const drawOverlays = useCallback((canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw face guide overlay
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const ovalW = canvas.width * 0.32;
    const ovalH = canvas.height * 0.45;

    // Face guide oval
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - 20, ovalW, ovalH, 0, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(183, 110, 121, 0.4)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Blush zone indicators
    const blushY = centerY + 10;
    const blushOffsetX = ovalW * 0.55;
    
    // Left cheek blush zone
    ctx.beginPath();
    ctx.ellipse(centerX - blushOffsetX, blushY, ovalW * 0.22, ovalH * 0.15, -0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232, 196, 196, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 196, 196, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Right cheek blush zone
    ctx.beginPath();
    ctx.ellipse(centerX + blushOffsetX, blushY, ovalW * 0.22, ovalH * 0.15, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(232, 196, 196, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 196, 196, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Contour lines
    ctx.beginPath();
    ctx.moveTo(centerX - ovalW * 0.85, centerY - ovalH * 0.3);
    ctx.quadraticCurveTo(centerX - ovalW * 0.9, centerY + ovalH * 0.1, centerX - ovalW * 0.7, centerY + ovalH * 0.5);
    ctx.strokeStyle = "rgba(212, 165, 116, 0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + ovalW * 0.85, centerY - ovalH * 0.3);
    ctx.quadraticCurveTo(centerX + ovalW * 0.9, centerY + ovalH * 0.1, centerX + ovalW * 0.7, centerY + ovalH * 0.5);
    ctx.strokeStyle = "rgba(212, 165, 116, 0.2)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Eye guide dots
    const eyeY = centerY - ovalH * 0.15;
    const eyeSpacing = ovalW * 0.38;
    
    [centerX - eyeSpacing, centerX + eyeSpacing].forEach(ex => {
      ctx.beginPath();
      ctx.ellipse(ex, eyeY, ovalW * 0.15, ovalH * 0.06, 0, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(183, 110, 121, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Lip guide
    ctx.beginPath();
    const lipY = centerY + ovalH * 0.4;
    ctx.moveTo(centerX - ovalW * 0.18, lipY);
    ctx.quadraticCurveTo(centerX, lipY - 6, centerX + ovalW * 0.18, lipY);
    ctx.quadraticCurveTo(centerX, lipY + 10, centerX - ovalW * 0.18, lipY);
    ctx.strokeStyle = "rgba(183, 110, 121, 0.25)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Simulate face detection with basic video analysis
    if (video.videoWidth > 0) {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = 4;
      tempCanvas.height = 4;
      const tempCtx = tempCanvas.getContext("2d");
      if (tempCtx) {
        tempCtx.drawImage(video, 0, 0, 4, 4);
        const imageData = tempCtx.getImageData(0, 0, 4, 4);
        const pixels = imageData.data;
        let totalBrightness = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          totalBrightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        }
        const avgBrightness = totalBrightness / (pixels.length / 4);

        setFaceContext({
          isDetected: true,
          isTooClose: false,
          isTooFar: false,
          isOffCenter: false,
          headTilt: "none",
          lightingQuality: avgBrightness < 50 ? "low" : avgBrightness > 200 ? "bright" : "good",
          facePosition: { x: centerX, y: centerY },
        });
      }
    }
  }, []);

  const renderLoop = useCallback(() => {
    if (videoRef.current && canvasRef.current && isStreaming) {
      drawOverlays(canvasRef.current, videoRef.current);
    }
    animationRef.current = requestAnimationFrame(renderLoop);
  }, [isStreaming, drawOverlays]);

  useEffect(() => {
    if (isStreaming) {
      animationRef.current = requestAnimationFrame(renderLoop);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isStreaming, renderLoop]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsStreaming(true);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions to use the makeup coach.");
      console.error("Camera error:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
    setFaceContext(DEFAULT_FACE_CONTEXT);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return { videoRef, canvasRef, isStreaming, faceContext, startCamera, stopCamera, error };
}
