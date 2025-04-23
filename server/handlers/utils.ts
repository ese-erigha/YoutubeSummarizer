import OpenAI from "openai";
import axios from "axios";
import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';

// Initialize OpenAI client with API key from environment
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "your-api-key"
});

// YouTube API key from environment
export const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "your-api-key";

// Set up YouTube API client
export const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY
});

// Helper function for formatting dates
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return 'yesterday';
  
  return `${d.toLocaleDateString()}`;
}

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

// Helper function to format seconds to MM:SS
export function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to generate transcript segments based on video duration and metadata
export function generateTranscriptSegments(videoId: string, durationInSeconds: number, segmentCount: number, description: string) {
  const segments = [];
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

// Helper function to fetch transcript from YouTube API
export async function fetchYouTubeTranscript(videoId: string) {
  try {
    // First get video details to check if video exists and get metadata
    const videoDetails = await fetchYouTubeVideoDetails(videoId);
    
    console.log(`Fetching transcript for video: ${videoId}`);
    
    // Use youtube-transcript package to get the transcript
    // This package uses a scraping approach which is more reliable than the API for transcripts
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    // Convert the transcript to our required format
    const formattedTranscript = transcript.map((item: { text: string; offset: number; duration: number }) => ({
      text: item.text,
      timestamp: Math.floor(item.offset / 1000) // convert from ms to seconds
    }));
    
    console.log(`Transcript fetched successfully with ${formattedTranscript.length} segments`);
    
    // If transcript is empty, fallback to making a structured guess based on video duration
    if (formattedTranscript.length === 0) {
      console.log('Transcript empty, falling back to generating segments');
      
      const videoDurationInSeconds = parseDurationToSeconds(videoDetails.duration);
      // Get video description from YouTube API
      const videoInfoResponse = await youtube.videos.list({
        id: [videoId],
        part: ['snippet']
      });
      
      const description = videoInfoResponse.data.items?.[0]?.snippet?.description || '';
      
      // Generate segments based on video duration and metadata
      const segmentCount = Math.max(20, Math.ceil(videoDurationInSeconds / 15));
      return generateTranscriptSegments(videoId, videoDurationInSeconds, segmentCount, description);
    }
    
    return formattedTranscript;
  } catch (error) {
    console.error('Error fetching YouTube transcript:', error);
    
    // Check if it's a specific error from the YouTube API
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    if (errorMessage.includes('Could not find any captions') || 
        errorMessage.includes('No transcript available')) {
      
      console.log('No transcript available, falling back to video metadata');
      
      // Fallback: If no transcript is available, try to create a structured guess
      // using the video's metadata, description, and duration
      const videoDetails = await fetchYouTubeVideoDetails(videoId);
      const videoDurationInSeconds = parseDurationToSeconds(videoDetails.duration);
      
      // Get video description from YouTube API
      const videoInfoResponse = await youtube.videos.list({
        id: [videoId],
        part: ['snippet']
      });
      
      const description = videoInfoResponse.data.items?.[0]?.snippet?.description || '';
      
      // Generate segments based on video duration and metadata
      const segmentCount = Math.max(20, Math.ceil(videoDurationInSeconds / 15));
      return generateTranscriptSegments(videoId, videoDurationInSeconds, segmentCount, description);
    }
    
    // If it's another type of error, rethrow
    throw new Error(`Failed to fetch transcript: ${errorMessage}`);
  }
}

// Helper function to generate summary using OpenAI
export async function generateSummary(transcript: string, title: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert video summarizer. Analyze the transcript of a YouTube video and provide a concise summary that captures the key points and main ideas. Format your summary as a brief introduction paragraph (2-3 sentences) followed by 3-5 bullet points of the key topics covered. Be specific and extract the most important information.",
        },
        {
          role: "user",
          content: `Summarize the following YouTube video transcript with title: "${title}". 
Keep the summary concise (100-200 words) and easy to understand.
Structure the response as:
1. A brief introduction paragraph (2-3 sentences)
2. 3-5 bullet points with the main topics/points from the video
3. A brief conclusion if appropriate (1 sentence)

TRANSCRIPT:
${transcript}`,
        },
      ],
      max_tokens: 500,
      temperature: 0.5, // Lower temperature for more focused summaries
    });

    const summary = response.choices[0].message.content || "No summary could be generated.";
    return summary;
  } catch (error: any) {
    console.error('Error generating summary with OpenAI:', error);
    
    // Provide more specific error information
    if (error.response && error.response.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your API key and try again.');
    } else if (error.response && error.response.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }
    
    throw new Error('Failed to generate summary with AI: ' + (error.message || 'Unknown error'));
  }
}