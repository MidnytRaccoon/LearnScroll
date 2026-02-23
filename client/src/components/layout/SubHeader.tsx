import { motion } from "framer-motion";

type FocusLevel = 'low' | 'medium' | 'high' | undefined;

interface SubHeaderProps {
  activeFocus: FocusLevel;
  onFocusChange: (focus: FocusLevel) => void;
}

export function SubHeader({ activeFocus, onFocusChange }: SubHeaderProps) {
  const levels = [
    { id: 'low', label: 'Chill', emoji: '☕️', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { id: 'medium', label: 'Flow', emoji: '🌊', color: 'text-amber-400', bg: 'bg-amber-400/10' },
    { id: 'high', label: 'Deep', emoji: '🧠', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  ] as const;

  return (
    <div className="fixed top-[64px] left-0 right-0 z-40 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar mask-edges">
      <button
        onClick={() => onFocusChange(undefined)}
        className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
          activeFocus === undefined 
            ? 'bg-white text-black' 
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        For You
      </button>
      
      {levels.map((level) => {
        const isActive = activeFocus === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onFocusChange(level.id as FocusLevel)}
            className={`px-4 py-1.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-1.5 ${
              isActive 
                ? `${level.bg} ${level.color} ring-1 ring-current` 
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <span>{level.emoji}</span>
            {level.label}
          </button>
        );
      })}
    </div>
  );
}
