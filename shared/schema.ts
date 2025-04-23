import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// TranscriptSegment schema for validating API requests/responses
export const transcriptSegmentSchema = z.object({
  text: z.string(),
  timestamp: z.number(),
});

export type TranscriptSegment = z.infer<typeof transcriptSegmentSchema>;

// Videos table
export const videos = pgTable("videos", {
  id: text("id").primaryKey(), // Using YouTube video ID as the primary key
  url: text("url").notNull(),
  title: text("title").notNull(),
  channelTitle: text("channel_title").notNull(),
  duration: text("duration").notNull(),
  transcript: jsonb("transcript").notNull().$type<TranscriptSegment[]>(),
  summary: text("summary"),
  thumbnailUrl: text("thumbnail_url"),
  processedAt: timestamp("processed_at").notNull().defaultNow(),
});

export const insertVideoSchema = createInsertSchema(videos);
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;

// Schema for transcript request
export const transcriptRequestSchema = z.object({
  videoUrl: z.string().url("Please provide a valid URL"),
});

// Schema for summary request
export const summaryRequestSchema = z.object({
  videoId: z.string(),
  transcript: z.string(),
});

// Users table kept for compatibility with existing code
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
