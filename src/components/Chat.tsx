import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { respond } from "../chat/script";
import CloseIcon from "./CloseButton";

type Message = {
  id: number;
  from: "bot" | "user";
  text: string;
};

const REPLY_DELAY = 500;

export default function Chat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typed, setTyped] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (event: SubmitEvent) => {
    event.preventDefault();
    const text = typed.trim();
    if (!text) return;
    setTyped("");
    setMessages((prev) => [...prev, { id: prev.length, from: "user", text }]);
    const answer = respond(text);
    if (!answer) return;
    timers.current.push(
      setTimeout(() => {
        setMessages((prev) => [...prev, { id: prev.length, from: "bot", text: answer }]);
      }, REPLY_DELAY),
    );
  };

  return (
    <section
      role="dialog"
      aria-labelledby="chat-title"
      className="fixed inset-0 z-30 flex flex-col bg-white text-slate-900 md:inset-auto md:top-32 md:right-6 md:h-[min(32rem,calc(100dvh-10rem))] md:w-96 md:rounded-2xl md:border md:border-slate-200 md:bg-white/95 md:shadow-2xl md:shadow-slate-900/20 md:backdrop-blur-sm"
    >
      <header className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:pt-3">
        <img
          src={`${import.meta.env.BASE_URL}couatl.png`}
          alt=""
          draggable={false}
          className="size-9 rounded-full border border-slate-200 bg-white object-contain p-0.5"
        />
        <h2 id="chat-title" className="min-w-0 flex-1 text-sm font-semibold tracking-tight">
          Xical
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:outline-none"
        >
          <CloseIcon />
        </button>
      </header>

      <div
        ref={listRef}
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed wrap-break-word ${
              message.from === "bot"
                ? "self-start rounded-bl-md bg-slate-100 text-slate-900"
                : "self-end rounded-br-md bg-slate-900 text-white"
            }`}
          >
            {message.text}
          </div>
        ))}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:pb-3"
      >
        <input
          ref={inputRef}
          type="text"
          value={typed}
          onChange={(event) => setTyped(event.target.value)}
          aria-label="Message"
          autoComplete="off"
          enterKeyHint="send"
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-base text-slate-900 shadow-sm transition-colors focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10 focus:outline-none md:text-sm"
        />
      </form>
    </section>
  );
}
