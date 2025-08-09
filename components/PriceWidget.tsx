'use client';
import { useEffect, useMemo, useState } from 'react';

type Props = { onChange?: (p: { topics: number; perDay: number; }) => void; };

export default function PriceWidget({ onChange }: Props) {
  const [topics, setTopics] = useState(3);
  const [perDay, setPerDay] = useState(3);

  useEffect(() => { onChange?.({ topics, perDay }); }, [topics, perDay, onChange]);

  const price = useMemo(() => {
    const base = 4;
    const p = base + topics * 1.2 + perDay * 2.5;
    const discount = (topics >= 5 ? 0.08 : 0) + (perDay >= 5 ? 0.07 : 0);
    return Math.max(2, p * (1 - discount));
  }, [topics, perDay]);

  return (
    <div className="rounded-2xl border border-white/10 p-4 bg-white/5 backdrop-blur">
      <div className="flex items-center justify-between gap-6">
        <label className="flex-1">
          <div className="text-xs text-white/70 mb-1">Sujets suivis</div>
          <input type="range" min={1} max={8} value={topics}
                 onChange={(e)=>setTopics(parseInt(e.target.value))}
                 className="w-full" />
          <div className="text-sm mt-1">{topics}</div>
        </label>
        <label className="flex-1">
          <div className="text-xs text-white/70 mb-1">Actus par jour</div>
          <input type="range" min={1} max={8} value={perDay}
                 onChange={(e)=>setPerDay(parseInt(e.target.value))}
                 className="w-full" />
          <div className="text-sm mt-1">{perDay}</div>
        </label>
      </div>

      <div className="mt-4 text-center">
        <div className="text-xs text-white/60 mb-1">Prix estimé</div>
        <div className="text-3xl font-semibold tracking-tight">
          {price.toFixed(2)} €<span className="text-white/60 text-sm">/mois</span>
        </div>
        <div className="text-xs text-white/60 mt-1">Calculé en temps réel selon ta config.</div>
      </div>
    </div>
  );
}
