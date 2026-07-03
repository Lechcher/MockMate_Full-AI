/**
 * Zod schemas for shop types
 */
import { z } from 'zod';

export const PowerUpSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number().min(0),
  icon: z.string(),
  type: z.enum(['streak_freeze', 'double_xp']),
  duration: z.number().optional(),
});

export const VIPPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(),
  billingPeriod: z.enum(['monthly', 'yearly']),
  discount: z.number().optional(),
  revenueCatProductId: z.string(),
  features: z.array(z.string()),
  isBestValue: z.boolean().optional(),
});

export const ShopItemSchema = z.object({
  id: z.string(),
  type: z.enum(['power_up', 'vip_plan', 'daily_deal']),
  item: z.union([PowerUpSchema, VIPPlanSchema]),
  badge: z.string().optional(),
});
