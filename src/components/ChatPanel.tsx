import { forwardRef, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

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
    const recentMessages = messages.slice(-6);

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    return (
      <div ref={ref} className="flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex flex-col gap-2.5 flex-1 overflow-y-auto px-0.5 py-1 scroll-smooth"
        >
          <AnimatePresence mode="sync">
            {recentMessages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${messages.length - recentMessages.length + i}`}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.03 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-[13px] leading-[1.6] ${
                    msg.role === "user" ? "bubble-user" : "bubble-ai"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&_strong]:text-rose-soft [&_em]:text-gold-soft">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="m-0 text-foreground/80">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-start"
            >
              <div className="bubble-ai px-4 py-3">
                <div className="flex items-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-rose-soft/60"
                      animate={{
                        y: [0, -4, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.12,
                        ease: "easeInOut",
                      }}
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
              className="text-[11px] text-destructive/60 text-center py-1.5"
            >
              {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);
