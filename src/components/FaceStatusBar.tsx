import { motion } from "framer-motion";
import { Sun, MoveHorizontal, Eye } from "lucide-react";
import type { FaceContext } from "@/hooks/useCamera";

interface FaceStatusBarProps {
  faceContext: FaceContext;
  isVisible: boolean;
}

export function FaceStatusBar({ faceContext, isVisible }: FaceStatusBarProps) {
  if (!isVisible) return null;

  const alerts: { icon: React.ReactNode; message: string }[] = [];

  if (!faceContext.isDetected) {
    alerts.push({ icon: <Eye size={11} />, message: "Show your face" });
  }
  if (faceContext.isTooClose) {
    alerts.push({ icon: <MoveHorizontal size={11} />, message: "Move back" });
  }
  if (faceContext.isTooFar) {
    alerts.push({ icon: <MoveHorizontal size={11} />, message: "Come closer" });
  }
  if (faceContext.lightingQuality === "low") {
    alerts.push({ icon: <Sun size={11} />, message: "More light" });
  }
  if (faceContext.lightingQuality === "bright") {
    alerts.push({ icon: <Sun size={11} />, message: "Too bright" });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-1 px-2 py-1 rounded-full surface-glass text-[10px] text-foreground/50"
        >
          {alert.icon}
          {alert.message}
        </motion.div>
      ))}
    </div>
  );
}
