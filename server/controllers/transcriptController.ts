import { Request, Response } from 'express';
import { fetchTranscript } from '../services/youtubeService';

/**
 * Controller for handling transcript requests
 */
export async function getTranscript(req: Request, res: Response) {
  try {
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }
    
    const transcript = await fetchTranscript(videoId);
    
    return res.json({ transcript });
  } catch (error) {
    console.error('Error in transcript controller:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch transcript',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}