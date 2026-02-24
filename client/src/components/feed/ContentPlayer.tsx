// client/src/components/feed/ContentPlayer.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Edit3, Save, RotateCcw, FileText, ExternalLink, Loader2 } from "lucide-react";
import { useUpdateContent } from "@/hooks/use-content";
import type { ContentItem } from "@shared/schema";

// Add this above your export function
interface ContentPlayerProps {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (item: ContentItem) => void;
  onSaveSuccess?: () => void; // Add this new prop
}

export function ContentPlayer({ item, isOpen, onClose, onComplete, onSaveSuccess }: ContentPlayerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ContentItem>>({});
  const updateMutation = useUpdateContent();

  useEffect(() => {
    if (item) setEditData({ title: item.title, url: item.url || "", contentBody: item.contentBody || "" });
  }, [item]);

  if (!item) return null;

  const handleCancel = () => {
    if (item) {
      // Revert local state to the original item data
      setEditData({
        title: item.title || "",
        url: item.url || "",
        contentBody: item.contentBody || ""
      });
    }
    setIsEditing(false);
  };

const handleSave = () => {
    const payload = {
      id: item.id,
      title: editData.title,
      url: editData.url,
      contentBody: editData.contentBody || "",
    };

    updateMutation.mutate(payload, { 
      onSuccess: () => {
        setIsEditing(false);
        // If the callback exists, trigger the "reopen" cycle in the parent
        if (onSaveSuccess) onSaveSuccess();
      }
    });
  };

  const formatDateTime = (date: Date | null) => {
    if (!date) return "Never";
    const d = new Date(date);
    return d.toLocaleDateString('en-US') + " - " + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />

          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-4xl h-full sm:h-[85vh] bg-card sm:rounded-3xl overflow-hidden flex flex-col border border-white/10 shadow-2xl">
            
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex-1">
                {isEditing ? (
                  <input value={editData.title ?? ""} onChange={e => setEditData({...editData, title: e.target.value})} className="bg-transparent text-xl font-bold text-white w-full outline-none border-b border-primary" />
                ) : (
                  <h3 className="font-bold text-xl text-white truncate">{item.title}</h3>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-white/10 rounded-lg text-primary transition-colors">
                    <Edit3 className="w-5 h-5" />
                  </button>
                )}
                <button onClick={onClose} className="p-2 hover:bg-red-500/20 rounded-lg text-white/50"><X className="w-6 h-6" /></button>
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isEditing ? (
        <div className="space-y-4">
            <input 
              placeholder="Source/PDF Link (URL or Local Path)" 
              value={editData.url ?? ""} // Now always a string
              onChange={e => setEditData({...editData, url: e.target.value})} 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white" 
            />
            <textarea 
              placeholder="Write your notes or paste rich content here..." 
              value={editData.contentBody ?? ""} // Now always a string
              maxLength={10000}
              onChange={e => setEditData({...editData, contentBody: e.target.value})}
              className="w-full h-[40vh] bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white resize-none focus:ring-1 focus:ring-primary outline-none" 
            />
            <p className="text-[10px] text-right text-muted-foreground">
              {(editData.contentBody ?? "").length}/10,000
            </p>
          </div>
        ) : (
                <div className="prose prose-invert max-w-none">
                  {/* Local PDF / Link Button */}
                  {item.url && (
                    <div className="flex gap-3 mb-8">
                      <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-lg text-primary text-sm font-bold hover:bg-primary/30 transition-all">
                        {item.url.toLowerCase().endsWith('.pdf') ? <FileText className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
                        Open Resource
                      </a>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {item.contentBody || "No notes added yet. Click edit to start your learning journal."}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/20">
              {isEditing ? (
                <div className="flex gap-3">
                  <button onClick={handleCancel} className="flex-1 py-3 bg-white/5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-white/10">
                    <RotateCcw className="w-4 h-4" /> Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={updateMutation.isPending}
                    className="flex-1 py-3 bg-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? ( <Loader2 className="w-4 h-4 animate-spin" />) : (<></>)}
                    <Save className="w-4 h-4" /> Save Notes
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button onClick={() => onComplete(item)} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                    <CheckCircle className="w-5 h-5" /> Mark Completed
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    Last Edited: {formatDateTime(item.lastEdited || item.dateAdded)}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}