// ══════════════════════════════════════════════════════════════════════════════
// AUTH & USER TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface User {
    id: number;
    name: string;
    email: string;
    plan_name?: string; // 'free', 'pro', 'max'
    is_premium?: boolean;
    streak?: {
        current_streak: number;
        longest_streak: number;
        last_study_date: string | null;
    };
    pricing?: {
        amount: string;
        currency: string;
        period: string;
    };
    ai_preferences?: {
        education_level?: string;
        field_of_study?: string;
        learning_style?: string;
        tone?: string;
        language?: string;
        analogy_focus?: string;
        academic_goal?: string;
        custom_weakness?: string;
        onboarding_answers?: OnboardingAnswers;
    };
    notifications_enabled?: boolean;
    avatar?: string;
    avatar_url?: string;
    study_sessions_this_week?: number;
    weekly_activity_points?: (number | { value: number })[];
    nearest_exam?: {
        id: number;
        title: string;
        exam_date: string;
    } | null;
}

export type LearningGoal =
    | 'understand_difficult_topics'
    | 'clear_study_notes'
    | 'prepare_for_exams'
    | 'remember_learning'
    | 'test_knowledge'
    | 'make_studying_easier';

export type ExplanationPreference =
    | 'simple'
    | 'step_by_step'
    | 'real_life_examples'
    | 'detailed'
    | 'mixture';

export type StudyChallenge =
    | 'understanding_concepts'
    | 'remembering_reading'
    | 'staying_focused'
    | 'knowing_where_to_start'
    | 'exam_preparation'
    | 'managing_study_time';

export type DailyGoal =
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '30'
    | 'flexible';
export type ReminderChoice = 'morning' | 'afternoon' | 'evening' | 'custom' | 'none';

export interface OnboardingAnswers {
    learning_goals: LearningGoal[];
    explanation_preference: ExplanationPreference;
    study_challenges: StudyChallenge[];
    daily_goal: DailyGoal;
    reminder_choice: ReminderChoice;
    reminder_enabled: boolean;
    reminder_time?: string;
}

export interface OnboardingData extends Partial<OnboardingAnswers> {
    first_name?: string;
    onboarding_flow_completed?: boolean;
    education_level?: string;
    field_of_study?: string;
    learning_style?: string;
    dob_month?: string | number;
    dob_year?: string | number;
    age?: number;
}

export interface StreakMilestone {
    days: 7 | 14 | 30 | 60;
    achieved: boolean;
}

export type OtpType = 'verification' | 'password_reset';

export interface ApiError {
    error: string;
    message: string;
    required?: number;
    available?: number;
    shortfall?: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// PRICING & SUBSCRIPTION TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type PlanType = 'free' | 'standard' | 'elite';
export type CurrencyType = 'ngn' | 'usd';

export interface PricingPlan {
    monthly: number;
    yearly: number;
    promoMonthly?: number;
    weekly: number;
    save?: string; // e.g. "20%"
}

export interface PricingConfig {
    ngn: Record<Exclude<PlanType, 'free'>, PricingPlan>;
    usd: Record<Exclude<PlanType, 'free'>, PricingPlan>;
    promos: {
        standard_end?: string;
        elite_end?: string;
        [key: string]: string | undefined;
    };
    rates: {
        scan_solve: { free: number; paid: number };
        quiz_flat: { free: number; paid: number };
        flashcard_flat: { free: number; paid: number };
        theory_grading: { free: number; paid: number };
        quiz_base: number;
        quiz_weight: number;
        flashcard_base: number;
        flashcard_weight: number;
        [key: string]: any;
    };
}

// ══════════════════════════════════════════════════════════════════════════════
// QUIZ TYPES
// ══════════════════════════════════════════════════════════════════════════════

export type QuizMode = 'topic' | 'file';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FormatType = 'mcq' | 'theory' | 'both';

export interface QuizQuestion {
    question_text: string;
    question_type: 'multiple_choice' | 'essay';
    options?: string[];
    correct_answer: string;
    explanation: string;
    explanation_right?: string;
    explanation_wrong?: string;
    difficulty_level?: string;
}

export interface TheoryResult {
    score: number;
    max: number;
    feedback: string;
    passed: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// FLASHCARD TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface Flashcard {
    id: number;
    front: string;
    back: string;
    order_column: number;
}

export interface FlashcardDeck {
    id: number;
    title: string;
    description: string | null;
    source_type: string;
    flashcards_count: number;
    flashcards?: Flashcard[];
    created_at: string;
}
