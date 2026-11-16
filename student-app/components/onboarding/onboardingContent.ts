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

export interface OnboardingReplyChoice<T extends string> extends OnboardingChoice<T> {
    response: string;
}

export const learningGoalsResponse =
    "Everyone gets stuck sometimes. Let's find the light at the end of the tunnel.";

export const learningGoals: OnboardingChoice<LearningGoal>[] = [
    { id: 'prepare_for_exams', label: 'Preparing for examinations' },
    { id: 'remember_learning', label: "Remembering what I've learned" },
    { id: 'test_knowledge', label: 'Testing my knowledge' },
    { id: 'make_studying_easier', label: 'Studying is hard' },
];

export const explanationPreferences: OnboardingReplyChoice<ExplanationPreference>[] = [
    {
        id: 'simple',
        label: 'Keep it simple',
        response: 'Gotcha! No complicated explanations, just the clear stuff.',
    },
    {
        id: 'real_life_examples',
        label: 'Show me examples',
        response: 'Say less! Sometimes seeing it makes all the difference.',
    },
    {
        id: 'detailed',
        label: 'Give me the details',
        response: "I like your curiosity! Let's get into the details.",
    },
    {
        id: 'mixture',
        label: 'A little bit of everything',
        response: 'I guess a little variety keeps things interesting!',
    },
];

export const studyChallenges: OnboardingReplyChoice<StudyChallenge>[] = [
    {
        id: 'understanding_concepts',
        label: 'Understanding difficult concepts',
        response: "We'll break those big ideas into bite-sized pieces!",
    },
    {
        id: 'remembering_reading',
        label: "Remembering what I've read",
        response: "Let's give those memories a reason to stick around!",
    },
    {
        id: 'staying_focused',
        label: 'Staying focused',
        response: "Let's help you keep your mind on the bright side!",
    },
    {
        id: 'managing_study_time',
        label: 'Managing my study time',
        response: "We'll make every study minute count!",
    },
];

export const dailyGoals: OnboardingChoice<DailyGoal>[] = [
    { id: '5', label: '5 min', description: 'A little progress' },
    { id: '10', label: '10 min', description: 'A quick learning session' },
    { id: '15', label: '15 min', description: 'A steady study habit' },
    { id: '20', label: '20 min', description: 'A focused session' },
    { id: 'flexible', label: "I'll decide as I go", description: 'Keep things flexible' },
];

export interface ReminderChoiceItem {
    id: 'morning' | 'afternoon' | 'evening' | 'custom' | 'none';
    label: string;
    description: string;
    time: string;
}

export const reminderChoices: readonly ReminderChoiceItem[] = [
    { id: 'morning', label: 'Morning', description: '8:00 AM', time: '08:00' },
    { id: 'afternoon', label: 'Afternoon', description: '1:00 PM', time: '13:00' },
    { id: 'evening', label: 'Evening', description: '7:00 PM', time: '19:00' },
    { id: 'custom', label: 'Let me choose a time', description: 'Pick your own', time: '09:00' },
    { id: 'none', label: 'No reminders for now', description: "I'll study on my own", time: '' },
] as const;
