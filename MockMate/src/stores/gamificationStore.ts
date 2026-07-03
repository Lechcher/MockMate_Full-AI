/**
 * Gamification store - transient state with persistence
 * 
 * Stores XP, gems, streak locally for instant UI updates
 * Synced with Sanity via API routes
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GamificationState } from '../../types/user';

interface GamificationStore extends GamificationState {
  // Actions
  setGamification: (state: GamificationState) => void;
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => void;
  incrementStreak: () => void;
  activateStreakFreeze: () => void;
  activateDoubleXP: (expiresAt: string) => void;
  incrementInterviewsToday: () => void;
  resetInterviewsToday: () => void;
  reset: () => void;
}

const initialState: GamificationState = {
  streak: 0,
  streakLastUpdated: new Date().toISOString(),
  streakFreezeActive: false,
  xp: 0,
  level: 1,
  gems: 0,
  totalGemsEarned: 0,
  doubleXpActive: false,
  doubleXpExpiresAt: undefined,
  completedInterviewsToday: 0,
  lastInterviewDate: undefined,
};

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setGamification: (state: GamificationState) => set(state),

      addXP: (amount: number) =>
        set((state) => {
          const newXP = state.xp + amount;
          const newLevel = Math.floor(newXP / 100) + 1; // Simple level calculation
          return { xp: newXP, level: newLevel };
        }),

      addGems: (amount: number) =>
        set((state) => ({
          gems: state.gems + amount,
          totalGemsEarned: state.totalGemsEarned + amount,
        })),

      spendGems: (amount: number) =>
        set((state) => ({
          gems: Math.max(0, state.gems - amount),
        })),

      incrementStreak: () =>
        set((state) => ({
          streak: state.streak + 1,
          streakLastUpdated: new Date().toISOString(),
        })),

      activateStreakFreeze: () =>
        set(() => ({
          streakFreezeActive: true,
        })),

      activateDoubleXP: (expiresAt: string) =>
        set(() => ({
          doubleXpActive: true,
          doubleXpExpiresAt: expiresAt,
        })),

      incrementInterviewsToday: () =>
        set((state) => ({
          completedInterviewsToday: state.completedInterviewsToday + 1,
          lastInterviewDate: new Date().toISOString().split('T')[0],
        })),

      resetInterviewsToday: () =>
        set(() => ({
          completedInterviewsToday: 0,
        })),

      reset: () => set(initialState),
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
