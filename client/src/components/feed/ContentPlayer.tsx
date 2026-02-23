import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle } from "lucide-react";
import ReactPlayer from "react-player";
import type { ContentItem } from "@shared/routes";

interface ContentPlayerProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (item: ContentItem) => void;
}

export function ContentPlayer({ item, isOpen, onClose, onComplete }: ContentPlayerProps) {
  if (!isOpen || !item) return null;

  const isVideo = item.type === 'youtube' || item.type === 'tiktok' || item.type === 'video';
  const isArticle = item.type === 'article' || item.type === 'manual';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-[90] bg-background flex flex-col"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-card">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-display font-bold text-lg text-white truncate">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">{item.author || item.platformName}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white shrink-0 hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto relative bg-black">
          {isVideo && item.url ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <ReactPlayer
                url={item.url}
                width="100%"
                height="100%"
                controls
                playing
                config={{
                  youtube: {
                    playerVars: { modestbranding: 1 }
                  }
                }}
              />
            </div>
          ) : isArticle ? (
            <div className="p-6 md:p-12 max-w-3xl mx-auto h-full flex flex-col items-center justify-center text-center">
              {/* If we had full scraped content, we'd render it here. For MVP, we link out */}
              <div className="w-20 h-20 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
                <ExternalLink className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Read Article</h2>
              <p className="text-muted-foreground mb-8">
                This content requires reading on the original platform.
              </p>
              <a 
                href={item.url || '#'} 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-slate-200 transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Viewer for {item.type} not supported yet.
            </div>
          )}
        </div>

        <div className="p-4 bg-card border-t border-white/5 safe-area-pb">
          <button
            onClick={() => onComplete(item)}
            className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Mark as Completed
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
