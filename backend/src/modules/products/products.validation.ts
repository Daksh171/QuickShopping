import { z } from 'zod';

export const productQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'newest']).default('newest'),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;
