"use client";
import { useMemo, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus } from "lucide-react";

const Typewriter = dynamic(() => import("@/components/Typewriter"), { ssr: false });

type Unit = "Days" | "Week";
type Delivery = "Telegram" | "Email";

type Search = {
  unit: Unit;
  topic: string;
  delivery: Delivery;
};

const EXAMPLES = [
  "Football",
  "AI",
  "world finances",
  "Space Exploration",
  "MMA fights",
  "TikTok trends",
  "Crypto Meme Coins",
  "Nvidia product releases",
  "Rolex Daytona auction",
  "Bitcoin invest opportunity",
  "Netflix Series review",
];

// bornes de largeur (px) pour la box "about …"
const MIN_W = 260;
const PADDING = 30; // marge visuelle à droite

export default function YoupdateForm() {
  // lignes visibles
  const [searches, setSearches] = useState<Search[]>([
    { unit: "Week", topic: "", delivery: "Email" },
  ]);

  // placeholder animé actif tant que le champ est vide et pas focus
  const [placeholderActive, setPlaceholderActive] = useState<Record<number, boolean>>({ 0: true });

  // largeur dynamique par ligne
  const [widths, setWidths] = useState<Record<number, number>>({ 0: MIN_W });
  const measurersRef = useRef<Record<number, HTMLSpanElement | null>>({});
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // refs d’inputs pour focus sur clic placeholder
  const inputsRef = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    setSearches((prev) =>
      prev.map((s) => ({
        ...s,
        delivery: s.delivery === "Telegram" || s.delivery === "Email" ? s.delivery : "Email",
      }))
    );
  }, []);

  const setMeasurer =
    (i: number) =>
    (el: HTMLSpanElement | null) => {
      measurersRef.current[i] = el;
      requestAnimationFrame(() => recalcWidth(i, searches[i]?.topic ?? ""));
    };

  const recalcWidth = (i: number, text: string) => {
    const measurer = measurersRef.current[i];
    if (!measurer) return;
    measurer.textContent = (text && text.length > 0 ? text : EXAMPLES[0]) + " ";
    const raw = measurer.offsetWidth + PADDING;
    const clamped = Math.max(raw, MIN_W);
    setWidths((prev) => (prev[i] === clamped ? prev : { ...prev, [i]: clamped }));
  };

  // modal contact
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [sending, setSending] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const n8nUrl =
    process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ??
    process.env.N8N_WEBHOOK_URL ??
    "";

  // prix: base + par ligne Daily/Weekly
  const perDayCount = useMemo(() => searches.filter((s) => s.unit === "Days").length, [searches]);
  const perWeekCount = useMemo(() => searches.filter((s) => s.unit === "Week").length, [searches]);
  const price = useMemo(() => {
    const base = 4;
    return Math.max(2, base + perDayCount * 2.5 + perWeekCount * 1.2);
  }, [perDayCount, perWeekCount]);

  // helpers lignes
  const updateSearch = (i: number, patch: Partial<Search>) => {
    setSearches((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const addSearch = () => {
    const idx = searches.length;
    setSearches((prev) => [...prev, { unit: "Week", topic: "", delivery: "Email" }]);
    setPlaceholderActive((prev) => ({ ...prev, [idx]: true }));
    setWidths((prev) => ({ ...prev, [idx]: MIN_W }));
  };

  const removeSearch = (i: number) => {
    setSearches((prev) => prev.filter((_, idx) => idx !== i));
    setPlaceholderActive((prev) => {
      const copy = { ...prev };
      delete copy[i];
      return copy;
    });
    setWidths((prev) => {
      const copy = { ...prev };
      delete copy[i];
      return copy;
    });
  };

  // Smart insight → ajoute une vraie ligne (pas de chip)
  const addSmartInsightLine = () => {
    if (searches.some((s) => s.topic.trim().toLowerCase() === "smart insight")) return;
    const base = searches[0] ?? { unit: "Week" as Unit, delivery: "Email" as Delivery, topic: "" };
    const idx = searches.length;
    setSearches((prev) => [...prev, { unit: base.unit, delivery: base.delivery, topic: "smart insight" }]);
    setPlaceholderActive((prev) => ({ ...prev, [idx]: false }));
    setWidths((prev) => ({ ...prev, [idx]: MIN_W }));
  };

  // abonnement
  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setModalOpen(true);
  };

  const actuallySend = async () => {
    setSending(true);
    setServerMsg(null);
    try {
      const payload = {
        searches: searches.map((s) => ({
          cadence_unit: s.unit,
          delivery: s.delivery,
          topic: s.topic.trim(),
        })),
        contact: { email, telegram },
        ui_price_preview: Number(price.toFixed(2)),
      };
      const res = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      setServerMsg(
        res.ok ? "✅ Subscribed! You’ll start receiving your Youpdates." : `❌ Error ${res.status}: ${text}`
      );
      if (res.ok) setModalOpen(false);
    } catch (err: any) {
      setServerMsg("❌ Network error. Check console for details.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto w-auto">
      <div className="inline-block bg-white/5 p-6 md:p-7 rounded-3xl border border-white/10 space-y-4">
        {/* === LIGNES === */}
        {searches.map((s, i) => (
          <div key={i} className="text-lg md:text-xl font-medium whitespace-nowrap flex items-center gap-2">
            <span className="text-white/80">I want news every</span>
            <select
              value={s.unit}
              onChange={(e) => updateSearch(i, { unit: e.target.value as Unit })}
              className="rounded-lg bg-white/10 border border-white/20 px-2 py-1"
            >
              <option value="Days">Days</option>
              <option value="Week">Weeks</option>
            </select>

            <span className="text-white/80">about</span>

            {/* Smart insight sur une ligne dédiée, sinon rendu normal */}
            {s.topic.trim().toLowerCase() === "smart insight" ? (
              <div className="w-full flex items-center gap-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-violet/25 border border-brand-violet/40">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
                    <path fill="currentColor" d="M12 2a6 6 0 0 1 6 6c0 3-2 3.8-2 6H8c0-2.2-2-3-2-6a6 6 0 0 1 6-6Zm-3 16h6v2H9v-2Zm1 3h4v1H10v-1Z"/>
                  </svg>
                  Smart insight
                </span>
                <button
                  type="button"
                  onClick={() => removeSearch(i)}
                  className="ml-2 text-white/80 hover:text-white font-bold text-lg"
                  title="Remove this line"
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                {/* Mesureur invisible (miroir) */}
                <span
                  ref={setMeasurer(i)}
                  className="invisible absolute whitespace-pre"
                  style={{ position: "absolute", left: -99999, top: -99999 }}
                />

                {/* Box visible avec largeur dynamique */}
                <span
                  className="relative rounded-xl border border-white/15 bg-white/5 px-3 py-1 text-white/60 cursor-text"
                  style={{
                    display: "inline-block",
                    width: `${widths[i] ?? MIN_W}px`,
                    minHeight: 40,
                    transition: "width 0.12s ease-out",
                  }}
                  onClick={() => {
                    setFocusedIndex(i);
                    setPlaceholderActive((p) => ({ ...p, [i]: false }));
                    inputsRef.current[i]?.focus();
                  }}
                >
                  {/* placeholder cliquable */}
                  {!s.topic && focusedIndex !== i && placeholderActive[i] && (
                    <span
                      className="absolute inset-0 px-3 py-1 text-white/60 cursor-text"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setFocusedIndex(i);
                        setPlaceholderActive((p) => ({ ...p, [i]: false }));
                        inputsRef.current[i]?.focus();
                      }}
                    >
                      <Typewriter
                        items={EXAMPLES}
                        typingDelay={35}
                        pauseMs={1000}
                        eraseFactor={2}
                        showCursor={false}
                      />
                    </span>
                  )}

                  <input
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    type="text"
                    value={s.topic}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateSearch(i, { topic: val });
                      recalcWidth(i, val);
                    }}
                    onFocus={() => {
                      setFocusedIndex(i);
                      setPlaceholderActive((p) => ({ ...p, [i]: false }));
                    }}
                    onBlur={() => {
                      setFocusedIndex(null);
                      setPlaceholderActive((p) => ({ ...p, [i]: !(s.topic ?? "").trim() }));
                    }}
                    className={
                      "bg-transparent outline-none px-0 w-full text-white " +
                      (placeholderActive[i] && !s.topic ? "input-caret-transparent" : "input-caret-white")
                    }
                  />
                </span>

                <span className="text-white/80">via</span>
                <select
                  value={s.delivery}
                  onChange={(e) => updateSearch(i, { delivery: e.target.value as Delivery })}
                  className="rounded-lg bg-white/10 border border-white/20 px-2 py-1"
                >
                  <option value="Telegram">Telegram</option>
                  <option value="Email">Email</option>
                </select>

                {searches.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSearch(i)}
                    className="ml-2 text-white/80 hover:text-white font-bold text-lg"
                    title="Remove this line"
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Actions (Smart insight ajoute une vraie ligne) */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={addSearch}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 transition"
            title="Add a new full search line"
          >
            <Plus size={16} /> New search
          </button>

          <button
            type="button"
            onClick={addSmartInsightLine}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-violet/25 hover:bg-brand-violet/40 border border-brand-violet/40 transition"
            title="Add a Smart insight line"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90">
              <path fill="currentColor" d="M12 2a6 6 0 0 1 6 6c0 3-2 3.8-2 6H8c0-2.2-2-3-2-6a6 6 0 0 1 6-6Zm-3 16h6v2H9v-2Zm1 3h4v1H10v-1Z"/>
            </svg>
            Smart insight
          </button>
        </div>

        {/* Subscribe + prix */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-2">
          <form onSubmit={onSubscribe}>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet/90 transition text-white font-medium">
              Subscribe
            </button>
          </form>

          <div className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {price.toFixed(2)} €<span className="text-white/60 text-base">/month</span>
          </div>
        </div>
      </div>

      {/* Modal contact */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#111318] border border-white/10 p-5">
            <h3 className="text-lg font-semibold">Finish your subscription</h3>
            <p className="text-sm text-white/60 mt-1">
              We’ll send your Youpdates to your preferred channel.
            </p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <div className="text-xs text-white/70 mb-1">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-brand-violet input-caret-white"
                />
              </label>

              {searches.some((s) => s.delivery === "Telegram") && (
                <label className="block">
                  <div className="text-xs text-white/70 mb-1">Telegram @username</div>
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@yourhandle"
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-brand-violet input-caret-white"
                  />
                </label>
              )}
            </div>

            {serverMsg && <div className="mt-3 text-sm">{serverMsg}</div>}

            <div className="mt-5 flex items-center gap-2 justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-white/15 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={actuallySend}
                disabled={sending || (!email && searches.every((s) => s.delivery === "Email"))}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-violet hover:bg-brand-violet/90 transition"
              >
                {sending ? "Sending…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
