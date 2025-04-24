import { YoutubeTranscript } from 'youtube-transcript';

/**
 * Fetch transcript for a YouTube video
 */
export async function fetchTranscript(videoId: string) {
  try {
    console.log(`Server fetching transcript for video: ${videoId}`);
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      throw new Error('No transcript found for this video');
    }
    
    // Convert to the expected format
    const formattedTranscript = transcript.map(item => ({
      text: item.text,
      timestamp: item.offset / 1000 // Convert from ms to seconds
    }));
    
    return formattedTranscript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
}