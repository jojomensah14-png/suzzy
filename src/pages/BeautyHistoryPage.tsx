import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
}

export default function BeautyHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setSessions((data as ChatSession[]) || []);
        setLoading(false);
      });
  }, [user]);

  const deleteSession = async (id: string) => {
    await supabase.from("chat_sessions").delete().eq("id", id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-app px-6 py-8 relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-100 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, hsl(350 40% 55% / 0.05) 0%, transparent 70%)" }}
      />

      <motion.div
        className="max-w-md mx-auto relative z-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full surface-glass flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={15} />
        </button>

        <h1 className="font-display text-3xl text-gradient-rose mb-2">Beauty History</h1>
        <p className="text-sm text-muted-foreground mb-8">Your past sessions with Suzzy.</p>

        {loading ? (
          <div className="text-center text-sm text-muted-foreground/40 py-12">Loading…</div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={32} className="mx-auto text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground/40">No sessions yet. Start chatting with Suzzy!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="surface-glass rounded-xl px-4 py-3 flex items-center justify-between group"
              >
                <div>
                  <p className="text-sm text-foreground/80">{session.title}</p>
                  <p className="text-[10px] text-muted-foreground/40">
                    {format(new Date(session.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="opacity-0 group-hover:opacity-100 text-destructive/40 hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
