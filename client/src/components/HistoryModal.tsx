import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  channelTitle: string;
  processedAt: string;
  thumbnailUrl?: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyItems: HistoryItem[];
  onLoadHistory: (videoId: string) => void;
  onClearHistory: () => void;
}

const HistoryModal = ({
  isOpen,
  onClose,
  historyItems,
  onLoadHistory,
  onClearHistory,
}: HistoryModalProps) => {
  const isEmpty = historyItems.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Recently Processed Videos
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow py-2">
          {isEmpty ? (
            <div className="py-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-gray-300">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M12 7v5l4 2"/>
              </svg>
              <p className="text-gray-500">No history yet. Process a video to see it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {historyItems.map((item) => (
                <div key={item.id} className="border-b border-gray-200 py-4 last:border-0">
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                      {item.thumbnailUrl && (
                        <img
                          src={item.thumbnailUrl}
                          alt={`Thumbnail for ${item.title}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow overflow-hidden">
                      <h3 className="font-medium text-gray-900 mb-1 text-ellipsis overflow-hidden whitespace-nowrap">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.channelTitle} • Processed {item.processedAt}
                      </p>
                      <Button
                        variant="link"
                        className="text-primary hover:text-primary-700 text-sm font-medium p-0 h-auto"
                        onClick={() => onLoadHistory(item.id)}
                      >
                        View transcript & summary
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />
        
        <DialogFooter className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-800 hover:bg-red-50 font-medium flex items-center"
            onClick={onClearHistory}
            disabled={isEmpty}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
            Clear All History
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryModal;
