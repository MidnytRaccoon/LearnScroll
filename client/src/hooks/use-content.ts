import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ContentInput, type ContentUpdateInput, type FeedQueryParams } from "@shared/routes";

// GET /api/content
export function useFeed(params?: FeedQueryParams) {
  const queryParams = new URLSearchParams();
  if (params?.focus) queryParams.set('focus', params.focus);
  
  const url = `${api.content.list.path}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  return useQuery({
    queryKey: ['feed', params?.focus],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error('Failed to fetch feed');
      return api.content.list.responses[200].parse(await res.json());
    },
  });
}

// POST /api/content
export function useCreateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ContentInput) => {
      const validated = api.content.create.input.parse(data);
      const res = await fetch(api.content.create.path, {
        method: api.content.create.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to create content');
      return api.content.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
}

// PATCH /api/content/:id
export function useUpdateContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & ContentUpdateInput) => {
      const url = buildUrl(api.content.update.path, { id });
      const res = await fetch(url, {
        method: api.content.update.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to update content');
      return api.content.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] }); // Completing updates stats
    },
  });
}

// POST /api/content/:id/surfaced
export function useMarkSurfaced() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.content.surfaced.path, { id });
      const res = await fetch(url, {
        method: api.content.surfaced.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to mark as surfaced');
      return api.content.surfaced.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      // Background update, no strict need to invalidate feed heavily
      // to avoid UI jumping, but can invalidate quietly.
    },
  });
}

// POST /api/content/detect
/*
export function useDetectUrl() {
  return useMutation({
    mutationFn: async (url: string) => {
      const payload = api.content.detect.input.parse({ url });
      const res = await fetch(api.content.detect.path, {
        method: api.content.detect.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error('Failed to detect URL metadata');
      return api.content.detect.responses[200].parse(await res.json());
    },
  });
}
*/
export function useDetectUrl() {
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/content/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Detection failed");
      return res.json();
    },
  });
}