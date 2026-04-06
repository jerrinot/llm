// ============================================
// PROGRESS ENGINE — localStorage-backed
// ============================================

import { lessons, guidedPath } from './curriculum';

const STORAGE_KEY = 'llm-tutorial-progress';

export interface ProgressState {
  startedAt: string | null;
  lastOpenedLessonId: string | null;
  completedLessons: string[];
  passedQuizzes: string[];
  lessonAttempts: Record<string, number>;
  capstoneStatus: 'locked' | 'unlocked' | 'passed';
}

function defaultState(): ProgressState {
  return {
    startedAt: null,
    lastOpenedLessonId: null,
    completedLessons: [],
    passedQuizzes: [],
    lessonAttempts: {},
    capstoneStatus: 'locked',
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as ProgressState;
  } catch {
    return defaultState();
  }
}

export function saveProgress(state: ProgressState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function isLessonUnlocked(_lessonId: string, _state: ProgressState): boolean {
  return true;
}

export function completeLesson(lessonId: string, state: ProgressState): ProgressState {
  const next = { ...state };
  if (!next.startedAt) next.startedAt = new Date().toISOString();
  if (!next.completedLessons.includes(lessonId)) {
    next.completedLessons = [...next.completedLessons, lessonId];
  }
  next.lastOpenedLessonId = lessonId;
  next.lessonAttempts[lessonId] = (next.lessonAttempts[lessonId] || 0) + 1;
  return next;
}

export function passQuiz(quizId: string, state: ProgressState): ProgressState {
  const next = { ...state };
  if (!next.passedQuizzes.includes(quizId)) {
    next.passedQuizzes = [...next.passedQuizzes, quizId];
  }
  if (!next.completedLessons.includes(quizId)) {
    next.completedLessons = [...next.completedLessons, quizId];
  }
  return next;
}

export function getProgressPercent(state: ProgressState): number {
  const total = guidedPath.length;
  if (total === 0) return 0;
  return Math.round((state.completedLessons.length / total) * 100);
}

export function getNextUncompletedLesson(state: ProgressState): string | null {
  for (const id of guidedPath) {
    if (!state.completedLessons.includes(id) && isLessonUnlocked(id, state)) {
      return id;
    }
  }
  return null;
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
