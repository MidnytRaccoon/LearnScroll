import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Wand2, Loader2 } from "lucide-react";
import { useDetectUrl, useCreateContent } from "@/hooks/use-content";

interface AddContentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddContentModal({ isOpen, onClose }: AddContentModalProps) {
  const [url, setUrl] = useState("");
  const detectMutation = useDetectUrl();
  const createMutation = useCreateContent();
  
  const [detectedData, setDetectedData] = useState<any>(null);

  const handleDetect = () => {
    if (!url) return;
    detectMutation.mutate(url, {
      onSuccess: (data) => setDetectedData(data),
    });
  };

  const handleSave = () => {
    const payload = {
      url,
      title: detectedData?.title || "Untitled Link",
      type: detectedData?.type || "article",
      thumbnailUrl: detectedData?.thumbnailUrl,
      author: detectedData?.author,
      platformName: detectedData?.platformName,
      estimatedMinutes: detectedData?.estimatedMinutes || 5,
      difficulty: "medium", // Default
      status: "unseen"
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        setUrl("");
        setDetectedData(null);
        onClose();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-card w-full max-w-lg sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold">Add to Queue</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {!detectedData ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Link2 className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste URL (YouTube, Article, etc.)"
                  className="w-full bg-background border border-border rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <button
                onClick={handleDetect}
                disabled={!url || detectMutation.isPending}
                className="w-full py-4 rounded-xl font-bold bg-white text-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {detectMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Auto-Extract Details
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {detectedData.thumbnailUrl && (
                <div className="h-40 w-full rounded-xl overflow-hidden relative">
                  <img src={detectedData.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Title</label>
                  <input 
                    value={detectedData.title || ''} 
                    onChange={e => setDetectedData({...detectedData, title: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Type</label>
                    <div className="bg-secondary text-secondary-foreground px-3 py-2 rounded-lg capitalize text-sm">
                      {detectedData.type}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Est. Time</label>
                    <input 
                      type="number"
                      value={detectedData.estimatedMinutes || ''} 
                      onChange={e => setDetectedData({...detectedData, estimatedMinutes: parseInt(e.target.value)})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white"
                      placeholder="Mins"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={createMutation.isPending}
                className="w-full py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {createMutation.isPending ? "Adding..." : "Add to Feed"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
