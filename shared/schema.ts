import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"; // Switch to sqlite-core
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";



export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }), // SQLite uses integer primary keys
  title: text("title").notNull(),
  type: text("type").notNull(), 
  url: text("url"),
  localPath: text("local_path"),
  thumbnailUrl: text("thumbnail_url"), // Original auto-extracted thumb
  displayImageUrl: text("display_image_url"), // Our new manual override field
  estimatedMinutes: integer("estimated_minutes"),
  difficulty: text("difficulty"), 

  contentBody: text("content_body"), // For your 10k character rich text
  lastEdited: integer("last_edited", { mode: 'timestamp' }), // Tracking the MM/DD/YYYY - HH:mm

  // SQLite doesn't have native JSONB. We store it as a string and parse/stringify.
  tags: text("tags"), 
  status: text("status").notNull().default("unseen"), 
  progressPercent: integer("progress_percent").notNull().default(0),
  // SQLite uses integers (Unix timestamps) or strings for dates
  dateAdded: integer("date_added", { mode: 'timestamp' }).notNull().default(new Date()),
  dateCompleted: integer("date_completed", { mode: 'timestamp' }),
  userNote: text("user_note"),
  priority: integer("priority").notNull().default(0), // Change default to 0 for a neutral starting point
  timesSurfaced: integer("times_surfaced").notNull().default(0),
  platformName: text("platform_name"),
  author: text("author"),
});



export const userStats = sqliteTable("user_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalItemsCompleted: integer("total_items_completed").notNull().default(0),
  totalMinutesLearned: integer("total_minutes_learned").notNull().default(0),
  lastActiveDate: integer("last_active_date", { mode: 'timestamp' }),
  xpTotal: integer("xp_total").notNull().default(0),
});

// Add the explicit mapping for 'tags' to resolve the SyntaxError
export const insertContentItemSchema = createInsertSchema(contentItems, {
  tags: z.string().optional(),
  dateCompleted: z.coerce.date().optional().nullable(),
  contentBody: z.string().max(10000).optional(),
  displayImageUrl: z.string().url().optional().or(z.literal("")), // <-- ADD THIS
}).omit({
  id: true,
  dateAdded: true,
  timesSurfaced: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats, {
  // 3. Proactively add coercion here too for consistency
  lastActiveDate: z.coerce.date().optional().nullable(),
}).omit({
  id: true,
});




// Add these exports to the bottom of schema.ts
export const updateContentSchema = insertContentItemSchema.partial();
export const updateUserStatsSchema = insertUserStatsSchema.partial();

export type UpdateContentRequest = z.infer<typeof updateContentSchema>;
export type UpdateUserStatsRequest = z.infer<typeof updateUserStatsSchema>;

// Types remain the same
export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = z.infer<typeof insertContentItemSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;