// client/src/components/layout/Footer.tsx
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="pt-12 pb-8 text-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.5 }}
        className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]"
      >
        Built using Replit by MidnytRaccoon and Gemini 3 with love &lt;3
      </motion.p>
    </footer>
  );
}