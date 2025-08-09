"use client";
import { useEffect, useState } from "react";

type Props = {
  items: string[];
  typingDelay?: number;
  pauseMs?: number;
  eraseFactor?: number;
  showCursor?: boolean; // optionnel
};

export default function Typewriter({
  items,
  typingDelay = 40,
  pauseMs = 1000,
  eraseFactor = 2,
  showCursor = false, // pas de curseur pour éviter la double barre
}: Props) {
  const [display, setDisplay] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!items?.length) return;
    const current = items[index];

    if (!deleting && subIndex === current.length + 1) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % items.length);
      return;
    }

    const t = setTimeout(() => {
      setSubIndex((s) => s + (deleting ? -1 : 1));
      setDisplay(current.substring(0, subIndex));
    }, deleting ? typingDelay / eraseFactor : typingDelay);

    return () => clearTimeout(t);
  }, [items, index, subIndex, deleting, typingDelay, pauseMs, eraseFactor]);

  return <span className={showCursor ? "type-cursor" : ""}>{display}</span>;
}
