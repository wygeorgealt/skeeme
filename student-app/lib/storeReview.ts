import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { posthog } from '@/lib/posthog';

const STORAGE_KEY = 'store_review_state';

const MIN_GENERATIONS = 2;
const MIN_DAYS_BETWEEN_PROMPTS = 30;

export interface ReviewState {
    successfulGenerations: number;
    lastPromptAt: number | null;
    /** User tapped "Yes" and we showed the native review flow — never ask again. */
    hasReviewed: boolean;
    /** User tapped "No thanks" — never ask again. */
    declinedForever: boolean;
}

const defaultState = (): ReviewState => ({
    successfulGenerations: 0,
    lastPromptAt: null,
    hasReviewed: false,
    declinedForever: false,
});

const standardStorage = {
    getItem: async (key: string): Promise<string | null> => {
        if (Platform.OS === 'web') return localStorage.getItem(key);
        try {
            const { documentDirectory, getInfoAsync, readAsStringAsync } = (await import('expo-file-system/legacy')) as any;
            const path = `${documentDirectory}${key}.json`;
            const info = await getInfoAsync(path);
            if (!info.exists) return null;
            return await readAsStringAsync(path);
        } catch {
            return null;
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
            return;
        }
        try {
            const { documentDirectory, writeAsStringAsync } = (await import('expo-file-system/legacy')) as any;
            await writeAsStringAsync(`${documentDirectory}${key}.json`, value);
        } catch { /* ignore */ }
    },
};

export async function getReviewState(): Promise<ReviewState> {
    try {
        const raw = await standardStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return { ...defaultState(), ...parsed };
        }
    } catch { /* ignore */ }
    return defaultState();
}

async function saveReviewState(state: ReviewState): Promise<void> {
    try {
        await standardStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* ignore */ }
}

function daysSince(timestamp: number): number {
    return (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
}

function isBlocked(state: ReviewState): boolean {
    return state.hasReviewed || state.declinedForever;
}

function isInCooldown(state: ReviewState): boolean {
    return state.lastPromptAt !== null && daysSince(state.lastPromptAt) < MIN_DAYS_BETWEEN_PROMPTS;
}

/** Call after a successful quiz, scan, or flashcard generation. */
export async function markGenerationSuccess(feature: 'quiz' | 'scan' | 'flashcard'): Promise<void> {
    const state = await getReviewState();
    if (isBlocked(state)) return;

    state.successfulGenerations += 1;
    await saveReviewState(state);

    if (state.successfulGenerations >= MIN_GENERATIONS && !isInCooldown(state)) {
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.getState().setShouldAskForReview(true);
        try {
            posthog.capture('review_prompt_queued', { feature, generation_count: state.successfulGenerations });
        } catch { /* ignore */ }
    }
}

/** Call when the home screen gains focus. Opens the custom pre-prompt if eligible. */
export async function tryPromptForReview(): Promise<void> {
    const { useAuthStore } = await import('@/store/authStore');
    const { shouldAskForReview, setShouldAskForReview, toggleEnjoyReviewModal } = useAuthStore.getState();

    if (!shouldAskForReview) return;

    if (Platform.OS === 'web') {
        setShouldAskForReview(false);
        return;
    }

    const state = await getReviewState();
    if (isBlocked(state) || isInCooldown(state)) {
        setShouldAskForReview(false);
        return;
    }

    const available = await StoreReview.isAvailableAsync();
    const hasAction = await StoreReview.hasAction();
    if (!available || !hasAction) {
        setShouldAskForReview(false);
        return;
    }

    setShouldAskForReview(false);
    toggleEnjoyReviewModal(true);

    try {
        posthog.capture('review_pre_prompt_shown', { generation_count: state.successfulGenerations });
    } catch { /* ignore */ }
}

/** User tapped "Yes, love it!" on the custom sheet. */
export async function handleReviewPositive(): Promise<void> {
    const state = await getReviewState();
    state.hasReviewed = true;
    state.lastPromptAt = Date.now();
    await saveReviewState(state);

    try {
        posthog.capture('review_pre_prompt_accepted', { generation_count: state.successfulGenerations });
    } catch { /* ignore */ }

    if (Platform.OS !== 'web') {
        const available = await StoreReview.isAvailableAsync();
        if (available) {
            await StoreReview.requestReview();
            try {
                posthog.capture('review_native_prompt_requested', { generation_count: state.successfulGenerations });
            } catch { /* ignore */ }
        }
    }
}

/** User tapped "Maybe later". */
export async function handleReviewLater(): Promise<void> {
    const state = await getReviewState();
    state.lastPromptAt = Date.now();
    await saveReviewState(state);

    try {
        posthog.capture('review_pre_prompt_later', { generation_count: state.successfulGenerations });
    } catch { /* ignore */ }
}

/** User tapped "No thanks". */
export async function handleReviewDecline(): Promise<void> {
    const state = await getReviewState();
    state.declinedForever = true;
    state.lastPromptAt = Date.now();
    await saveReviewState(state);

    try {
        posthog.capture('review_pre_prompt_declined', { generation_count: state.successfulGenerations });
    } catch { /* ignore */ }
}
