export type QuizMode = 'topic' | 'file';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type FormatType = 'mcq' | 'theory' | 'both';

export type Question = {
    question_text: string;
    question_type: 'multiple_choice' | 'essay';
    options: string[];
    correct_answer: string;
    explanation: string;
    difficulty_level: string;
};

export type TheoryResult = {
    score: number;
    max: number;
    feedback: string;
    passed: boolean;
};

export const DIFF_COLORS: Record<string, string> = {
    easy: '#2EBD85', medium: '#FCD34D', hard: '#ef4444',
};
