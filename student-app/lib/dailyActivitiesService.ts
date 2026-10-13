import { appStorage } from '@/lib/storage';

export interface DailyActivityTask {
    id: string;
    title: string;
    type: 'quiz' | 'flashcards' | 'scan' | 'review';
    icon: 'Sparkles' | 'Layers' | 'Scan' | 'CheckCircle2' | 'Play';
    route: string;
    completed: boolean;
}

export interface DailyGoalProgress {
    completedCount: number;
    totalCount: number;
    percentage: number;
    isGoalMet: boolean;
}

/**
 * Returns today's ISO date string (YYYY-MM-DD) in local time
 */
export function getTodayKey(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Generate 3 personalized daily tasks based on:
 * - Preferred study subjects (ai_preferences.field_of_study)
 * - Target exams
 * - Flashcard decks and recent quizzes
 * - Today's completion state
 */
export async function getDailyActivities({
    user,
    exams = [],
    flashcardDecks = [],
    quizSessions = [],
}: {
    user: any;
    exams?: any[];
    flashcardDecks?: any[];
    quizSessions?: any[];
}): Promise<DailyActivityTask[]> {
    const todayKey = getTodayKey();
    const storageKey = `skeeme_daily_tasks_${todayKey}`;

    // Read stored manual completions for today
    let completedMap: Record<string, boolean> = {};
    try {
        const stored = await appStorage.getItem(storageKey);
        if (stored) {
            completedMap = JSON.parse(stored);
        }
    } catch {
        completedMap = {};
    }

    // Determine primary subject from target exams or field of study
    const primaryExam = exams.length > 0 ? exams[0]?.title : null;
    const fieldOfStudy = user?.ai_preferences?.field_of_study;
    const preferredSubject = primaryExam || fieldOfStudy || 'Core Study';

    // Check automatic activity completion from today's sessions
    const todayDateStr = new Date().toDateString();
    const hasQuizToday = quizSessions.some(
        (q: any) => new Date(q.created_at).toDateString() === todayDateStr
    );
    const hasRecentDeck = flashcardDecks.length > 0;
    const recentDeck = hasRecentDeck ? flashcardDecks[0] : null;

    // Task 1: Flashcard Spaced Repetition Drill
    const flashcardTaskId = `task_flashcard_${todayKey}`;
    const flashcardTitle = recentDeck
        ? `Review "${recentDeck.title}"`
        : `Create ${preferredSubject} Flashcards`;
    const flashcardRoute = recentDeck
        ? `/(drawer)/flashcards/${recentDeck.id}`
        : `/(drawer)/flashcards/create`;

    // Task 2: Targeted Quiz Practice
    const quizTaskId = `task_quiz_${todayKey}`;
    const quizTitle = `Complete a Quick ${preferredSubject} Quiz`;
    const quizRoute = `/(drawer)/generate?topic=${encodeURIComponent(preferredSubject)}`;

    // Task 3: Problem Scan / Homework Solver
    const scanTaskId = `task_scan_${todayKey}`;
    const scanTitle = `Snap & Solve an Unsolved Problem`;
    const scanRoute = `/(drawer)/scan`;

    const tasks: DailyActivityTask[] = [
        {
            id: flashcardTaskId,
            title: flashcardTitle,
            type: 'flashcards',
            icon: 'Layers',
            route: flashcardRoute,
            completed: Boolean(completedMap[flashcardTaskId]),
        },
        {
            id: quizTaskId,
            title: quizTitle,
            type: 'quiz',
            icon: 'Sparkles',
            route: quizRoute,
            completed: hasQuizToday || Boolean(completedMap[quizTaskId]),
        },
        {
            id: scanTaskId,
            title: scanTitle,
            type: 'scan',
            icon: 'Scan',
            route: scanRoute,
            completed: Boolean(completedMap[scanTaskId]),
        },
    ];

    return tasks;
}

/**
 * Toggle or mark a task as completed for today
 */
export async function toggleTaskCompletion(taskId: string, completed?: boolean): Promise<boolean> {
    const todayKey = getTodayKey();
    const storageKey = `skeeme_daily_tasks_${todayKey}`;

    try {
        let completedMap: Record<string, boolean> = {};
        const stored = await appStorage.getItem(storageKey);
        if (stored) {
            completedMap = JSON.parse(stored);
        }

        const newStatus = completed !== undefined ? completed : !completedMap[taskId];
        completedMap[taskId] = newStatus;

        await appStorage.setItem(storageKey, JSON.stringify(completedMap));
        return newStatus;
    } catch {
        return false;
    }
}

/**
 * Calculate daily goal progress metrics
 */
export function calculateDailyGoalProgress(tasks: DailyActivityTask[]): DailyGoalProgress {
    const totalCount = tasks.length || 3;
    const completedCount = tasks.filter((t) => t.completed).length;
    const percentage = Math.min(100, Math.round((completedCount / totalCount) * 100));

    return {
        completedCount,
        totalCount,
        percentage,
        isGoalMet: completedCount >= totalCount,
    };
}
