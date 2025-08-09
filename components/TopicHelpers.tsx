export function suggestCombinedTopic(interests: string[]): string {
  const low = interests.map(s => s.trim().toLowerCase()).filter(Boolean);
  if (low.length === 0) return "Tendances du jour utiles";
  if (low.includes('sport') && low.includes('crypto')) return 'Airdrop NFT sportif';
  if (low.includes('startup') && low.includes('ia')) return 'Agent IA no-code pour PME';
  if (low.includes('finance') && low.includes('gaming')) return 'Tokens de jeux à dividendes';
  return `${low[0]} — ${low[1] ?? 'actualité transversale'}`;
}

export function scoreNiche(topic: string): number {
  const lengthScore = Math.min(100, Math.floor(topic.trim().length * 2.2));
  const hyphen = topic.includes('-') ? 10 : 0;
  return Math.min(100, lengthScore + hyphen);
}
