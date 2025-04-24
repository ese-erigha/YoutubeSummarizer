/**
 * Configuration settings for the application
 */

// Video duration limit in minutes (default: 30)
export const MAX_VIDEO_DURATION_MINUTES = 
  parseInt(import.meta.env.VITE_MAX_VIDEO_DURATION_MINUTES || '30', 10);

// API Keys
export const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;