import { Request, Response } from 'express';
import { storage } from "../storage";
import { summaryRequestSchema } from "@shared/schema";
import { z } from "zod";
import { generateSummary } from './utils';

export async function handleSummaryGeneration(req: Request, res: Response) {
  try {
    // Validate request body
    const { videoId, transcript } = summaryRequestSchema.parse(req.body);
    
    // Check if video exists
    const video = await storage.getVideoById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    // Generate summary using OpenAI
    const summary = await generateSummary(transcript, video.title);
    
    // Update video with summary
    await storage.updateVideoSummary(videoId, summary);
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request data", 
        errors: error.errors 
      });
    }
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to generate summary" 
    });
  }
}

export async function handleGetSummary(req: Request, res: Response) {
  try {
    const videoId = req.params.id;
    const video = await storage.getVideoById(videoId);
    
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }
    
    if (!video.summary) {
      return res.status(404).json({ message: "Summary not found for this video" });
    }
    
    res.json({
      videoId: video.id,
      summary: video.summary,
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to get summary" 
    });
  }
}