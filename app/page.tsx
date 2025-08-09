'use client';
import { motion } from "framer-motion";
import ComfortPhrases from "@/components/ComfortPhrases";
import YoupdateForm from "@/components/YoupdateForm";

export default function Page() {
  return (
    <main className="min-h-screen px-5 md:px-10 py-10">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Youpdate</h1>
          {/* On garde la petite phrase aléatoire */}
          <div className="mt-4"><ComfortPhrases /></div>
        </motion.div>

        <YoupdateForm />

        <footer className="mt-16 text-xs text-white/40 text-center">
          <a className="underline">Important Info (soon)</a>
          <div className="mt-2">© {new Date().getFullYear()} Youpdate.</div>
        </footer>
      </div>
    </main>
  );
}
