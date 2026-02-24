// client/src/components/feed/FeedCard.tsx
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Play, Clock, BookOpen, Edit2, Trash2, Loader2, ArrowBigUp, ArrowBigDown } from "lucide-react";
import type { ContentItem } from "@shared/schema";
import { useMarkSurfaced, useDeleteContent } from "@/hooks/use-content";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface FeedCardProps {
  item: ContentItem;
  onPlay: (item: ContentItem) => void;
  onEdit: (item: ContentItem) => void;
}

export function FeedCard({ item, onPlay, onEdit }: FeedCardProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteContent();
  const markSurfaced = useMarkSurfaced();

  // PRIORITIZE: Manual Display Image > Auto-Extracted Thumbnail
  const displayImg = item.displayImageUrl || item.thumbnailUrl;

  const rateMutation = useMutation({
    mutationFn: async (delta: number) => {
      const res = await fetch(`/api/content/${item.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) throw new Error("Failed to update priority");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    }
  });

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      markSurfaced.mutate(item.id);
    }
  }, [inView, item.id]);

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this dopamine hit?")) {
      deleteMutation.mutate(item.id);
    }
  };

  const isVideo = item.type === 'youtube' || item.type === 'tiktok' || item.type === 'video';

  return (
    <div 
      ref={ref} 
      className="bg-card border border-white/10 rounded-3xl overflow-hidden shadow-xl transition-all hover:border-white/20"
    >
      {/* 1. Header: Source & Options */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            {isVideo ? <Play className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-tight">
              {item.author || item.platformName || "Discovery Source"}
            </p>
            <p className="text-xs text-muted-foreground">
               {item.estimatedMinutes}m • {item.difficulty || 'light'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-1">
          <button onClick={() => onEdit(item)} className="p-2 text-muted-foreground hover:text-white transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} disabled={deleteMutation.isPending} className="p-2 text-muted-foreground hover:text-red-400 transition-colors">
            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Media Section (Updated to use displayImg) */}
      <div 
        onClick={() => onPlay(item)}
        className="relative aspect-video bg-slate-900 cursor-pointer group overflow-hidden"
      >
        {displayImg ? (
          <img 
            src={displayImg} 
            alt={item.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-black flex items-center justify-center">
             <span className="text-white/20 font-display font-bold text-4xl">LEARN</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
                <Play className="w-6 h-6 text-white fill-current" />
            </div>
        </div>
      </div>

      {/* 3. Footer: Text, Votes & CTA */}
      <div className="p-5">
        <h3 className="text-xl font-display font-bold text-white mb-4 leading-tight line-clamp-2">
          {item.title}
        </h3>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 bg-secondary/30 rounded-full px-2 py-1 border border-white/5">
                <button onClick={() => rateMutation.mutate(1)} className="p-1 hover:text-orange-500 transition-colors">
                  <ArrowBigUp className={`w-5 h-5 ${item.priority > 0 ? 'fill-orange-500 text-orange-500' : ''}`} />
                </button>
                <span className="text-sm font-bold min-w-[1.2rem] text-center">{item.priority}</span>
                <button onClick={() => rateMutation.mutate(-1)} className="p-1 hover:text-indigo-400 transition-colors">
                  <ArrowBigDown className={`w-5 h-5 ${item.priority < 0 ? 'fill-indigo-500 text-indigo-500' : ''}`} />
                </button>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-secondary text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {item.type}
              </span>
           </div>

           <button
             onClick={() => onPlay(item)}
             className="px-6 py-2.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors shadow-lg"
           >
             {isVideo ? "Watch Now" : "Read Now"}
           </button>
        </div>
      </div>
    </div>
  );
}