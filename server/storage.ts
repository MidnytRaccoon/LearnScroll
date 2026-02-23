import { db } from "./db";
import {
  contentItems,
  userStats,
  type ContentItem,
  type InsertContentItem,
  type UserStats,
  type InsertUserStats,
  type UpdateContentRequest,
  type UpdateUserStatsRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Content Items
  getContentItems(focus?: 'low' | 'medium' | 'high'): Promise<ContentItem[]>;
  getContentItem(id: number): Promise<ContentItem | undefined>;
  createContentItem(item: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, updates: UpdateContentRequest): Promise<ContentItem>;
  deleteContentItem(id: number): Promise<void>;
  incrementSurfaced(id: number): Promise<ContentItem>;
  
  // User Stats
  getUserStats(): Promise<UserStats>;
  updateUserStats(updates: UpdateUserStatsRequest): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  async getContentItems(focus?: 'low' | 'medium' | 'high'): Promise<ContentItem[]> {
    // For MVP, if focus is provided, filter. Otherwise, return all unseen/in_progress
    // Let's just return all non-completed for now, sorted by dateAdded
    // Real implementation might map focus 'low' -> 'light', 'medium' -> 'medium', 'high' -> 'deep'
    const allItems = await db.select().from(contentItems).orderBy(desc(contentItems.dateAdded));
    let filtered = allItems.filter(item => item.status !== 'completed');
    
    if (focus) {
      const difficultyMap = {
        'low': 'light',
        'medium': 'medium',
        'high': 'deep'
      };
      const diff = difficultyMap[focus];
      filtered = filtered.filter(item => item.difficulty === diff || !item.difficulty);
    }
    
    return filtered;
  }

  async getContentItem(id: number): Promise<ContentItem | undefined> {
    const [item] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    return item;
  }

  async createContentItem(item: InsertContentItem): Promise<ContentItem> {
    const [created] = await db.insert(contentItems).values(item).returning();
    return created;
  }

  async updateContentItem(id: number, updates: UpdateContentRequest): Promise<ContentItem> {
    const [updated] = await db.update(contentItems)
      .set(updates)
      .where(eq(contentItems.id, id))
      .returning();
    return updated;
  }

  async deleteContentItem(id: number): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id));
  }

  async incrementSurfaced(id: number): Promise<ContentItem> {
    const item = await this.getContentItem(id);
    if (!item) throw new Error("Item not found");
    const [updated] = await db.update(contentItems)
      .set({ timesSurfaced: item.timesSurfaced + 1 })
      .where(eq(contentItems.id, id))
      .returning();
    return updated;
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats).where(eq(userStats.id, 1));
    if (!stats) {
      // Create initial stats row
      [stats] = await db.insert(userStats).values({}).returning();
    }
    return stats;
  }

  async updateUserStats(updates: UpdateUserStatsRequest): Promise<UserStats> {
    const stats = await this.getUserStats();
    const [updated] = await db.update(userStats)
      .set(updates)
      .where(eq(userStats.id, stats.id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
