import axios from 'axios';
import { TranscriptSegment } from '@shared/schema';
import { extractVideoId, formatTimestamp } from './youtube';
import { YoutubeTranscript } from 'youtube-transcript';

// Make sure these keys are accessible for the frontend-only app
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

// Helper function to fetch video details from YouTube API
export async function fetchYouTubeVideoDetails(videoId: string) {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${YOUTUBE_API_KEY}`
    );
    
    if (response.data.items.length === 0) {
      throw new Error('Video not found');
    }
    
    const video = response.data.items[0];
    const duration = formatYouTubeDuration(video.contentDetails.duration);
    
    return {
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      duration,
      thumbnailUrl: video.snippet.thumbnails.medium.url,
    };
  } catch (error) {
    console.error('Error fetching YouTube video details:', error);
    throw new Error('Failed to fetch video details from YouTube API');
  }
}

// Helper function to format YouTube API duration string
export function formatYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return '0:00';
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Helper function to parse YouTube duration string to seconds
export function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  if (!match) return 0;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to generate transcript segments based on video data
export function generateTranscriptSegments(
  videoId: string, 
  durationInSeconds: number, 
  segmentCount: number, 
  description: string
): TranscriptSegment[] {
  const segments: TranscriptSegment[] = [];
  const segmentDuration = Math.floor(durationInSeconds / segmentCount);
  
  // Add a special first segment to indicate this is generated content (not actual transcript)
  segments.push({
    text: "Note: This video doesn't have captions available. The following transcript is generated from the video description and is not a precise representation of the actual content.",
    timestamp: 0
  });

  // Get topics from description if available
  const topics = description
    .split(/\n|\.|,/)
    .filter(line => line.trim().length > 20 && line.trim().length < 200)
    .slice(0, segmentCount);
  
  // Generic discussion phrases to make transcript more realistic
  const genericPhrases = [
    "I wanted to talk about this topic because",
    "Here's something interesting to consider",
    "Many viewers have asked me about",
    "Let's dive deeper into this concept",
    "This is a crucial point to understand",
    "When we look at the data, we can see that",
    "The research suggests that",
    "From my experience, I've found that",
    "It's important to remember that",
    "One approach that works well is",
    "The key insight here is",
    "What most people don't realize is"
  ];

  // Create segments with varied content
  for (let i = 0; i < segmentCount; i++) {
    const timestamp = i * segmentDuration;
    
    let text;
    if (topics.length > 0 && i < topics.length) {
      // Use actual description content when available
      text = topics[i];
    } else if (topics.length > 0) {
      // Reuse topics with different prefixes for variety
      const topicIndex = i % topics.length;
      const phraseIndex = i % genericPhrases.length;
      text = `${genericPhrases[phraseIndex]} ${topics[topicIndex].toLowerCase()}`;
    } else {
      // Completely generic placeholder as last resort
      text = `Transcript segment ${i+1} of the video (timestamp: ${formatTimestamp(timestamp)})`;
    }
    
    // Ensure text is properly formatted and not too long
    text = text.trim();
    if (text.length > 200) {
      text = text.substring(0, 197) + '...';
    }
    
    segments.push({
      text,
      timestamp
    });
  }
  
  return segments;
}

// Function to extract transcripts from YouTube videos
export async function fetchYouTubeTranscript(videoUrl: string): Promise<{
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  transcript: TranscriptSegment[];
  thumbnailUrl?: string;
}> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }
    
    // Get video details from YouTube API
    const videoDetails = await fetchYouTubeVideoDetails(videoId);
    
    console.log('Fetching transcript with youtube-transcript package');
    
    try {
      // Try to fetch the actual transcript using youtube-transcript package
      const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
      
      if (transcriptItems && transcriptItems.length > 0) {
        // Convert to our TranscriptSegment format
        const transcript: TranscriptSegment[] = transcriptItems.map(item => ({
          text: item.text,
          timestamp: item.offset / 1000 // offset is in milliseconds, we want seconds
        }));
        
        return {
          videoId,
          title: videoDetails.title,
          channelTitle: videoDetails.channelTitle,
          duration: videoDetails.duration,
          transcript,
          thumbnailUrl: videoDetails.thumbnailUrl,
        };
      } else {
        throw new Error('No transcript available');
      }
    } catch (transcriptError) {
      console.warn('Failed to fetch transcript with youtube-transcript, falling back to generated transcript', transcriptError);
      
      // Fall back to generating a transcript from video metadata
      console.log('Generating transcript based on video metadata (fallback)');
      const videoDurationInSeconds = parseDurationToSeconds(videoDetails.duration);
      
      // Get video description from YouTube API
      const videoInfoResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${YOUTUBE_API_KEY}`
      );
      
      const description = videoInfoResponse.data.items?.[0]?.snippet?.description || '';
      
      // Generate segments based on video duration and metadata
      const segmentCount = Math.max(20, Math.ceil(videoDurationInSeconds / 15));
      const transcript = generateTranscriptSegments(videoId, videoDurationInSeconds, segmentCount, description);
      
      return {
        videoId,
        title: videoDetails.title,
        channelTitle: videoDetails.channelTitle,
        duration: videoDetails.duration,
        transcript,
        thumbnailUrl: videoDetails.thumbnailUrl,
      };
    }
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    throw new Error(`Failed to fetch transcript: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}