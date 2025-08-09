'use client';
import { useEffect, useState } from 'react';
const PHRASES=[
  "Breathe. A small step every day is enough.",
  "You don’t need to be perfect, just consistent.",
  "You are exactly where you should be.",
  "Today, move with clarity and ease.",
  "Your future self already thanks you."
];
export default function ComfortPhrases(){
  const [p,setP]=useState<string>(''); useEffect(()=>{ setP(PHRASES[Math.floor(Math.random()*PHRASES.length)]); },[]);
  return <div className="text-sm text-white/70">{p || "\u00A0"}</div>;
}
