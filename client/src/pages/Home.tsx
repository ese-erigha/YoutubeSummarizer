import { useState, useEffect } from "react";
import { extractVideoId } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import { fetchYouTubeTranscript } from "@/lib/youtubeApi";
import { generateSummary } from "@/lib/openaiApi";
import { 
  getStoredVideos, 
  getVideoById, 
  saveVideo, 
  updateVideoSummary, 
  getRecentVideos,
  clearAllVideos
} from "@/lib/localStorage";
import { Video } from "@shared/schema";

import Header from "@/components/Header";
import URLInputSection from "@/components/URLInputSection";
import TranscriptSection, { TranscriptSegment } from "@/components/TranscriptSection";
import SummarySection from "@/components/SummarySection";
import HistoryModal, { HistoryItem } from "@/components/HistoryModal";
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

interface VideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  transcript: TranscriptSegment[];
  thumbnailUrl?: string;
}

const Home = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    visible: boolean;
    type: "success" | "error" | "info";
  }>({
    message: "",
    visible: false,
    type: "success",
  });
  
  // State for video and summary data
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  
  const { toast } = useToast();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);
  
  // Load history from localStorage
  const loadHistory = () => {
    const videos = getRecentVideos();
    const items: HistoryItem[] = videos.map(video => ({
      id: video.id,
      url: video.url,
      title: video.title,
      channelTitle: video.channelTitle,
      processedAt: new Date(video.processedAt).toISOString(),
      thumbnailUrl: video.thumbnailUrl || undefined
    }));
    setHistoryItems(items);
  };
  
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
  }, [isHistoryModalOpen, historyItems.length]);

  // Get transcript text from segments
  const getFullTranscript = (): string => {
    if (!videoDetails?.transcript) return "";
    return videoDetails.transcript.map(segment => segment.text).join(" ");
  };

  // Handle extract transcript button click
  const handleExtractTranscript = async (url: string) => {
    setYoutubeUrl(url);
    setIsLoadingTranscript(true);
    setVideoError(null);
    setSummaryError(null);
    setSummary(null);
    
    try {
      // Check if we already have this video in storage
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }
      
      const existingVideo = getVideoById(videoId);
      if (existingVideo) {
        // Load from storage
        setVideoDetails({
          videoId: existingVideo.id,
          title: existingVideo.title,
          channelTitle: existingVideo.channelTitle,
          duration: existingVideo.duration,
          transcript: existingVideo.transcript,
          thumbnailUrl: existingVideo.thumbnailUrl || undefined
        });
        
        setSummary(existingVideo.summary);
        setCurrentVideoId(videoId);
        
        setNotification({
          message: "Loaded from history!",
          visible: true,
          type: "info",
        });
      } else {
        // Fetch new transcript
        const result = await fetchYouTubeTranscript(url);
        
        // Ensure transcript is correctly typed
        const properlyTypedTranscript = result.transcript.map(segment => ({
          text: segment.text,
          timestamp: segment.timestamp
        }));
        
        // Save to storage
        const savedVideo = saveVideo({
          id: result.videoId,
          url,
          title: result.title,
          channelTitle: result.channelTitle,
          duration: result.duration,
          transcript: properlyTypedTranscript,
          thumbnailUrl: result.thumbnailUrl || null,
          summary: null
        });
        
        setVideoDetails({
          videoId: savedVideo.id,
          title: savedVideo.title,
          channelTitle: savedVideo.channelTitle,
          duration: savedVideo.duration,
          transcript: savedVideo.transcript,
          thumbnailUrl: savedVideo.thumbnailUrl || undefined
        });
        
        setCurrentVideoId(result.videoId);
        
        setNotification({
          message: "Transcript extracted successfully!",
          visible: true,
          type: "success",
        });
      }
      
      // Refresh history
      loadHistory();
    } catch (error) {
      console.error("Error extracting transcript:", error);
      setVideoError(error instanceof Error ? error.message : "Failed to extract transcript");
      toast({
        title: "Error",
        description: `Failed to extract transcript: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  // Handle generate summary button click
  const handleGenerateSummary = async () => {
    if (!currentVideoId || !videoDetails) return;
    
    setIsLoadingSummary(true);
    setSummaryError(null);
    
    try {
      const transcript = getFullTranscript();
      const generatedSummary = await generateSummary(transcript, videoDetails.title);
      
      // Save summary to storage
      updateVideoSummary(currentVideoId, generatedSummary);
      
      setSummary(generatedSummary);
      
      setNotification({
        message: "Summary generated successfully!",
        visible: true,
        type: "success",
      });
      
      // Refresh history
      loadHistory();
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError(error instanceof Error ? error.message : "Failed to generate summary");
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Handle regenerate summary button click
  const handleRegenerateSummary = () => {
    // Reuse the same function as generate
    handleGenerateSummary();
  };

  // Handle download transcript button click
  const handleDownloadTranscript = () => {
    if (!videoDetails) return;
    
    const transcript = videoDetails.transcript
      .map(segment => `[${Math.floor(segment.timestamp / 60)}:${(segment.timestamp % 60).toString().padStart(2, '0')}] ${segment.text}`)
      .join('\n\n');
    
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setNotification({
      message: "Transcript downloaded!",
      visible: true,
      type: "success",
    });
  };

  // Handle load history item
  const handleLoadHistory = (videoId: string) => {
    const video = getVideoById(videoId);
    if (video) {
      setYoutubeUrl(video.url);
      setCurrentVideoId(videoId);
      
      setVideoDetails({
        videoId: video.id,
        title: video.title,
        channelTitle: video.channelTitle,
        duration: video.duration,
        transcript: video.transcript,
        thumbnailUrl: video.thumbnailUrl || undefined
      });
      
      setSummary(video.summary);
      setIsHistoryModalOpen(false);
    }
  };

  // Handle clear history
  const handleClearHistory = () => {
    try {
      clearAllVideos();
      loadHistory();
      
      // Clear current video if displayed
      setVideoDetails(null);
      setSummary(null);
      setCurrentVideoId(null);
      
      setNotification({
        message: "History cleared!",
        visible: true,
        type: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header onOpenHistory={() => setIsHistoryModalOpen(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <URLInputSection 
          onExtractTranscript={handleExtractTranscript}
          isLoading={isLoadingTranscript} 
        />
        
        {/* Responsive grid layout that works well on all screen sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Transcript section takes full width on small screens, 1/2 width on medium screens, 1/3 width on large screens */}
          <div className="order-1">
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
          
          {/* Summary section takes full width on small screens, 1/2 width on medium screens, 2/3 width on large screens */}
          <div className="md:col-span-1 lg:col-span-2 order-2">
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
    </div>
  );
};

export default Home;
