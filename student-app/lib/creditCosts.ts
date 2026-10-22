/**
 * Client-side mirror of skeeme-go/internal/credits/pricing.go.
 * The SERVER is the source of truth and re-checks every request; these helpers
 * exist so the app can stop the user BEFORE any deck is created, camera image
 * is uploaded, or loading screen starts - never mid-generation.
 *
 * Keep the numbers in sync with pricing.go.
 */
import type { User } from '@/types';

export const SCAN_SOLVE_COST = 25;
export const SUMMARY_COST = 15;

const QUIZ_COST_PER_BLOCK = 20;
const QUIZ_BLOCK_SIZE = 10;
const FLASHCARD_COST_PER_BLOCK = 20;
const FLASHCARD_BLOCK_SIZE = 5;

const blockCost = (count: number, blockSize: number, perBlock: number) =>
    count > 0 ? Math.ceil(count / blockSize) * perBlock : 0;

/** 1-10 questions = 20, 11-20 = 40, 21-30 = 60 */
export const quizCost = (questionCount: number) =>
    blockCost(questionCount, QUIZ_BLOCK_SIZE, QUIZ_COST_PER_BLOCK);

/** 1-5 cards = 20, 6-10 = 40 ... 26-30 = 120 */
export const flashcardCost = (cardCount: number) =>
    blockCost(cardCount, FLASHCARD_BLOCK_SIZE, FLASHCARD_COST_PER_BLOCK);

/**
 * True when the user can afford `cost`. Mirrors the server: a Pro/Max user at 0
 * credits is let through because the server grants their daily 500-credit refill
 * on the first request of the day. Everyone else needs balance >= cost.
 */
export function hasEnoughCredits(user: Partial<User> | null | undefined, cost: number): boolean {
    const credits = user?.credits ?? 0;
    const isPaid = user?.plan_name === 'pro' || user?.plan_name === 'max';
    if (isPaid && credits <= 0) return true;
    return credits >= cost;
}

/**
 * Universal server-side credit verification.
 * Refetches the latest user record from the server first to ensure
 * multi-device / background refill accuracy, then checks whether the
 * balance covers `cost`.
 *
 * If insufficient, opens the Out of Credits modal by default.
 */
export async function verifySufficientCredits(
    cost: number,
    feature?: 'scan' | 'quiz' | 'flashcard' | 'chat' | null,
    showModal: boolean = true
): Promise<boolean> {
    const { useAuthStore } = await import('@/store/authStore');
    
    try {
        await useAuthStore.getState().checkAuth();
    } catch {
        // Fall back to local store if offline
    }

    const latestUser = useAuthStore.getState().user;
    const canAfford = hasEnoughCredits(latestUser, cost);

    if (!canAfford && showModal) {
        useAuthStore.getState().toggleCreditsModal(true, feature, true);
    }

    return canAfford;
}

/**
 * Universal post-generation balance sync.
 * Refreshes user credits after generation completes so all badges and balances
 * across the app update immediately.
 */
export async function syncCreditBalance(): Promise<void> {
    try {
        const { useAuthStore } = await import('@/store/authStore');
        await useAuthStore.getState().checkAuth();
    } catch {
        // Ignore background sync errors
    }
}
