import { api } from '@/lib/api';

export async function createDeckFromTopic(topic: string, count?: number) {
  const res = await api.post('flashcards/decks', { topic, count });
  return res.data?.data;
}

export async function createDeckFromExtraction(extractionId: string) {
  const res = await api.post('flashcards/decks', { extraction_id: extractionId });
  return res.data?.data;
}

export async function fetchDeck(id: string) {
  const res = await api.get(`/flashcards/decks/${id}`);
  return res.data?.data;
}

export async function saveCards(deckId: string, cards: any[]) {
  return api.post(`flashcards/decks/${deckId}/cards`, { cards });
}
