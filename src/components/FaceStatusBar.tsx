import { motion } from "framer-motion";
import { AlertTriangle, Sun, MoveHorizontal, Eye } from "lucide-react";
import type { FaceContext } from "@/hooks/useCamera";

interface FaceStatusBarProps {
  faceContext: FaceContext;
  isVisible: boolean;
}

export function FaceStatusBar({ faceContext, isVisible }: FaceStatusBarProps) {
  if (!isVisible) return null;

  const alerts: { icon: React.ReactNode; message: string; type: "warn" | "info" }[] = [];

  if (!faceContext.isDetected) {
    alerts.push({ icon: <Eye size={14} />, message: "Position your face in the frame", type: "info" });
  }
  if (faceContext.isTooClose) {
    alerts.push({ icon: <MoveHorizontal size={14} />, message: "Move back slightly", type: "warn" });
  }
  if (faceContext.isTooFar) {
    alerts.push({ icon: <MoveHorizontal size={14} />, message: "Come a bit closer", type: "warn" });
  }
  if (faceContext.lightingQuality === "low") {
    alerts.push({ icon: <Sun size={14} />, message: "More light needed", type: "warn" });
  }
  if (faceContext.lightingQuality === "bright") {
    alerts.push({ icon: <Sun size={14} />, message: "Lighting too bright", type: "info" });
  }

  if (alerts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 right-4 flex flex-col gap-1.5"
    >
      {alerts.map((alert, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-md ${
            alert.type === "warn"
              ? "bg-accent/15 text-accent border border-accent/20"
              : "bg-secondary/60 text-muted-foreground border border-border/30"
          }`}
        >
          {alert.icon}
          {alert.message}
        </motion.div>
      ))}
    </motion.div>
  );
}
