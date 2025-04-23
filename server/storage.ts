import { videos, type Video, type InsertVideo, type User, type InsertUser, users, TranscriptSegment } from "@shared/schema";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations (kept for compatibility)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Video operations
  getVideoById(id: string): Promise<Video | undefined>;
  getAllVideos(): Promise<Video[]>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideoSummary(id: string, summary: string): Promise<Video | undefined>;
  clearAllVideos(): Promise<void>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private videos: Map<string, Video>;
  private currentUserId: number;

  constructor() {
    this.users = new Map();
    this.videos = new Map();
    this.currentUserId = 1;
  }

  // User operations (kept for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Video operations
  async getVideoById(id: string): Promise<Video | undefined> {
    return this.videos.get(id);
  }

  async getAllVideos(): Promise<Video[]> {
    return Array.from(this.videos.values())
      .sort((a, b) => {
        // Sort by processed date, newest first
        const aDate = new Date(a.processedAt);
        const bDate = new Date(b.processedAt);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 10); // Return only the 10 most recent
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const newVideo: Video = {
      ...video,
      processedAt: new Date(),
    };
    this.videos.set(video.id, newVideo);
    return newVideo;
  }

  async updateVideoSummary(id: string, summary: string): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo: Video = {
      ...video,
      summary,
    };
    
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }

  async clearAllVideos(): Promise<void> {
    this.videos.clear();
  }
}

// Export singleton instance
export const storage = new MemStorage();
