// YouTube API interface functions

/**
 * Validates if a string is a valid YouTube URL
 */
export const isValidYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
  return youtubeRegex.test(url);
};

/**
 * Extracts the video ID from a YouTube URL
 */
export const extractVideoId = (url: string): string | null => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
  const match = url.match(youtubeRegex);
  return match ? match[4] : null;
};

/**
 * Formats seconds into MM:SS format
 */
export const formatTimestamp = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Generates a YouTube URL with timestamp
 */
export const generateTimestampUrl = (videoId: string, timestamp: number): string => {
  return `https://www.youtube.com/watch?v=${videoId}&t=${timestamp}`;
};
