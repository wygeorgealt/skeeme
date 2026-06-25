import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const QUIZ_KEY = 'cache_saved_quizzes';
const DECK_KEY = 'cache_saved_flashcards';

function getFilePath(key: string) {
  return `${FileSystem.documentDirectory}${key}.json`;
}

async function readJson(key: string) {
  try {
    if (Platform.OS === 'web') {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    }

    const path = getFilePath(key);
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      return null;
    }
    const raw = await FileSystem.readAsStringAsync(path);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function writeJson(key: string, value: any) {
  const raw = JSON.stringify(value);
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, raw);
      return;
    }
    const path = getFilePath(key);
    await FileSystem.writeAsStringAsync(path, raw);
  } catch {
    // ignore
  }
}

export type OfflineSavedQuiz = {
  id: string;
  saved_at: string;
  mode: 'topic' | 'file';
  topic: string;
  difficulty: string;
  percentage: number;
  questions: any[];
};

export type OfflineSavedDeck = {
  id: string;
  saved_at: string;
  title: string;
  cards: { front: string; back: string }[];
};

export async function getSavedQuizzes(): Promise<OfflineSavedQuiz[]> {
  return (await readJson(QUIZ_KEY)) ?? [];
}

export async function getSavedDecks(): Promise<OfflineSavedDeck[]> {
  return (await readJson(DECK_KEY)) ?? [];
}

export async function saveOfflineQuiz(quiz: Omit<OfflineSavedQuiz, 'saved_at'>): Promise<void> {
  const current = await getSavedQuizzes();
  const existingIdx = current.findIndex((q) => q.id === quiz.id);
  const next = existingIdx >= 0 ? [...current.slice(0, existingIdx), { ...quiz, saved_at: new Date().toISOString() }, ...current.slice(existingIdx + 1)] : [{ ...quiz, saved_at: new Date().toISOString() }, ...current];
  await writeJson(QUIZ_KEY, next);
}

export async function saveOfflineDeck(deck: Omit<OfflineSavedDeck, 'saved_at'>): Promise<void> {
  const current = await getSavedDecks();
  const existingIdx = current.findIndex((d) => d.id === deck.id);
  const next = existingIdx >= 0 ? [...current.slice(0, existingIdx), { ...deck, saved_at: new Date().toISOString() }, ...current.slice(existingIdx + 1)] : [{ ...deck, saved_at: new Date().toISOString() }, ...current];
  await writeJson(DECK_KEY, next);
}

export async function deleteSavedQuiz(id: string): Promise<void> {
  const current = await getSavedQuizzes();
  await writeJson(QUIZ_KEY, current.filter((q) => q.id !== id));
}

export async function deleteSavedDeck(id: string): Promise<void> {
  const current = await getSavedDecks();
  await writeJson(DECK_KEY, current.filter((d) => d.id !== id));
}
