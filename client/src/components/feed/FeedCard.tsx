import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Play, Clock, BookOpen, Edit2 } from "lucide-react";
import type { ContentItem } from "@shared/schema";
import { useMarkSurfaced } from "@/hooks/use-content";

{/* 
  Dynamic images rule: we use thumbnailUrl from API if exists.
  If not, we use a beautiful gradient placeholder. 
*/}

interface FeedCardProps {
  item: ContentItem;
  onPlay: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
}

export function FeedCard({ item, onPlay, onEdit }: FeedCardProps) {
  const { ref, inView } = useInView({
    threshold: 0.6, // Trigger when 60% visible
    triggerOnce: true, // Only mark once per mount
  });

  const markSurfaced = useMarkSurfaced();

  useEffect(() => {
    if (inView) {
      markSurfaced.mutate(item.id);
    }
  }, [inView, item.id]);

  const isVideo = item.type === 'youtube' || item.type === 'tiktok' || item.type === 'video';

  return (
    <div 
      ref={ref} 
      className="w-full h-screen snap-start relative flex flex-col justify-end p-4 sm:p-6"
    >
      {/* Background Media/Image */}
      <div className="absolute inset-0 z-0 bg-background overflow-hidden">
        {item.thumbnailUrl ? (
          <img 
            src={item.thumbnailUrl} 
            alt={item.title}
            className="w-full h-full object-cover opacity-70 scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-slate-900 to-black" />
        )}
        {/* Dark gradient fade for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
      </div>

      {/* Edit Button - Bottom Left */}
      <button 
        onClick={() => onEdit(item)}
        className="absolute bottom-24 left-6 z-20 w-12 h-12 bg-black/20 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-90"
      >
        <Edit2 className="w-5 h-5" />
      </button>

      {/* Content Info */}
      <div className="relative z-10 w-full max-w-2xl mx-auto pb-24 sm:pb-20">
        
        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-semibold capitalize flex items-center gap-1.5 border border-white/10">
            {isVideo ? <Play className="w-3 h-3" /> : <BookOpen className="w-3 h-3" />}
            {item.type}
          </div>
          {item.estimatedMinutes && (
            <div className="bg-black/40 backdrop-blur-md text-white/80 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {item.estimatedMinutes}m
            </div>
          )}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${
            item.difficulty === 'deep' || item.difficulty === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
            item.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
            'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            {item.difficulty || 'light'}
          </div>
        </div>

        {/* Title & Author */}
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2 leading-tight">
          {item.title}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">
          {item.author || item.platformName || "Unknown Source"}
        </p>

        {/* Action Button */}
        <button
          onClick={() => onPlay(item)}
          className="w-full sm:w-auto px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-3 shadow-xl"
        >
          {isVideo ? (
            <>
              <Play className="w-5 h-5 fill-current" />
              Start Watching
            </>
          ) : (
            <>
              <BookOpen className="w-5 h-5" />
              Start Reading
            </>
          )}
        </button>

      </div>
    </div>
  );
}
