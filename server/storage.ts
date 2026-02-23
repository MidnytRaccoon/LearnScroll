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
    const allItems = await db.select().from(contentItems).orderBy(desc(contentItems.dateAdded));
    let filtered = allItems.filter(item => item.status !== 'completed');
    
    if (focus) {
      const difficultyMap: Record<string, string> = {
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
    // 1. Insert the data using .run()
    const result = await db.insert(contentItems).values(item).run();
    // 2. Get the auto-incremented ID
    const id = Number(result.lastInsertRowid);
    // 3. Fetch and return the new row
    const [created] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    if (!created) throw new Error("Failed to create content item");
    return created;
  }

  async updateContentItem(id: number, updates: UpdateContentRequest): Promise<ContentItem> {
    // 1. Perform the update
    await db.update(contentItems)
      .set(updates)
      .where(eq(contentItems.id, id))
      .run();
    // 2. Fetch and return the updated row
    const [updated] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    if (!updated) throw new Error("Item not found after update");
    return updated;
  }

  async deleteContentItem(id: number): Promise<void> {
    await db.delete(contentItems).where(eq(contentItems.id, id)).run();
  }

  async incrementSurfaced(id: number): Promise<ContentItem> {
    const item = await this.getContentItem(id);
    if (!item) throw new Error("Item not found");
    
    await db.update(contentItems)
      .set({ timesSurfaced: item.timesSurfaced + 1 })
      .where(eq(contentItems.id, id))
      .run();
      
    const [updated] = await db.select().from(contentItems).where(eq(contentItems.id, id));
    if (!updated) throw new Error("Item not found after increment");
    return updated;
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats).where(eq(userStats.id, 1));
    if (!stats) {
      // Create initial stats row if it doesn't exist
      const result = await db.insert(userStats).values({}).run();
      const id = Number(result.lastInsertRowid);
      [stats] = await db.select().from(userStats).where(eq(userStats.id, id));
    }
    return stats;
  }

  async updateUserStats(updates: UpdateUserStatsRequest): Promise<UserStats> {
    const stats = await this.getUserStats();
    await db.update(userStats)
      .set(updates)
      .where(eq(userStats.id, stats.id))
      .run();
      
    const [updated] = await db.select().from(userStats).where(eq(userStats.id, stats.id));
    if (!updated) throw new Error("Stats not found after update");
    return updated;
  }
}

// At the very bottom of storage.ts
const storage = new DatabaseStorage();
export { storage };