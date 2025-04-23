import { Request, Response } from 'express';
import { storage } from "../storage";
import { transcriptRequestSchema } from "@shared/schema";
import { z } from "zod";
import { 
  fetchYouTubeVideoDetails, 
  fetchYouTubeTranscript 
} from './utils';

export async function handleTranscriptExtraction(req: Request, res: Response) {
  try {
    // Validate request body
    const { videoUrl } = transcriptRequestSchema.parse(req.body);
    
    // Extract video ID from URL
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
      return res.status(400).json({ message: "Invalid YouTube URL" });
    }
    
    const videoId = videoIdMatch[1];
    
    // Check if video exists in storage
    const existingVideo = await storage.getVideoById(videoId);
    if (existingVideo) {
      return res.json({
        videoId,
        title: existingVideo.title,
        channelTitle: existingVideo.channelTitle,
        duration: existingVideo.duration,
        transcript: existingVideo.transcript,
        thumbnailUrl: existingVideo.thumbnailUrl,
      });
    }
    
    // Fetch video details from YouTube API
    const videoDetails = await fetchYouTubeVideoDetails(videoId);
    
    // Fetch transcript from YouTube API
    const transcript = await fetchYouTubeTranscript(videoId);
    
    // Store video in database
    const video = await storage.createVideo({
      id: videoId,
      url: videoUrl,
      title: videoDetails.title,
      channelTitle: videoDetails.channelTitle,
      duration: videoDetails.duration,
      transcript,
      thumbnailUrl: videoDetails.thumbnailUrl,
    });
    
    res.json({
      videoId,
      title: video.title,
      channelTitle: video.channelTitle,
      duration: video.duration,
      transcript: video.transcript,
      thumbnailUrl: video.thumbnailUrl,
    });
  } catch (error) {
    console.error('Error extracting transcript:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to extract transcript" 
    });
  }
}