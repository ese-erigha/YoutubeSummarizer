import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";

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
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+Delete to open clear history confirmation
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete' && isOpen && !isEmpty) {
        e.preventDefault();
        setIsConfirmDialogOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isEmpty]);
  
  const handleClearClick = () => {
    setIsConfirmDialogOpen(true);
  };
  
  const handleConfirmClear = () => {
    onClearHistory();
    setIsConfirmDialogOpen(false);
    // Close the history modal as well
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Recently Processed Videos
            </DialogTitle>
            {!isEmpty && (
              <DialogDescription className="text-sm text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded shadow-sm text-xs">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded shadow-sm text-xs">Shift</kbd> + <kbd className="px-1.5 py-0.5 bg-gray-100 border rounded shadow-sm text-xs">Delete</kbd> to clear all history
              </DialogDescription>
            )}
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
                  <div key={item.id} className="border-b border-gray-200 py-3 md:py-4 last:border-0">
                    <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                      <div className="w-full sm:w-24 h-32 sm:h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                        {item.thumbnailUrl && (
                          <img
                            src={item.thumbnailUrl}
                            alt={`Thumbnail for ${item.title}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        )}
                      </div>
                      <div className="flex-grow overflow-hidden w-full">
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 sm:text-ellipsis sm:overflow-hidden sm:whitespace-nowrap">
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
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                            <path d="M2 12a10 10 0 0 1 10-10v0a10 10 0 0 1 10 10v0a10 10 0 0 1-10 10v0A10 10 0 0 1 2 12v0Z"/>
                            <path d="m12 16 4-4-4-4"/>
                            <path d="M8 12h8"/>
                          </svg>
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
              variant="outline"
              className="border-red-200 bg-red-50 text-red-600 hover:text-red-800 hover:bg-red-100 hover:border-red-300 font-medium flex items-center"
              onClick={handleClearClick}
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
      
      {/* Confirmation dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all history?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all video transcripts and summaries from your history.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmClear}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default HistoryModal;
