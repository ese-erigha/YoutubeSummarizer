import { Request, Response } from 'express';
import { generateSummary } from '../services/openaiService';

/**
 * Controller for handling summary generation requests
 */
export async function generateVideoSummary(req: Request, res: Response) {
  try {
    const { transcript, title } = req.body;
    
    if (!transcript || !title) {
      return res.status(400).json({ 
        error: 'Transcript and title are required' 
      });
    }
    
    console.log(`Server generating summary for video: ${title}`);
    
    // Join transcript segments into a single string if it's an array
    const fullTranscript = Array.isArray(transcript) 
      ? transcript.map(segment => segment.text).join(' ') 
      : transcript;
    
    // Generate summary
    const summary = await generateSummary(fullTranscript, title);
    
    return res.json({ summary });
  } catch (error) {
    console.error('Error in summary controller:', error);
    return res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}