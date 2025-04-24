import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { extractVideoId, formatTimestamp } from "@/lib/youtube";
import { fetchYouTubeTranscript } from "@/lib/youtubeApi";
import { generateSummary } from "@/lib/openaiApi";
import { saveVideo, updateVideoSummary, getRecentVideos, clearAllVideos, getVideoById } from "@/lib/localStorage";
import { TranscriptSegment } from "@/components/TranscriptSection";
import { HistoryItem } from "@/components/HistoryModal";
import { parseDurationToSeconds } from "@/lib/youtubeApi";

export interface VideoDetails {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  transcript: TranscriptSegment[];
  thumbnailUrl?: string;
}

// Maximum video duration in minutes
const MAX_VIDEO_DURATION_MINUTES = 30;

export const useHomePage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [videoError, setVideoError] = useState("");
  
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [isDurationAlertOpen, setIsDurationAlertOpen] = useState(false);
  
  const [notification, setNotification] = useState({
    message: "",
    visible: false,
    type: "info" as "success" | "error" | "info"
  });

  // Load history on component mount
  useEffect(() => {
    loadHistoryItems();
  }, []);

  const loadHistoryItems = useCallback(() => {
    const recentVideos = getRecentVideos();
    
    const items: HistoryItem[] = recentVideos.map(video => ({
      id: video.id,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      title: video.title,
      channelTitle: video.channelTitle,
      processedAt: video.processedAt,
      thumbnailUrl: video.thumbnailUrl
    }));
    
    setHistoryItems(items);
  }, []);

  const showNotification = useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({
      message,
      visible: true,
      type
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  }, []);

  const handleExtractTranscript = useCallback(async (url: string) => {
    setIsLoadingTranscript(true);
    setVideoError("");
    setVideoDetails(null);
    setSummary(null);
    setSummaryError(null);
    setYoutubeUrl(url);
    
    try {
      const result = await fetchYouTubeTranscript(url);
      
      // Check if video duration exceeds the maximum allowed
      const durationSeconds = parseDurationToSeconds(result.duration);
      const durationMinutes = durationSeconds / 60;
      
      if (durationMinutes > MAX_VIDEO_DURATION_MINUTES) {
        setIsDurationAlertOpen(true);
        setIsLoadingTranscript(false);
        return;
      }
      
      // Save video to storage
      const videoId = extractVideoId(url) || "";
      
      const savedVideo = saveVideo({
        id: uuidv4(),
        videoId,
        title: result.title,
        channelTitle: result.channelTitle,
        duration: result.duration,
        transcript: result.transcript,
        thumbnailUrl: result.thumbnailUrl
      });
      
      setVideoDetails({
        videoId,
        title: result.title,
        channelTitle: result.channelTitle,
        duration: result.duration,
        transcript: result.transcript,
        thumbnailUrl: result.thumbnailUrl
      });
      
      // Refresh history items
      loadHistoryItems();
      
      showNotification(`Successfully extracted transcript from: ${result.title}`, "success");
    } catch (error) {
      console.error("Error extracting transcript:", error);
      setVideoError(error instanceof Error ? error.message : String(error));
      showNotification("Failed to extract transcript. Please try another video.", "error");
    } finally {
      setIsLoadingTranscript(false);
    }
  }, [loadHistoryItems, showNotification]);

  const handleGenerateSummary = useCallback(async () => {
    if (!videoDetails || !videoDetails.transcript.length) {
      setSummaryError("No transcript available to summarize.");
      return;
    }
    
    setIsLoadingSummary(true);
    setSummaryError(null);
    
    try {
      // Join all transcript segments
      const fullTranscript = videoDetails.transcript.map(segment => segment.text).join(" ");
      
      const summaryText = await generateSummary(fullTranscript, videoDetails.title);
      setSummary(summaryText);
      
      // Update stored video with summary
      if (videoDetails.videoId) {
        updateVideoSummary(videoDetails.videoId, summaryText);
      }
      
      showNotification("Summary successfully generated!", "success");
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummaryError(error instanceof Error ? error.message : String(error));
      showNotification("Failed to generate summary. Please try again.", "error");
    } finally {
      setIsLoadingSummary(false);
    }
  }, [videoDetails, showNotification]);

  const handleRegenerateSummary = useCallback(() => {
    setSummary(null);
    setSummaryError(null);
    handleGenerateSummary();
  }, [handleGenerateSummary]);

  const handleDownloadTranscript = useCallback(() => {
    if (!videoDetails || !videoDetails.transcript.length) return;
    
    // Format transcript with timestamps
    const formattedTranscript = videoDetails.transcript.map(segment => {
      return `[${formatTimestamp(segment.timestamp)}] ${segment.text}`;
    }).join("\n\n");
    
    // Create file content
    const fileContent = `Title: ${videoDetails.title}\nChannel: ${videoDetails.channelTitle}\nDuration: ${videoDetails.duration}\n\nTRANSCRIPT:\n\n${formattedTranscript}`;
    
    // Create file name
    const fileName = `${videoDetails.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_transcript.txt`;
    
    // Create blob and download
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification("Transcript downloaded successfully!", "success");
  }, [videoDetails, showNotification]);

  const handleLoadHistory = useCallback((videoId: string) => {
    const savedVideo = getVideoById(videoId);
    
    if (savedVideo) {
      setYoutubeUrl(`https://www.youtube.com/watch?v=${savedVideo.videoId}`);
      
      setVideoDetails({
        videoId: savedVideo.videoId,
        title: savedVideo.title,
        channelTitle: savedVideo.channelTitle,
        duration: savedVideo.duration,
        transcript: savedVideo.transcript,
        thumbnailUrl: savedVideo.thumbnailUrl
      });
      
      // If summary exists, set it
      if (savedVideo.summary) {
        setSummary(savedVideo.summary);
      } else {
        setSummary(null);
      }
      
      setVideoError("");
      setSummaryError(null);
      setIsHistoryModalOpen(false);
      
      showNotification(`Loaded video: ${savedVideo.title}`, "info");
    }
  }, [showNotification]);

  const handleClearHistory = useCallback(() => {
    clearAllVideos();
    setHistoryItems([]);
    setIsHistoryModalOpen(false);
    showNotification("History cleared successfully", "info");
  }, [showNotification]);

  const getFullTranscript = useCallback(() => {
    if (!videoDetails || !videoDetails.transcript) return "";
    return videoDetails.transcript.map(segment => segment.text).join(" ");
  }, [videoDetails]);

  return {
    youtubeUrl,
    setYoutubeUrl,
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
};