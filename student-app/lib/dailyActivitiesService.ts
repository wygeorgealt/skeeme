import { appStorage } from '@/lib/storage';

export interface DailyActivityTask {
    id: string;
    title: string;
    type: 'quiz' | 'flashcards' | 'scan' | 'review' | 'chat';
    icon: string;
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
 * Calculate day of year to deterministically cycle rotating tasks
 */
function getDayOfYear(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

/**
 * Generate 3 personalized, intelligent daily tasks based on:
 * - Upcoming exam proximity (e.g. 5 days until Biology finals)
 * - Past quiz scores (identifies weak areas < 70% to reinforce)
 * - Flashcard decks with spaced repetition rotation
 * - Preferred study subjects (ai_preferences.field_of_study)
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
    const dayOfYear = getDayOfYear();

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

    // 1. Determine upcoming exams and primary subject
    const nowMs = Date.now();
    const validExams = exams
        .filter((e) => e && e.title)
        .map((e) => {
            const examTime = e.exam_date ? new Date(e.exam_date).getTime() : NaN;
            const daysLeft = !isNaN(examTime)
                ? Math.ceil((examTime - nowMs) / (1000 * 60 * 60 * 24))
                : null;
            return { ...e, daysLeft };
        })
        .sort((a, b) => {
            if (a.daysLeft !== null && b.daysLeft !== null) return a.daysLeft - b.daysLeft;
            if (a.daysLeft !== null) return -1;
            if (b.daysLeft !== null) return 1;
            return 0;
        });

    const closestExam = validExams[0] || null;
    const fieldOfStudy = user?.ai_preferences?.field_of_study;
    const preferredSubject = closestExam?.title || fieldOfStudy || 'Core Study';

    // 2. Check automatic completions from today's live activity
    const extractDateString = (val: any): string => {
        if (!val) return '';
        const raw = typeof val === 'object' && val.Time ? String(val.Time) : String(val);
        const parsed = new Date(raw);
        return isNaN(parsed.getTime()) ? '' : parsed.toDateString();
    };
    const todayDateStr = new Date().toDateString();
    const hasQuizToday = quizSessions.some(
        (q: any) => extractDateString(q?.created_at) === todayDateStr
    );
    const hasFlashcardToday = flashcardDecks.some(
        (d: any) => extractDateString(d?.created_at || d?.updated_at) === todayDateStr
    );

    // 3. Spaced Repetition Flashcards Task
    const flashcardTaskId = `task_flashcard_${todayKey}`;
    let flashcardTitle: string;
    let flashcardRoute: string;

    if (flashcardDecks.length > 0) {
        // Deterministically pick a deck so multiple decks rotate across days
        const deckIndex = dayOfYear % flashcardDecks.length;
        const chosenDeck = flashcardDecks[deckIndex] || flashcardDecks[0];
        const cardCount = chosenDeck.flashcards_count || chosenDeck.cards?.length;
        flashcardTitle = cardCount
            ? `Review "${chosenDeck.title}" (${cardCount} cards)`
            : `Review "${chosenDeck.title}"`;
        flashcardRoute = `/(drawer)/flashcards/${chosenDeck.id}`;
    } else if (closestExam) {
        flashcardTitle = `Build ${closestExam.title} Flashcards`;
        flashcardRoute = `/(drawer)/flashcards/create`;
    } else {
        flashcardTitle = `Create ${preferredSubject} Flashcards`;
        flashcardRoute = `/(drawer)/flashcards/create`;
    }

    // 4. Targeted Quiz Practice Task (prioritizes weak-area reinforcement or exam sprint)
    const quizTaskId = `task_quiz_${todayKey}`;
    let quizTitle: string;
    let quizRoute: string;

    // Check recent quizzes for weak areas (< 70% score)
    const recentWeakQuiz = quizSessions
        .filter((q: any) => typeof q.score_percentage === 'number' && q.score_percentage < 70 && q.topic)
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

    if (recentWeakQuiz) {
        const score = Math.round(recentWeakQuiz.score_percentage);
        quizTitle = `Review Weak Areas: "${recentWeakQuiz.topic}" (${score}%)`;
        quizRoute = `/(drawer)/generate?topic=${encodeURIComponent(recentWeakQuiz.topic)}`;
    } else if (closestExam && closestExam.daysLeft !== null && closestExam.daysLeft <= 30) {
        const daysText = closestExam.daysLeft <= 0 ? 'Today' : `${closestExam.daysLeft}d left`;
        quizTitle = `Sprint Quiz: ${closestExam.title} (${daysText})`;
        quizRoute = `/(drawer)/generate?topic=${encodeURIComponent(closestExam.title)}`;
    } else {
        const promptVariations = [
            `Complete a Quick ${preferredSubject} Quiz`,
            `Mastery Drill: 10 ${preferredSubject} Questions`,
            `Practice Diagnostic Quiz in ${preferredSubject}`,
        ];
        quizTitle = promptVariations[dayOfYear % promptVariations.length];
        quizRoute = `/(drawer)/generate?topic=${encodeURIComponent(preferredSubject)}`;
    }

    // 5. Active Practice / Problem Solver / Skeemy Assistant Task
    const scanTaskId = `task_scan_${todayKey}`;
    let scanTitle: string;
    let scanRoute: string;

    const rotation = dayOfYear % 3;
    if (closestExam && closestExam.daysLeft !== null && closestExam.daysLeft <= 7) {
        scanTitle = `Snap & Solve Exam Problems for ${closestExam.title}`;
        scanRoute = `/(drawer)/chat?openCamera=1`;
    } else if (rotation === 0) {
        scanTitle = `Snap & Solve an Unsolved Problem`;
        scanRoute = `/(drawer)/chat?openCamera=1`;
    } else if (rotation === 1) {
        scanTitle = `Ask Skeemy: Clarify a Tough ${preferredSubject} Topic`;
        scanRoute = `/(drawer)/chat`;
    } else {
        scanTitle = `Scan Notes or Diagram for Instant Solution`;
        scanRoute = `/(drawer)/chat?openCamera=1`;
    }

    const tasks: DailyActivityTask[] = [
        {
            id: flashcardTaskId,
            title: flashcardTitle,
            type: 'flashcards',
            icon: 'CircleDot',
            route: flashcardRoute,
            completed:
                completedMap[flashcardTaskId] !== undefined
                    ? Boolean(completedMap[flashcardTaskId])
                    : hasFlashcardToday,
        },
        {
            id: quizTaskId,
            title: quizTitle,
            type: 'quiz',
            icon: 'CircleDot',
            route: quizRoute,
            completed:
                completedMap[quizTaskId] !== undefined
                    ? Boolean(completedMap[quizTaskId])
                    : hasQuizToday,
        },
        {
            id: scanTaskId,
            title: scanTitle,
            type: 'scan',
            icon: 'CircleDot',
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
