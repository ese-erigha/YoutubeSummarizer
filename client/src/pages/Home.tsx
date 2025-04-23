import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { extractVideoId } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import { SummaryResponse } from "@/lib/openai";

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

interface HistoryResponse {
  videos: HistoryItem[];
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
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get history from backend
  const { data: historyData } = useQuery<HistoryResponse>({
    queryKey: ['/api/history'],
    enabled: true,
  });
  
  const historyItems: HistoryItem[] = historyData?.videos || [];
  
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

  // Extract transcript mutation
  const extractTranscriptMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/transcripts', { videoUrl: url });
      return response.json();
    },
    onSuccess: (data) => {
      setNotification({
        message: "Transcript extracted successfully!",
        visible: true,
        type: "success",
      });
      const videoId = extractVideoId(youtubeUrl);
      if (videoId) {
        setCurrentVideoId(videoId);
      }
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to extract transcript: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate summary mutation
  const generateSummaryMutation = useMutation({
    mutationFn: async (data: { videoId: string, transcript: string }) => {
      const response = await apiRequest('POST', '/api/summaries', data);
      return response.json();
    },
    onSuccess: (data) => {
      // Set summary directly to avoid waiting for re-query
      const summary = data.summary;
      
      setNotification({
        message: "Summary generated successfully!",
        visible: true,
        type: "success",
      });
      
      // Invalidate both history and summary queries
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
      queryClient.invalidateQueries({ queryKey: [`/api/summaries/${currentVideoId}`, currentVideoId] });
      
      // Try to set the summary data in the query cache directly
      queryClient.setQueryData([`/api/summaries/${currentVideoId}`, currentVideoId], {
        videoId: currentVideoId,
        summary
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to generate summary: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Query for video details
  const { data: videoDetails, error: videoError } = useQuery<VideoDetails>({
    queryKey: [`/api/videos/${currentVideoId}`, currentVideoId],
    enabled: !!currentVideoId,
  });

  // Get transcript text from segments
  const getFullTranscript = (): string => {
    if (!videoDetails?.transcript) return "";
    return videoDetails.transcript.map(segment => segment.text).join(" ");
  };

  // Query for summary
  const { data: summaryData, error: summaryError } = useQuery<SummaryResponse>({
    queryKey: [`/api/summaries/${currentVideoId}`, currentVideoId],
    enabled: !!currentVideoId,
  });

  // Handle extract transcript button click
  const handleExtractTranscript = async (url: string) => {
    setYoutubeUrl(url);
    extractTranscriptMutation.mutate(url);
  };

  // Handle generate summary button click
  const handleGenerateSummary = () => {
    if (currentVideoId && videoDetails) {
      const transcript = getFullTranscript();
      generateSummaryMutation.mutate({ 
        videoId: currentVideoId, 
        transcript 
      });
    }
  };

  // Handle regenerate summary button click
  const handleRegenerateSummary = () => {
    if (currentVideoId && videoDetails) {
      const transcript = getFullTranscript();
      generateSummaryMutation.mutate({ 
        videoId: currentVideoId, 
        transcript 
      });
    }
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
    const historyItem = historyItems.find(item => item.id === videoId);
    if (historyItem) {
      setYoutubeUrl(historyItem.url);
      setCurrentVideoId(videoId);
      setIsHistoryModalOpen(false);
    }
  };

  // Handle clear history
  const handleClearHistory = async () => {
    try {
      await apiRequest('DELETE', '/api/history');
      queryClient.invalidateQueries({ queryKey: ['/api/history'] });
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
          isLoading={extractTranscriptMutation.isPending} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TranscriptSection
            videoUrl={youtubeUrl}
            videoTitle={videoDetails?.title || ""}
            channelTitle={videoDetails?.channelTitle || ""}
            duration={videoDetails?.duration || ""}
            transcript={videoDetails?.transcript || []}
            isLoading={extractTranscriptMutation.isPending}
            error={videoError ? (videoError as Error).message : null}
            onDownloadTranscript={handleDownloadTranscript}
          />
          
          <SummarySection
            transcript={getFullTranscript()}
            videoTitle={videoDetails?.title || ""}
            summary={summaryData?.summary || null}
            isSummaryLoading={generateSummaryMutation.isPending}
            summaryError={summaryError ? (summaryError as Error).message : null}
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
    </div>
  );
};

export default Home;
