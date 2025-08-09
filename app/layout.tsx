import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Youpdate — Daily News, personalized", description: "Your clean daily news, tailored to your interests." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" suppressHydrationWarning><body className="text-white antialiased">{children}</body></html>);
}
