import { forwardRef, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import suzzyIcon from "@/assets/suzzy-icon.png";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export const ChatPanel = forwardRef<HTMLDivElement, ChatPanelProps>(
  function ChatPanel({ messages, isLoading, error }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const recentMessages = messages.slice(-8);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    return (
      <div ref={ref} className="flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex flex-col gap-3 flex-1 overflow-y-auto px-1 py-1 scroll-smooth"
        >
          <AnimatePresence mode="sync">
            {recentMessages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${messages.length - recentMessages.length + i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20 flex-shrink-0 mt-1">
                    <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary/15 text-foreground/90 rounded-br-sm"
                      : "glass-panel text-foreground rounded-bl-sm"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="m-0">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 justify-start"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-primary/20 flex-shrink-0 mt-1">
                <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
              </div>
              <div className="glass-panel px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/60"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-destructive/80 text-center px-4 py-2 glass-panel rounded-lg"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);
