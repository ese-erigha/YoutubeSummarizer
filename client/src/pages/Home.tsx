import { useEffect } from "react";
import { useHomeLogic } from "@/hooks/use-home-logic";
import { MAX_VIDEO_DURATION_MINUTES } from "@/lib/config";
import { TranscriptSegment } from "@/components/TranscriptSection";
import Header from "@/components/Header";
import URLInputSection from "@/components/URLInputSection";
import TranscriptSection from "@/components/TranscriptSection";
import SummarySection from "@/components/SummarySection";
import HistoryModal from "@/components/HistoryModal";
import Notification from "@/components/Notification";
import Footer from "@/components/Footer";
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

const Home = () => {
  // Get all the state and handler functions from our custom hook
  const {
    youtubeUrl,
    setYoutubeUrl, // Add setYoutubeUrl to the destructuring
    videoDetails,
    isLoadingTranscript,
    videoError,
    summary,
    isLoadingSummary,
    summaryError,
    isHistoryModalOpen,
    setIsHistoryModalOpen,
    historyItems,
    isConfirmClearOpen,
    setIsConfirmClearOpen,
    isDurationAlertOpen,
    setIsDurationAlertOpen,
    notification,
    setNotification,
    handleExtractTranscript,
    handleGenerateSummary,
    handleRegenerateSummary,
    handleDownloadTranscript,
    handleLoadHistory,
    handleClearHistory,
    getFullTranscript,
  } = useHomeLogic();
  
  // Global keyboard shortcut for clearing history
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+Delete to open clear history confirmation
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete' && !isHistoryModalOpen && historyItems.length > 0) {
        e.preventDefault();
        setIsConfirmClearOpen(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHistoryModalOpen, historyItems.length, setIsConfirmClearOpen]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenHistory={() => setIsHistoryModalOpen(true)} />
      
      <main className="flex flex-col w-full px-4 sm:px-6 md:px-8 py-6">
        {/* 1. URL Input Section (Extract Video Transcript) */}
        <div className="w-full mb-8">
          <URLInputSection 
            onExtractTranscript={handleExtractTranscript}
            isLoading={isLoadingTranscript}
            inputUrl={youtubeUrl}
          />
        </div>
        
        {/* 2. Transcript Section */}
        <div className="w-full mb-8">
          <TranscriptSection
            videoUrl={youtubeUrl}
            videoTitle={videoDetails?.title || ""}
            channelTitle={videoDetails?.channelTitle || ""}
            duration={videoDetails?.duration || ""}
            transcript={videoDetails?.transcript || []}
            isLoading={isLoadingTranscript}
            error={videoError || null}
            onDownloadTranscript={handleDownloadTranscript}
          />
        </div>
        
        {/* 3. Summary Section */}
        <div className="w-full">
          <SummarySection
            transcript={getFullTranscript()}
            videoTitle={videoDetails?.title || ""}
            summary={summary}
            isSummaryLoading={isLoadingSummary}
            summaryError={summaryError}
            onGenerateSummary={handleGenerateSummary}
            onRegenerateSummary={handleRegenerateSummary}
            hasTranscript={!!(videoDetails?.transcript && videoDetails.transcript.length > 0)}
          />
        </div>
      </main>
      
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        historyItems={historyItems}
        onLoadHistory={handleLoadHistory}
        onClearHistory={handleClearHistory}
      />
      
      <Notification
        message={notification.message}
        isVisible={notification.visible}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
      />
      
      <Footer />
      
      {/* Global confirmation dialog for clearing history */}
      <AlertDialog open={isConfirmClearOpen} onOpenChange={setIsConfirmClearOpen}>
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
              onClick={() => {
                handleClearHistory();
                setIsConfirmClearOpen(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Duration limit alert dialog */}
      <AlertDialog open={isDurationAlertOpen} onOpenChange={setIsDurationAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Video Duration Limit Exceeded</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4">
                <div className="mb-4">
                  We only support processing YouTube videos with a duration of {MAX_VIDEO_DURATION_MINUTES} minutes or less.
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 text-sm mb-4">
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5 flex-shrink-0">
                      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" x2="12" y1="9" y2="13"/>
                      <line x1="12" x2="12.01" y1="17" y2="17"/>
                    </svg>
                    <span>
                      Longer videos require more processing time and resources,
                      and may result in less accurate summaries.
                    </span>
                  </div>
                </div>
                <div>
                  Please try a shorter video, or consider using a specific timestamp URL to focus on a particular section of the video.
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setIsDurationAlertOpen(false);
              // Clear the input URL using the setter from our hook
              setYoutubeUrl("");
            }}>
              I understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Home;
