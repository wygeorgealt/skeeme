import { api } from '@/lib/api';
import { getCompletedOnboardingAnswers } from '@/lib/onboardingAnswers';
import { useAuthStore } from '@/store/authStore';

export async function saveOnboardingToAccount() {
    const state = useAuthStore.getState();
    const answers = getCompletedOnboardingAnswers(state.onboardingData);
    if (!answers) {
        throw new Error('Your study plan is incomplete. Go back and finish onboarding, then try again.');
    }
    if (!state.user) {
        throw new Error('Your account could not be verified. Please sign in again.');
    }

    await api.post('me/onboarding', {
        education_level: state.onboardingData.education_level ?? '',
        field_of_study: state.onboardingData.field_of_study ?? '',
        learning_style: answers.explanation_preference,
        onboarding_data: answers,
    });

    const user = useAuthStore.getState().user ?? state.user;
    await state.updateUser({
        ai_preferences: {
            ...user.ai_preferences,
            ...(state.onboardingData.education_level
                ? { education_level: state.onboardingData.education_level }
                : {}),
            ...(state.onboardingData.field_of_study
                ? { field_of_study: state.onboardingData.field_of_study }
                : {}),
            learning_style: answers.explanation_preference,
            onboarding_answers: answers,
        },
    });
    await state.completeOnboarding();
}
