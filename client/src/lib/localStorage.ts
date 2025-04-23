import { Video, InsertVideo, TranscriptSegment } from "@shared/schema";

// Constants for localStorage keys
const STORAGE_KEYS = {
  VIDEOS: 'tubes_videos',
};

// Helper functions to work with localStorage
export function getStoredVideos(): Video[] {
  try {
    const videosJson = localStorage.getItem(STORAGE_KEYS.VIDEOS);
    return videosJson ? JSON.parse(videosJson) : [];
  } catch (error) {
    console.error('Error retrieving videos from localStorage:', error);
    return [];
  }
}

export function getVideoById(id: string): Video | undefined {
  const videos = getStoredVideos();
  return videos.find(video => video.id === id);
}

export function saveVideo(video: InsertVideo): Video {
  const videos = getStoredVideos();
  
  // Convert transcript array to ensure it's the correct type
  const formattedTranscript: { text: string; timestamp: number }[] = [];
  
  // Safely process the transcript array
  if (Array.isArray(video.transcript)) {
    for (const item of video.transcript) {
      if (item && typeof item === 'object') {
        const text = typeof item.text === 'string' ? item.text : '';
        const timestamp = typeof item.timestamp === 'number' ? item.timestamp : 0;
        formattedTranscript.push({ text, timestamp });
      }
    }
  }

  // Create properly typed Video object
  const newVideo: Video = {
    id: video.id,
    url: video.url,
    title: video.title,
    channelTitle: video.channelTitle,
    duration: video.duration,
    transcript: formattedTranscript,
    summary: video.summary ?? null, // Convert undefined to null if needed
    thumbnailUrl: video.thumbnailUrl ?? null, // Convert undefined to null if needed
    processedAt: new Date(),
  };
  
  // Check if video already exists
  const existingIndex = videos.findIndex(v => v.id === video.id);
  
  if (existingIndex >= 0) {
    // Update existing video
    videos[existingIndex] = newVideo;
  } else {
    // Add new video
    videos.push(newVideo);
  }
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  
  return newVideo;
}

export function updateVideoSummary(id: string, summary: string): Video | undefined {
  const videos = getStoredVideos();
  const videoIndex = videos.findIndex(video => video.id === id);
  
  if (videoIndex === -1) return undefined;
  
  const updatedVideo: Video = {
    ...videos[videoIndex],
    summary,
  };
  
  videos[videoIndex] = updatedVideo;
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify(videos));
  
  return updatedVideo;
}

export function getRecentVideos(limit = 10): Video[] {
  const videos = getStoredVideos();
  
  // Sort by processed date, newest first
  return videos
    .sort((a, b) => {
      const aDate = new Date(a.processedAt);
      const bDate = new Date(b.processedAt);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, limit); // Return only the most recent
}

export function clearAllVideos(): void {
  localStorage.setItem(STORAGE_KEYS.VIDEOS, JSON.stringify([]));
}