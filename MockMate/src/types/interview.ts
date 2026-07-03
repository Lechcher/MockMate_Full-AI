/**
 * Interview-related types
 */

export type Industry =
  | 'IT'
  | 'Sales'
  | 'Finance'
  | 'Design'
  | 'Manager'
  | 'Marketing'
  | 'Healthcare'
  | 'Education';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Interview {
  _id: string;
  _type: 'interview';
  title: string;
  industry: Industry;
  difficulty: Difficulty;
  focusArea: string;
  description: string;
  questionCount: number;
  estimatedDuration: number; // minutes
  rating: number; // 0-5
  reviewCount: number;
  isPremium: boolean;
  questions: InterviewQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  _key: string;
  question: string;
  expectedDuration: number; // seconds
  focusAreas: string[];
  evaluationCriteria: string[];
}

export interface InterviewAnswer {
  questionKey: string;
  answer: string;
  audioUrl?: string; // For voice mode
  duration: number; // seconds spent answering
  timestamp: string;
}

export interface InterviewSession {
  interviewId: string;
  mode: 'text' | 'voice';
  answers: InterviewAnswer[];
  startedAt: string;
  completedAt?: string;
  totalDuration: number; // seconds
}
