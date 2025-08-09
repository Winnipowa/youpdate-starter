'use client';
import { useCallback, useMemo, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Typewriter from './Typewriter';
import PriceWidget from './PriceWidget';
import { suggestCombinedTopic, scoreNiche } from './TopicHelpers';

type Payload = {
  email: string;
  interests: string;
  topics: string[];
  perDay: number;
  ui_price_preview: number;
};

const DEFAULT_TOPICS = [
  "IA & productivité",
  "Crypto & airdrops",
  "Startups & growth",
  "Gaming & nouveautés",
  "Santé & performance"
];

export default function N8NForm() {
  const [email, setEmail] = useState('');
  const [interests, setInterests] = useState('sport, crypto, IA');
  const [topics, setTopics] = useState<string[]>(["IA & productivité", "Crypto & airdrops"]);
  const [perDay, setPerDay] = useState(3);
  const [pricePreview, setPricePreview] = useState(0);
  const [sending, setSending] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);

  const n8nUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ?? process.env.N8N_WEBHOOK_URL ?? '';

  const runningTopics = useMemo(() => topics.length ? topics : DEFAULT_TOPICS.slice(0,2), [topics]);

  const addComboTopic = useCallback(() => {
    const combined = suggestCombinedTopic(interests.split(','));
    setTopics((t) => Array.from(new Set([...t, combined])).slice(0, 8));
  }, [interests]);

  const nicheHint = useMemo(() => {
    const maxScore = topics.reduce((m,t)=>Math.max(m, scoreNiche(t)), 0);
    return maxScore >= 60;
  }, [topics]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setServerMsg(null);
    try {
      const payload: Payload = { email, interests, topics, perDay, ui_price_preview: pricePreview };
      console.log("[Youpdate] sending to N8N:", payload, "→", n8nUrl);
      const res = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      console.log("[Youpdate] response:", res.status, text);
      setServerMsg(res.ok ? "✅ Envoyé ! Tu recevras tes Youpdates bientôt." : `❌ Erreur ${res.status}: ${text}`);
    } catch (err: any) {
      console.error("[Youpdate] error:", err);
      setServerMsg("❌ Erreur réseau. Regarde la console pour les détails.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <div className="text-xs text-white/70 mb-2">Sujets possibles</div>
        <div className="rounded-2xl border border-white/10 p-4 bg-white/5">
          <Typewriter items={runningTopics} typingDelay={35} pauseMs={1000} eraseFactor={2} />
        </div>
        {nicheHint && (
          <div className="mt-2 inline-flex items-center gap-2 text-amber-300/90 text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
            Sujet très niché détecté — impact possible sur la fréquence.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-xs text-white/70 mb-1">Ton email</div>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required
                 placeholder="toi@exemple.com"
                 className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-brand-violet" />
        </label>
        <label className="block">
          <div className="text-xs text-white/70 mb-1">Centres d’intérêt (séparés par des virgules)</div>
          <input type="text" value={interests} onChange={(e)=>setInterests(e.target.value)}
                 placeholder="ex: sport, crypto, IA"
                 className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:border-brand-violet" />
        </label>
      </div>

      <div>
        <div className="text-xs text-white/70 mb-2">Tes sujets</div>
        <div className="flex flex-wrap gap-2">
          {topics.map((t, i)=>(
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 text-sm">{t}</span>
          ))}
          <button type="button" onClick={addComboTopic}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/20 hover:bg-brand-violet/30 border border-brand-violet/40 text-sm transition">
            <Sparkles size={16}/> Proposer un sujet
          </button>
        </div>
      </div>

      <PriceWidget onChange={({topics: t, perDay: p}) => { setPerDay(p); setPricePreview(t + p); }}/>

      <div className="pt-2">
        <button disabled={sending}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-violet hover:bg-brand-violet/90 transition text-white font-medium">
          {sending ? (<><Loader2 className="animate-spin" size={18}/> Envoi…</>) : "S’abonner à mes Youpdates"}
        </button>
        {serverMsg && <div className="mt-3 text-sm">{serverMsg}</div>}
      </div>
    </form>
  );
}
