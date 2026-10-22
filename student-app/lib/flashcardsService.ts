import { api } from '@/lib/api';

/** Normalizes deck responses: supports `{ data: { id } }` and `{ id }`. */
function extractDeck(body: any) {
  const deck = body?.data && typeof body.data === 'object' ? body.data : body;
  return deck?.id != null ? { ...deck, id: deck.id } : null;
}

export async function createDeckFromTopic(topic: string, count?: number) {
  const res = await api.post('flashcards/decks', { topic, count });
  return extractDeck(res.data);
}

export async function createDeckFromExtraction(extractionId: string, title?: string) {
  const res = await api.post('flashcards/decks', { extraction_id: extractionId, topic: title });
  return extractDeck(res.data);
}

export async function fetchDeck(id: string) {
  const res = await api.get(`flashcards/decks/${id}`);
  const raw = res.data?.data || res.data?.deck || res.data;
  if (!raw) return null;
  return {
    ...raw,
    flashcards: raw.flashcards || raw.cards || (res.data?.cards) || [],
  };
}

export async function saveCards(deckId: string, cards: any[]) {
  return api.post(`flashcards/decks/${deckId}/cards`, { cards });
}
