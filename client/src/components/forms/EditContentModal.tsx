import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { useUpdateContent } from "@/hooks/use-content";
import type { ContentItem } from "@shared/schema";

interface EditContentModalProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditContentModal({ item, isOpen, onClose }: EditContentModalProps) {
  const updateMutation = useUpdateContent();
  const [formData, setFormData] = useState<Partial<ContentItem>>({});

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        url: item.url || "",
        estimatedMinutes: item.estimatedMinutes,
        difficulty: item.difficulty,
        author: item.author || "",
        platformName: item.platformName || "",
      });
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    updateMutation.mutate({ id: item.id, data: formData }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  if (!isOpen || !item) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-card w-full max-w-lg h-auto max-h-[90vh] overflow-y-auto rounded-3xl p-8 shadow-2xl border border-white/10 relative"
        >
          <button 
            onClick={onClose} 
            className="absolute top-6 left-6 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-bold">Edit Content</h2>
            <p className="text-muted-foreground text-sm mt-1">Update your learning item details</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Title</label>
              <input 
                value={formData.title || ""} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Source URL</label>
              <input 
                value={formData.url || ""} 
                onChange={e => setFormData({ ...formData, url: e.target.value })}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Est. Minutes</label>
                <input 
                  type="number"
                  value={formData.estimatedMinutes || ""} 
                  onChange={e => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Difficulty</label>
                <select 
                  value={formData.difficulty || "medium"}
                  onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all appearance-none"
                >
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="deep">Deep</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Author</label>
                <input 
                  value={formData.author || ""} 
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Platform</label>
                <input 
                  value={formData.platformName || ""} 
                  onChange={e => setFormData({ ...formData, platformName: e.target.value })}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-4 rounded-xl font-bold bg-white/5 text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="flex-1 py-4 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
