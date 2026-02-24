import { useState } from "react";
import { Loader2, Inbox } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SubHeader } from "@/components/layout/SubHeader";
import { FeedCard } from "@/components/feed/FeedCard";
import { ContentPlayer } from "@/components/feed/ContentPlayer";
import { CompletionModal } from "@/components/feed/CompletionModal";
import { AddContentModal } from "@/components/forms/AddContentModal";
import { EditContentModal } from "@/components/forms/EditContentModal";
import { useFeed } from "@/hooks/use-content";
import type { ContentItem } from "@shared/schema";

type FocusLevel = 'low' | 'medium' | 'high' | undefined;

export default function Feed() {
  const [activeFocus, setActiveFocus] = useState<FocusLevel>(undefined);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Player state
  const [activeItem, setActiveItem] = useState<ContentItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  
  // Completion state
  const [isCompletionOpen, setIsCompletionOpen] = useState(false);

  const { data: feedItems, isLoading } = useFeed({ focus: activeFocus });

  const handlePlay = (item: ContentItem) => {
    setActiveItem(item);
    setIsPlayerOpen(true);
  };

  const handleEdit = (item: ContentItem) => {
    setActiveItem(item);
    setIsEditModalOpen(true);
  };

  const handleComplete = (item: ContentItem) => {
    setIsPlayerOpen(false);
    // Slight delay to allow player drawer to close smoothly before opening completion modal
    setTimeout(() => {
      setActiveItem(item);
      setIsCompletionOpen(true);
    }, 300);
  };

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden">
      <Header onAddClick={() => setIsAddModalOpen(true)} />
      <SubHeader activeFocus={activeFocus} onFocusChange={setActiveFocus} />

      {/* Main Feed Container - Snap Scrolling */}
      <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : !feedItems || feedItems.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center px-6 text-center text-muted-foreground">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Inbox className="w-10 h-10 text-slate-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">You're all caught up!</h2>
            <p className="max-w-xs">
              Your backlog is empty. Time to add some new high-quality dopamine to your feed.
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="mt-8 px-6 py-3 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/20"
            >
              Add Content
            </button>
          </div>
        ) : (
          feedItems.map((item) => (
            <FeedCard 
              key={item.id} 
              item={item} 
              onPlay={handlePlay} 
              onEdit={handleEdit}
            />
          ))
        )}
      </main>

      {/* Overlays & Modals */}
      <ContentPlayer 
        item={activeItem}
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        onComplete={handleComplete}
      />

      <CompletionModal
        item={activeItem}
        isOpen={isCompletionOpen}
        onClose={() => setIsCompletionOpen(false)}
      />

      <AddContentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditContentModal
        item={activeItem}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
