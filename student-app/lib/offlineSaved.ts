import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

const QUIZ_KEY = 'cache_saved_quizzes';
const DECK_KEY = 'cache_saved_flashcards';

function getFilePath(key: string) {
  const directory = FileSystem.documentDirectory;
  if (!directory) throw new Error('Offline storage is unavailable on this device.');
  return `${directory}${key}.json`;
}

async function readJson<T>(key: string): Promise<T | null> {
  if (Platform.OS === 'web') {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : null;
  }

  const path = getFilePath(key);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  const raw = await FileSystem.readAsStringAsync(path);
  return raw ? JSON.parse(raw) as T : null;
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  const raw = JSON.stringify(value);
  if (Platform.OS === 'web') {
    localStorage.setItem(key, raw);
    return;
  }

  const path = getFilePath(key);
  await FileSystem.writeAsStringAsync(path, raw);
}

function assertSavedList<T>(value: T[] | null, kind: string): T[] {
  if (value === null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`Saved ${kind} storage has an invalid format.`);
  }
  return value;
}

function validateQuiz(quiz: Omit<OfflineSavedQuiz, 'saved_at'>): void {
  if (!quiz.id || !quiz.topic.trim() || quiz.questions.length === 0) {
    throw new Error('A quiz must include a title and at least one question before it can be saved offline.');
  }

  for (const [index, question] of quiz.questions.entries()) {
    if (!question.question_text.trim() || !question.correct_answer.trim()) {
      throw new Error(`Question ${index + 1} is missing its text or answer.`);
    }

    if (question.question_type !== 'essay') {
      if (!question.options || question.options.length < 2 || !question.options.includes(question.correct_answer)) {
        throw new Error(`Question ${index + 1} is missing its answer choices.`);
      }
    }
  }
}

function validateDeck(deck: Omit<OfflineSavedDeck, 'saved_at'>): void {
  if (!deck.id || !deck.title.trim() || deck.cards.length === 0) {
    throw new Error('A deck must include a title and at least one card before it can be saved offline.');
  }

  for (const [index, card] of deck.cards.entries()) {
    if (!card.front.trim() || !card.back.trim()) {
      throw new Error(`Card ${index + 1} is missing its question or answer.`);
    }
  }
}

export type OfflineSavedQuestion = {
  question_text: string;
  question_type: string;
  correct_answer: string;
  options?: string[];
  type?: string;
  explanation?: string;
  explanation_right?: string;
  explanation_wrong?: string;
  user_answer?: string | null;
  is_correct?: boolean;
};

export type OfflineSavedQuiz = {
  id: string;
  saved_at: string;
  mode: 'topic' | 'file';
  topic: string;
  difficulty: string;
  percentage: number;
  questions: OfflineSavedQuestion[];
};

export type OfflineSavedDeck = {
  id: string;
  saved_at: string;
  title: string;
  cards: { front: string; back: string }[];
};

export async function getSavedQuizzes(): Promise<OfflineSavedQuiz[]> {
  return assertSavedList(await readJson<OfflineSavedQuiz[]>(QUIZ_KEY), 'quiz');
}

export async function getSavedDecks(): Promise<OfflineSavedDeck[]> {
  return assertSavedList(await readJson<OfflineSavedDeck[]>(DECK_KEY), 'deck');
}

export async function isQuizSaved(id: string): Promise<boolean> {
  const current = await getSavedQuizzes();
  const saved = current.find((quiz) => quiz.id === id);
  if (!saved) return false;
  try {
    validateQuiz(saved);
    return true;
  } catch {
    return false;
  }
}

export async function isDeckSaved(id: string): Promise<boolean> {
  const current = await getSavedDecks();
  const saved = current.find((deck) => deck.id === id);
  if (!saved) return false;
  try {
    validateDeck(saved);
    return true;
  } catch {
    return false;
  }
}

export async function saveOfflineQuiz(quiz: Omit<OfflineSavedQuiz, 'saved_at'>): Promise<void> {
  validateQuiz(quiz);
  const current = await getSavedQuizzes();
  const existingIdx = current.findIndex((q) => q.id === quiz.id);
  const next = existingIdx >= 0 ? [...current.slice(0, existingIdx), { ...quiz, saved_at: new Date().toISOString() }, ...current.slice(existingIdx + 1)] : [{ ...quiz, saved_at: new Date().toISOString() }, ...current];
  await writeJson(QUIZ_KEY, next);
  const saved = (await getSavedQuizzes()).find((item) => item.id === quiz.id);
  if (!saved || JSON.stringify(saved.questions) !== JSON.stringify(quiz.questions)) {
    throw new Error('The saved quiz could not be verified in offline storage.');
  }
}

export async function saveOfflineDeck(deck: Omit<OfflineSavedDeck, 'saved_at'>): Promise<void> {
  validateDeck(deck);
  const current = await getSavedDecks();
  const existingIdx = current.findIndex((d) => d.id === deck.id);
  const next = existingIdx >= 0 ? [...current.slice(0, existingIdx), { ...deck, saved_at: new Date().toISOString() }, ...current.slice(existingIdx + 1)] : [{ ...deck, saved_at: new Date().toISOString() }, ...current];
  await writeJson(DECK_KEY, next);
  const saved = (await getSavedDecks()).find((item) => item.id === deck.id);
  if (!saved || JSON.stringify(saved.cards) !== JSON.stringify(deck.cards)) {
    throw new Error('The saved deck could not be verified in offline storage.');
  }
}

export async function deleteSavedQuiz(id: string): Promise<void> {
  const current = await getSavedQuizzes();
  await writeJson(QUIZ_KEY, current.filter((q) => q.id !== id));
}

export async function deleteSavedDeck(id: string): Promise<void> {
  const current = await getSavedDecks();
  await writeJson(DECK_KEY, current.filter((d) => d.id !== id));
}
