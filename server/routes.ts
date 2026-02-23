import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // 1. GET FEED
  app.get(api.content.list.path, async (req, res) => {
    try {
      const focus = req.query.focus as 'low' | 'medium' | 'high' | undefined;
      const items = await storage.getContentItems(focus);
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 2. CREATE CONTENT (The one that was missing!)
  app.post(api.content.create.path, async (req, res) => {
    try {
      const input = api.content.create.input.parse(req.body);
      const item = await storage.createContentItem(input);
      res.status(201).json(item); // Note the 201 status here
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 3. AUTO-EXTRACT/DETECT
  app.post(api.content.detect.path, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) return res.status(400).json({ message: "URL is required" });

      let data: any = { url, type: "article", title: "New Article" };

      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const response = await fetch(`https://www.youtube.com/oembed?url=${url}&format=json`);
        const json = await response.json();
        data = {
          title: json.title,
          thumbnailUrl: json.thumbnail_url,
          author: json.author_name,
          platformName: "YouTube",
          type: "youtube",
          estimatedMinutes: 10,
        };
      } else if (url.includes("tiktok.com")) {
        data = {
          title: "TikTok Video",
          platformName: "TikTok",
          type: "tiktok",
          estimatedMinutes: 3,
        };
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to extract details" });
    }
  });

  // 4. UPDATE / PATCH
  app.patch(api.content.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.content.update.input.parse(req.body);
      const updated = await storage.updateContentItem(id, input);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // 5. GET STATS
  app.get(api.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // RUN SEEDER
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const items = await storage.getContentItems();
  if (items.length === 0) {
    await storage.createContentItem({
      title: "Understanding Dopamine Detox",
      type: "youtube",
      url: "https://www.youtube.com/watch?v=9QiE-M1LrZk",
      thumbnailUrl: "https://img.youtube.com/vi/9QiE-M1LrZk/hqdefault.jpg",
      estimatedMinutes: 15,
      difficulty: "light",
      tags: JSON.stringify(["psychology", "productivity"]),
    });
  }
}