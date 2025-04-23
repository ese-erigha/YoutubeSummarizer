import { z } from "zod";

// TranscriptSegment schema
export const transcriptSegmentSchema = z.object({
  text: z.string(),
  timestamp: z.number(),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

// Video schema
export const videoSchema = z.object({
  id: z.string(), // YouTube video ID
  url: z.string(),
  title: z.string(),
  channelTitle: z.string(),
  duration: z.string(),
  transcript: z.array(transcriptSegmentSchema),
  summary: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  processedAt: z.date(),
});

export type Video = z.infer<typeof videoSchema>;

// Input type for saving a new video
export const insertVideoSchema = videoSchema.omit({ processedAt: true }).extend({
  summary: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
});

export type InsertVideo = z.infer<typeof insertVideoSchema>;
