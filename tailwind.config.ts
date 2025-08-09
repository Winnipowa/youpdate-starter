import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
theme:{extend:{colors:{brand:{violet:"#7c3aed"}},animation:{slowfade:"slowfade 8s ease-in-out infinite"},keyframes:{slowfade:{"0%,100%":{opacity:.5},"50%":{opacity:1}}}}},plugins:[] } satisfies Config;
