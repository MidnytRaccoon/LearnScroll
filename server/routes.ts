import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.content.list.path, async (req, res) => {
    try {
      const focus = req.query.focus as 'low' | 'medium' | 'high' | undefined;
      const items = await storage.getContentItems(focus);
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(api.content.get.path, async (req, res) => {
    const item = await storage.getContentItem(Number(req.params.id));
    if (!item) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    res.json(item);
  });

  app.post(api.content.create.path, async (req, res) => {
    try {
      const input = api.content.create.input.parse(req.body);
      const item = await storage.createContentItem(input);
      res.status(201).json(item);
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

  app.patch(api.content.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const item = await storage.getContentItem(id);
      if (!item) {
        return res.status(404).json({ message: 'Content item not found' });
      }
      const input = api.content.update.input.parse(req.body);
      const updated = await storage.updateContentItem(id, input);
      res.json(updated);
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

  app.delete(api.content.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    const item = await storage.getContentItem(id);
    if (!item) {
      return res.status(404).json({ message: 'Content item not found' });
    }
    await storage.deleteContentItem(id);
    res.status(204).end();
  });

  app.post(api.content.surfaced.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const updated = await storage.incrementSurfaced(id);
      res.json(updated);
    } catch (err) {
      res.status(404).json({ message: 'Content item not found' });
    }
  });

  app.post(api.content.detect.path, async (req, res) => {
    try {
      const { url } = api.content.detect.input.parse(req.body);
      
      // Basic detection logic matching the brief
      let type = 'article';
      let title = 'Detected Content';
      let thumbnailUrl = undefined;
      let platformName = undefined;
      
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/') || url.includes('youtube.com/shorts')) {
        type = 'youtube';
        platformName = 'YouTube';
        // Extract video ID (very simplified)
        const match = url.match(/(?:v=|youtu\.be\/|shorts\/)([^&?]+)/);
        if (match && match[1]) {
          thumbnailUrl = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
        }
      } else if (url.includes('tiktok.com')) {
        type = 'tiktok';
        platformName = 'TikTok';
      } else if (url.includes('instagram.com/reel')) {
        type = 'instagram';
        platformName = 'Instagram';
      } else if (url.includes('udemy.com') || url.includes('coursera.org')) {
        type = 'course_launcher';
        platformName = url.includes('udemy.com') ? 'Udemy' : 'Coursera';
      }

      res.json({
        type,
        title,
        thumbnailUrl,
        platformName,
        url
      });
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

  app.get(api.stats.get.path, async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

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
      tags: ["psychology", "productivity"],
    });

    await storage.createContentItem({
      title: "React Server Components Architecture",
      type: "article",
      url: "https://react.dev/blog/2023/03/22/react-labs-what-we-have-been-working-on-march-2023",
      estimatedMinutes: 25,
      difficulty: "deep",
      tags: ["react", "webdev"],
    });

    await storage.createContentItem({
      title: "Quick Math Trick",
      type: "tiktok",
      url: "https://www.tiktok.com/@mathgenius/video/7123456789012345678",
      estimatedMinutes: 2,
      difficulty: "light",
      tags: ["math", "quick"],
    });
    
    await storage.createContentItem({
      title: "Advanced TypeScript Course",
      type: "course_launcher",
      url: "https://www.udemy.com/course/advanced-typescript/",
      estimatedMinutes: 1200,
      difficulty: "deep",
      platformName: "Udemy",
      tags: ["typescript", "course"],
    });
  }
}
