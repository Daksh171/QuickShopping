import { z } from 'zod';

export const suggestionsQuerySchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.coerce.number().int().min(1).max(10).default(6),
});

export type SuggestionsQuery = z.infer<typeof suggestionsQuerySchema>;

export const searchEventBodySchema = z.object({
  query: z.string().min(1).max(100),
});

export type SearchEventBody = z.infer<typeof searchEventBodySchema>;
