// ══════════════════════════════════════════════════════════════════════════════
// AUTH & USER TYPES
// ══════════════════════════════════════════════════════════════════════════════

export interface User {
    id: number;
    name: string;
    email: string;
    credits: number;
    is_unlimited: boolean;
    is_unlimited_student?: boolean;
    plan_name?: string; // 'free', 'standard', 'elite', etc.
    next_free_refill_at?: string | null;
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
    };
    avatar?: string;
    avatar_url?: string;
    credits_spent_this_week?: number;
    study_sessions_this_week?: number;
    weekly_activity_points?: (number | { value: number })[];
    nearest_exam?: {
        id: number;
        title: string;
        exam_date: string;
    } | null;
}

export interface StreakMilestone {
    days: 7 | 14 | 30 | 60;
    credits: number;
    achieved: boolean;
}

export interface CreditTransaction {
    id: number;
    user_id: number;
    amount: number;
    type: 'usage' | 'purchase' | 'reward' | 'refund' | 'adjustment';
    action_type?: 'quiz_generation' | 'flashcard_generation' | 'scan_solve' | 'ai_grading' | 'referral_bonus' | 'signup_bonus';
    description: string;
    model_used?: string | null;
    request_id?: string | null;
    metadata?: Record<string, any> | null;
    created_at: string;
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
    credits: number;
    weekly: number;
    save?: string; // e.g. "20%"
}

export interface CreditPack {
    amount: number;
    price: number;
}

export interface PricingConfig {
    ngn: Record<Exclude<PlanType, 'free'>, PricingPlan>;
    usd: Record<Exclude<PlanType, 'free'>, PricingPlan>;
    promos: {
        standard_end?: string;
        elite_end?: string;
        [key: string]: string | undefined;
    };
    credit_packs: {
        ngn: CreditPack[];
        usd: CreditPack[];
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
