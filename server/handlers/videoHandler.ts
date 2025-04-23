import { Request, Response } from 'express';
import { storage } from "../storage";

export async function handleGetVideoDetails(req: Request, res: Response) {
  try {
    const videoId = req.params.id;
    const video = await storage.getVideoById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    res.json({
      videoId: video.id,
      title: video.title,
      channelTitle: video.channelTitle,
      duration: video.duration,
      transcript: video.transcript,
      thumbnailUrl: video.thumbnailUrl,
    });
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to get video" 
    });
  }
}