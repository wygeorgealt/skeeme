import type { OnboardingAnswers, OnboardingData } from '@/types';

export function getCompletedOnboardingAnswers(data: OnboardingData): OnboardingAnswers | null {
    if (
        !data.onboarding_flow_completed ||
        !data.learning_goals?.length ||
        !data.explanation_preference ||
        !data.study_challenges?.length ||
        !data.daily_goal
    ) {
        return null;
    }

    return {
        learning_goals: data.learning_goals,
        explanation_preference: data.explanation_preference,
        study_challenges: data.study_challenges,
        daily_goal: data.daily_goal,
        reminder_choice: data.reminder_choice ?? 'none',
        reminder_enabled: data.reminder_enabled === true,
        reminder_time: data.reminder_time ?? '',
    };
}
