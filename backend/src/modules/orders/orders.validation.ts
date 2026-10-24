import { z } from 'zod';

export const createOrderSchema = z.object({
  idempotencyKey: z.string().min(1, 'Idempotency key is required').max(64),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
