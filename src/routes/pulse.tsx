import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import ReactMarkdown from "react-markdown";
import { ArrowUp, Sparkles } from "lucide-react";
import { SwipeItShell } from "@/components/swipeit-shell";
import { PulseLogo } from "@/components/pulse-logo";

export const Route = createFileRoute("/pulse")({
  head: () => ({
    meta: [
      { title: "Pulse — Votre guide de découverte" },
      { name: "description", content: "Discutez avec Pulse, votre assistant IA de découverte SwipeIt." },
    ],
  }),
  component: PulsePage,
});

const suggestions = [
  "Un film cocooning pour ce soir ?",
  "Une idée de restaurant avec un petit budget",
  "Recommande-moi un jeu vidéo court",
  "Une série qui change du polar",
];

function PulsePage() {
  const [input, setInput] = useState("");
  const transport = useRef(new DefaultChatTransport({ api: "/api/chat" })).current;
  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === "submitted" || status === "streaming";
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (text: string) => {
    const value = text.trim();
    if (!value || isLoading) return;
    setInput("");
    await sendMessage({ text: value });
    inputRef.current?.focus();
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit(input);
  };

  return (
    <>
      {/* Purple → black gradient from top-right */}
      <div
        className="fixed inset-0 -z-10 bg-background"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 100% 0%, #8b5cf6 0%, #6d28d9 18%, #3b0764 42%, #0a0210 72%, #000000 100%)",
        }}
      />
      <SwipeItShell>
        <div className="flex min-h-screen flex-col px-4 pt-10 pb-40 sm:px-6">
          {/* Header */}
          <header className="flex items-center gap-3 animate-slide-up">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-white/10 ring-1 ring-white/20 backdrop-blur">
              <PulseLogo className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight text-white">Pulse</h1>
              <p className="text-xs text-white/60">Votre guide de découverte · en ligne</p>
            </div>
          </header>

          {/* Messages */}
          <div ref={scrollerRef} className="mt-6 flex-1 space-y-4 overflow-y-auto">
            {messages.length === 0 && (
              <div className="mx-auto max-w-md pt-10 text-center animate-fade-in">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                  <PulseLogo className="h-10 w-10 text-white animate-pulse-soft" />
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight text-white">
                  New way to discover.
                </h2>
                <p className="mt-2 text-sm text-white/70">
                  Dis-moi ton humeur, ton budget, une envie — je trouve la suite.
                </p>
                <div className="mt-6 grid gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => void submit(s)}
                      className="group flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-left text-sm text-white/90 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10"
                    >
                      <Sparkles className="h-4 w-4 shrink-0 text-purple-300" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                      <PulseLogo className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      isUser
                        ? "bg-white text-black"
                        : "bg-white/10 text-white ring-1 ring-white/15 backdrop-blur"
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{text}</p>
                    ) : (
                      <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5">
                        <ReactMarkdown>{text || "…"}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {status === "submitted" && (
              <div className="flex gap-2 animate-fade-in">
                <div className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                  <PulseLogo className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3 ring-1 ring-white/15 backdrop-blur">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={onSubmit}
            className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md md:bottom-28"
          >
            <div className="flex items-end gap-2 rounded-full bg-white/10 p-1.5 pl-5 ring-1 ring-white/20 backdrop-blur-xl">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submit(input);
                  }
                }}
                rows={1}
                placeholder="Une idée ? Un budget ?"
                className="flex-1 resize-none bg-transparent py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Envoyer"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-black transition disabled:opacity-40"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </SwipeItShell>
    </>
  );
}