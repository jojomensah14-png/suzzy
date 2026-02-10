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

    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, [messages, isLoading]);

    return (
      <div ref={ref} className="flex flex-col h-full">
        <div
          ref={scrollRef}
          className="flex flex-col gap-3.5 flex-1 overflow-y-auto px-1 py-1 scroll-smooth"
        >
          <AnimatePresence mode="sync">
            {recentMessages.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${messages.length - recentMessages.length + i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/25 flex-shrink-0 mt-1 shadow-luxury">
                    <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "glossy-bubble-user rounded-br-lg"
                      : "glossy-bubble rounded-bl-lg"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm prose-invert max-w-none [&>p]:m-0 [&_strong]:text-primary/90">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="m-0 text-foreground/90">{msg.content}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5 justify-start"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-primary/25 flex-shrink-0 mt-1 shadow-luxury">
                <img src={suzzyIcon} alt="Suzzy" className="w-full h-full object-cover" />
              </div>
              <div className="glossy-bubble px-4 py-3.5 rounded-bl-lg">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-primary/70"
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
              className="text-xs text-destructive/80 text-center px-4 py-2.5 glossy-bubble rounded-xl"
            >
              ⚠️ {error}
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);
