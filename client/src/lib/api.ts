import axios from 'axios';
import { TranscriptSegment } from '@shared/schema';

/**
 * API client for interacting with the backend
 */

// Generate a summary through the backend API
export async function generateSummary(transcript: string | TranscriptSegment[], title: string): Promise<string> {
  try {
    const response = await axios.post('/api/summary', {
      transcript,
      title
    });
    
    if (!response.data || !response.data.summary) {
      throw new Error('No summary returned from API');
    }
    
    return response.data.summary;
  } catch (error: any) {
    console.error('Error calling summary API:', error);
    
    // Format error message based on the response
    if (error.response) {
      if (error.response.status === 401) {
        throw new Error('API key error: Please check server API key configuration');
      } else if (error.response.status === 429) {
        throw new Error('Rate limit exceeded: Please try again later');
      } else if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
    
    throw new Error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
  }
}