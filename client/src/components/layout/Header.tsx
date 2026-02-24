// client/src/components/layout/Header.tsx
import { Flame, Star, Plus } from "lucide-react";
import { useUserStats } from "@/hooks/use-stats";
import { motion } from "framer-motion";
import logo from "./LearnscrollFull.svg";

interface HeaderProps {
  onAddClick: () => void;
}

export function Header({ onAddClick }: HeaderProps) {
  const { data: stats } = useUserStats();

  return (
<header className="fixed top-0 left-0 right-0 z-50 glass-panel px-4 py-3 flex items-center justify-between">
      {/* 1. Logo on the far left */}
      <div className="flex items-center">
        <img 
          // 2. Use the imported variable here
          src={logo}
          alt="Learnscroll Logo" 
          className="h-8 w-auto"
        />
      </div>

      {/* 2. Stats and Add Button on the far right */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Streak Badge */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1.5 rounded-full font-bold border border-orange-500/20"
        >
          <Flame className="w-4 h-4 fill-current" />
          <span className="text-sm">{stats?.currentStreak || 0}</span>
        </motion.div>

        {/* XP Badge */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1.5 bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-full font-bold border border-indigo-500/20"
        >
          <Star className="w-4 h-4 fill-current" />
          <span className="text-sm">{stats?.xpTotal || 0} XP</span>
        </motion.div>

        {/* Add Button */}
        <button
          onClick={onAddClick}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 hover:scale-105 active:scale-95 transition-all ml-1"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}