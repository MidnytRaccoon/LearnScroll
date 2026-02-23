import { z } from 'zod';
import { insertContentItemSchema, contentItems, userStats, insertUserStatsSchema } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  content: {
    list: {
      method: 'GET' as const,
      path: '/api/content' as const,
      input: z.object({
        focus: z.enum(['low', 'medium', 'high']).optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof contentItems.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/content/:id' as const,
      responses: {
        200: z.custom<typeof contentItems.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/content' as const,
      input: insertContentItemSchema,
      responses: {
        201: z.custom<typeof contentItems.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/content/:id' as const,
      input: insertContentItemSchema.partial(),
      responses: {
        200: z.custom<typeof contentItems.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/content/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    detect: {
      method: 'POST' as const,
      path: '/api/content/detect' as const,
      input: z.object({ url: z.string().url() }),
      responses: {
        200: z.object({
          title: z.string().optional(),
          type: z.string(),
          thumbnailUrl: z.string().optional(),
          author: z.string().optional(),
          platformName: z.string().optional(),
          estimatedMinutes: z.number().optional(),
          contentBody: z.string().optional(),
        }),
        400: errorSchemas.validation,
      }
    },
    surfaced: {
      method: 'POST' as const,
      path: '/api/content/:id/surfaced' as const,
      responses: {
        200: z.custom<typeof contentItems.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats' as const,
      responses: {
        200: z.custom<typeof userStats.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ContentInput = z.infer<typeof api.content.create.input>;
export type ContentUpdateInput = z.infer<typeof api.content.update.input>;
export type ContentResponse = z.infer<typeof api.content.create.responses[201]>;
export type ContentListResponse = z.infer<typeof api.content.list.responses[200]>;
export type StatsResponse = z.infer<typeof api.stats.get.responses[200]>;
export type DetectResponse = z.infer<typeof api.content.detect.responses[200]>;
