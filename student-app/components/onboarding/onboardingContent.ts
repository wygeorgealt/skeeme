import type {
    DailyGoal,
    ExplanationPreference,
    LearningGoal,
    StudyChallenge,
} from '@/types';

export interface OnboardingChoice<T extends string> {
    id: T;
    label: string;
    description?: string;
}

export const learningGoals: OnboardingChoice<LearningGoal>[] = [
    { id: 'understand_difficult_topics', label: 'Understand difficult topics' },
    { id: 'clear_study_notes', label: 'Turn my materials into clear notes' },
    { id: 'prepare_for_exams', label: 'Prepare for examinations' },
    { id: 'remember_learning', label: "Remember what I've learned" },
    { id: 'test_knowledge', label: 'Test my knowledge' },
    { id: 'make_studying_easier', label: 'Make studying easier' },
];

export const explanationPreferences: OnboardingChoice<ExplanationPreference>[] = [
    { id: 'simple', label: 'Simple explanations without complicated words' },
    { id: 'step_by_step', label: 'Step-by-step breakdowns' },
    { id: 'real_life_examples', label: 'Real-life examples and analogies' },
    { id: 'detailed', label: 'Detailed explanations that cover everything' },
    { id: 'mixture', label: 'A mixture of everything' },
];

export const studyChallenges: OnboardingChoice<StudyChallenge>[] = [
    { id: 'understanding_concepts', label: 'Understanding difficult concepts' },
    { id: 'remembering_reading', label: "Remembering what I've read" },
    { id: 'staying_focused', label: 'Staying focused' },
    { id: 'knowing_where_to_start', label: 'Knowing where to start' },
    { id: 'exam_preparation', label: 'Preparing for examinations' },
    { id: 'managing_study_time', label: 'Managing my study time' },
];

export const dailyGoals: OnboardingChoice<DailyGoal>[] = [
    { id: '5', label: '5 min', description: 'A little progress' },
    { id: '10', label: '10 min', description: 'A quick learning session' },
    { id: '15', label: '15 min', description: 'A steady study habit' },
    { id: '20', label: '20 min', description: 'A focused session' },
    { id: '30', label: '30 min', description: 'Deep learning time' },
    { id: 'flexible', label: "I'll decide as I go", description: 'Keep things flexible' },
];

export const reminderChoices = [
    { id: 'morning', label: 'Morning', time: '08:00' },
    { id: 'afternoon', label: 'Afternoon', time: '13:00' },
    { id: 'evening', label: 'Evening', time: '19:00' },
    { id: 'custom', label: 'Let me choose a time', time: '09:00' },
    { id: 'none', label: 'No reminders for now', time: '' },
] as const;
