import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { X, Trophy, ArrowRight } from "lucide-react";
import type { ContentItem } from "@shared/schema";
import { useUpdateContent } from "@/hooks/use-content";

interface CompletionModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CompletionModal({ item, isOpen, onClose }: CompletionModalProps) {
  const [note, setNote] = useState("");
  const updateContent = useUpdateContent();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti
      const end = Date.now() + 1.5 * 1000;
      const colors = ['#4F46E5', '#D946EF', '#10B981'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    } else {
      setNote(""); // Reset on close
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!item) return;
    updateContent.mutate(
      { 
        id: item.id, 
        status: 'completed', 
        progressPercent: 100,
        userNote: note,
        dateCompleted: new Date()
      },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-card w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10 relative overflow-hidden"
        >
          {/* Decorative background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/30 blur-[60px] rounded-full pointer-events-none" />

          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center relative z-10 mt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20 rotate-12">
              <Trophy className="w-8 h-8 text-white -rotate-12" />
            </div>
            
            <h2 className="text-2xl font-display font-bold text-white mb-2">
              +150 XP Earned!
            </h2>
            <p className="text-muted-foreground mb-6">
              You just leveled up your brain. Cement it by writing one thing you learned.
            </p>

            <div className="text-left mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                What's your biggest takeaway?
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="I learned that..."
                className="w-full bg-background border border-border rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-32 resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={updateContent.isPending}
              className="w-full py-4 rounded-xl font-bold text-lg bg-white text-black hover:bg-slate-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {updateContent.isPending ? "Saving..." : "Lock it in"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
