import { useState, useEffect } from "react";
import { extractVideoId } from "@/lib/youtube";
import { useToast } from "@/hooks/use-toast";
import { fetchYouTubeTranscript, fetchYouTubeVideoDetails } from "@/lib/youtubeApi";
import { generateSummary } from "@/lib/openaiApi";
import { 
  getStoredVideos, 
  getVideoById, 
  saveVideo, 
  updateVideoSummary, 
  getRecentVideos,
  clearAllVideos
} from "@/lib/localStorage";
import { TranscriptSegment } from "@/components/TranscriptSection";
import { HistoryItem } from "@/components/HistoryModal";

export interface VideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  transcript: TranscriptSegment[];
  thumbnailUrl?: string;
}

export function useHomeLogic() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isDurationAlertOpen, setIsDurationAlertOpen] = useState(false);
  const [longVideoUrl, setLongVideoUrl] = useState("");
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

  // Get transcript text from segments
  const getFullTranscript = (): string => {
    if (!videoDetails?.transcript) return "";
    return videoDetails.transcript.map(segment => segment.text).join(" ");
  };

  // Helper function to check if a video is within the duration limit
  const isVideoDurationValid = (duration: string): boolean => {
    // Parse the duration string (format could be MM:SS or H:MM:SS)
    const parts = duration.split(':');
    
    if (parts.length === 2) {
      // Format is MM:SS
      const minutes = parseInt(parts[0]);
      return minutes <= 30;
    } else if (parts.length === 3) {
      // Format is H:MM:SS
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      return hours === 0 && minutes <= 30;
    }
    
    // Default to valid if we can't parse
    return true;
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
        // Check duration for stored videos
        if (!isVideoDurationValid(existingVideo.duration)) {
          setLongVideoUrl(url);
          setIsDurationAlertOpen(true);
          return;
        }
        
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
        // For new videos, first get the video details to check duration
        const videoDetails = await fetchYouTubeVideoDetails(videoId);
        
        // Check if the video is within the duration limit
        if (!isVideoDurationValid(videoDetails.duration)) {
          setLongVideoUrl(url);
          setIsDurationAlertOpen(true);
          return;
        }
        
        // Fetch full transcript
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

  return {
    youtubeUrl,
    setYoutubeUrl,
    currentVideoId,
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
  };
}