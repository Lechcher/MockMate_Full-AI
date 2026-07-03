/**
 * Interview store - active interview session and favorites
 * 
 * Stores in-progress interview answers and favorite interview IDs
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { InterviewSession } from '../../types/interview';

interface InterviewStore {
  // Active session
  activeSession: InterviewSession | null;
  currentQuestionIndex: number;

  // Favorites (interview IDs)
  favorites: string[];

  // Actions
  startSession: (interviewId: string, mode: 'text' | 'voice') => void;
  saveAnswer: (questionKey: string, answer: string, audioUrl?: string) => void;
  nextQuestion: () => void;
  completeSession: () => void;
  clearSession: () => void;

  addFavorite: (interviewId: string) => void;
  removeFavorite: (interviewId: string) => void;
  isFavorite: (interviewId: string) => boolean;
  reset: () => void;
}

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      activeSession: null,
      currentQuestionIndex: 0,
      favorites: [],

      startSession: (interviewId: string, mode: 'text' | 'voice') =>
        set({
          activeSession: {
            interviewId,
            mode,
            answers: [],
            startedAt: new Date().toISOString(),
            totalDuration: 0,
          },
          currentQuestionIndex: 0,
        }),

      saveAnswer: (questionKey: string, answer: string, audioUrl?: string) =>
        set((state) => {
          if (!state.activeSession) return state;

          const now = new Date().toISOString();
          const lastAnswer = state.activeSession.answers[state.activeSession.answers.length - 1];
          const duration = lastAnswer
            ? (new Date(now).getTime() - new Date(lastAnswer.timestamp).getTime()) / 1000
            : 0;

          return {
            activeSession: {
              ...state.activeSession,
              answers: [
                ...state.activeSession.answers,
                {
                  questionKey,
                  answer,
                  audioUrl,
                  duration,
                  timestamp: now,
                },
              ],
            },
          };
        }),

      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),

      completeSession: () =>
        set((state) => {
          if (!state.activeSession) return state;

          const now = new Date().toISOString();
          const totalDuration =
            (new Date(now).getTime() - new Date(state.activeSession.startedAt).getTime()) / 1000;

          return {
            activeSession: {
              ...state.activeSession,
              completedAt: now,
              totalDuration,
            },
          };
        }),

      clearSession: () =>
        set({
          activeSession: null,
          currentQuestionIndex: 0,
        }),

      addFavorite: (interviewId: string) =>
        set((state) => ({
          favorites: state.favorites.includes(interviewId)
            ? state.favorites
            : [...state.favorites, interviewId],
        })),

      removeFavorite: (interviewId: string) =>
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== interviewId),
        })),

      isFavorite: (interviewId: string) => {
        return get().favorites.includes(interviewId);
      },

      reset: () =>
        set({
          activeSession: null,
          currentQuestionIndex: 0,
          favorites: [],
        }),
    }),
    {
      name: 'interview-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
