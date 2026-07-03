/**
 * Shop-related types
 */

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  price: number; // gems
  icon: string; // Lucide icon name
  type: 'streak_freeze' | 'double_xp';
  duration?: number; // hours for temporary power-ups
}

export interface VIPPlan {
  id: string;
  name: string;
  price: string; // Display price
  billingPeriod: 'monthly' | 'yearly';
  discount?: number; // percentage
  revenueCatProductId: string;
  features: string[];
  isBestValue?: boolean;
}

export interface ShopItem {
  id: string;
  type: 'power_up' | 'vip_plan' | 'daily_deal';
  item: PowerUp | VIPPlan;
  badge?: string; // "Best Value", "Limited Time", etc.
}
