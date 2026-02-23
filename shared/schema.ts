import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contentItems = pgTable("content_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // youtube, article, pdf, tiktok, instagram, course_launcher, manual
  url: text("url"),
  localPath: text("local_path"),
  thumbnailUrl: text("thumbnail_url"),
  estimatedMinutes: integer("estimated_minutes"),
  difficulty: text("difficulty"), // light, medium, deep
  tags: jsonb("tags").$type<string[]>(), // Array of strings
  status: text("status").notNull().default("unseen"), // unseen, in_progress, completed
  progressPercent: integer("progress_percent").notNull().default(0),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  dateCompleted: timestamp("date_completed"),
  userNote: text("user_note"),
  priority: integer("priority").notNull().default(3), // 1 to 5
  timesSurfaced: integer("times_surfaced").notNull().default(0),
  platformName: text("platform_name"),
  author: text("author"),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalItemsCompleted: integer("total_items_completed").notNull().default(0),
  totalMinutesLearned: integer("total_minutes_learned").notNull().default(0),
  lastActiveDate: timestamp("last_active_date"),
  xpTotal: integer("xp_total").notNull().default(0),
});

export const insertContentItemSchema = createInsertSchema(contentItems).omit({
  id: true,
  dateAdded: true,
  timesSurfaced: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

// Request & Response Types
export type CreateContentRequest = InsertContentItem;
export type UpdateContentRequest = Partial<InsertContentItem> & { userNote?: string, status?: string, progressPercent?: number, dateCompleted?: Date };
export type ContentResponse = ContentItem;
export type ContentListResponse = ContentItem[];

export type UpdateUserStatsRequest = Partial<InsertUserStats>;
export type UserStatsResponse = UserStats;

// Query types
export interface FeedQueryParams {
  focus?: 'low' | 'medium' | 'high'; // maps to light, medium, deep roughly
  type?: string;
}

export type ScrapedContentData = {
  title: string;
  type: string;
  thumbnailUrl?: string;
  author?: string;
  platformName?: string;
  estimatedMinutes?: number;
  contentBody?: string; // For articles
};
