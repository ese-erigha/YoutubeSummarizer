import { videos, type Video, type InsertVideo, type User, type InsertUser, users, TranscriptSegment } from "@shared/schema";
import fs from 'fs';
import path from 'path';

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

// Constants for storage keys
const STORAGE_KEYS = {
  VIDEOS: 'tubes_videos',
  USERS: 'tubes_users',
  USER_ID_COUNTER: 'tubes_user_id'
};

// Node.js file-based storage (server-side persistence)
export class FileStorage implements IStorage {
  private dataDir: string;
  private currentUserId: number;
  private cache: {
    videos: Video[];
    users: User[];
  };

  constructor() {
    this.dataDir = path.join(process.cwd(), '.data');
    this.cache = {
      videos: [],
      users: []
    };
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Initialize storage files if empty
    this.initializeStorage();
    
    // Load data into cache
    this.loadData();
    
    // Initialize user ID counter
    const savedUserId = this.readFile(STORAGE_KEYS.USER_ID_COUNTER);
    this.currentUserId = savedUserId ? parseInt(savedUserId) : 1;
  }

  // Initialize storage files if they don't exist
  private initializeStorage(): void {
    const videosPath = path.join(this.dataDir, STORAGE_KEYS.VIDEOS + '.json');
    const usersPath = path.join(this.dataDir, STORAGE_KEYS.USERS + '.json');
    const userIdPath = path.join(this.dataDir, STORAGE_KEYS.USER_ID_COUNTER + '.txt');
    
    if (!fs.existsSync(videosPath)) {
      fs.writeFileSync(videosPath, JSON.stringify([]));
    }
    
    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify([]));
    }
    
    if (!fs.existsSync(userIdPath)) {
      fs.writeFileSync(userIdPath, '1');
    }
  }

  // Load all data into memory
  private loadData(): void {
    const videosJson = this.readFile(STORAGE_KEYS.VIDEOS);
    if (videosJson) {
      try {
        this.cache.videos = JSON.parse(videosJson);
      } catch (error) {
        console.error('Error parsing videos JSON:', error);
        this.cache.videos = [];
      }
    }
    
    const usersJson = this.readFile(STORAGE_KEYS.USERS);
    if (usersJson) {
      try {
        this.cache.users = JSON.parse(usersJson);
      } catch (error) {
        console.error('Error parsing users JSON:', error);
        this.cache.users = [];
      }
    }
  }

  // Helper methods for file operations
  private readFile(key: string): string | null {
    try {
      const filePath = path.join(this.dataDir, key + (key.endsWith('.json') ? '' : '.json'));
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
      return null;
    } catch (error) {
      console.error(`Error reading file (${key}):`, error);
      return null;
    }
  }

  private writeFile(key: string, data: string): void {
    try {
      const filePath = path.join(this.dataDir, key + (key.endsWith('.json') ? '' : '.json'));
      fs.writeFileSync(filePath, data);
    } catch (error) {
      console.error(`Error writing file (${key}):`, error);
    }
  }

  // User operations (kept for compatibility)
  async getUser(id: number): Promise<User | undefined> {
    return this.cache.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.cache.users.find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    
    // Update user ID counter
    fs.writeFileSync(
      path.join(this.dataDir, STORAGE_KEYS.USER_ID_COUNTER + '.txt'),
      this.currentUserId.toString()
    );
    
    const user: User = { ...insertUser, id };
    
    this.cache.users.push(user);
    this.writeFile(STORAGE_KEYS.USERS, JSON.stringify(this.cache.users));
    
    return user;
  }

  // Video operations
  async getVideoById(id: string): Promise<Video | undefined> {
    return this.cache.videos.find(video => video.id === id);
  }

  async getAllVideos(): Promise<Video[]> {
    // Sort by processed date, newest first
    return [...this.cache.videos]
      .sort((a, b) => {
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
    
    // Check if video already exists to avoid duplicates
    const existingIndex = this.cache.videos.findIndex(v => v.id === video.id);
    if (existingIndex >= 0) {
      this.cache.videos[existingIndex] = newVideo;
    } else {
      this.cache.videos.push(newVideo);
    }
    
    this.writeFile(STORAGE_KEYS.VIDEOS, JSON.stringify(this.cache.videos));
    return newVideo;
  }

  async updateVideoSummary(id: string, summary: string): Promise<Video | undefined> {
    const videoIndex = this.cache.videos.findIndex(video => video.id === id);
    
    if (videoIndex === -1) return undefined;
    
    const updatedVideo: Video = {
      ...this.cache.videos[videoIndex],
      summary,
    };
    
    this.cache.videos[videoIndex] = updatedVideo;
    this.writeFile(STORAGE_KEYS.VIDEOS, JSON.stringify(this.cache.videos));
    
    return updatedVideo;
  }

  async clearAllVideos(): Promise<void> {
    this.cache.videos = [];
    this.writeFile(STORAGE_KEYS.VIDEOS, JSON.stringify([]));
  }
}

// Export singleton instance
export const storage = new FileStorage();
