import { Request, Response } from 'express';
import { storage } from "../storage";
import { formatDate } from './utils';

export async function handleGetHistory(req: Request, res: Response) {
  try {
    const videos = await storage.getAllVideos();
    
    // Format videos for history display
    const formattedVideos = videos.map(video => ({
      id: video.id,
      url: video.url,
      title: video.title,
      channelTitle: video.channelTitle,
      processedAt: formatDate(video.processedAt),
      thumbnailUrl: video.thumbnailUrl,
    }));
    
    res.json({ videos: formattedVideos });
  } catch (error) {
    console.error('Error getting history:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to get history" 
    });
  }
}

export async function handleClearHistory(req: Request, res: Response) {
  try {
    await storage.clearAllVideos();
    res.json({ success: true });
  } catch (error) {
    console.error('Error clearing history:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to clear history" 
    });
  }
}