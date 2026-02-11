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
    alerts.push({ icon: <Eye size={12} />, message: "Show your face" });
  }
  if (faceContext.isTooClose) {
    alerts.push({ icon: <MoveHorizontal size={12} />, message: "Move back" });
  }
  if (faceContext.isTooFar) {
    alerts.push({ icon: <MoveHorizontal size={12} />, message: "Come closer" });
  }
  if (faceContext.lightingQuality === "low") {
    alerts.push({ icon: <Sun size={12} />, message: "More light" });
  }
  if (faceContext.lightingQuality === "bright") {
    alerts.push({ icon: <Sun size={12} />, message: "Too bright" });
  }

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute top-3 right-3 flex flex-col gap-1"
    >
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] text-foreground/60 surface-glass"
        >
          {alert.icon}
          {alert.message}
        </motion.div>
      ))}
    </motion.div>
  );
}
