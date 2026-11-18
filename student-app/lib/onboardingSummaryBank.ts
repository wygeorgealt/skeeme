import type {
    DailyGoal,
    ExplanationPreference,
    LearningGoal,
    OnboardingAnswers,
    StudyChallenge,
} from '@/types';
import { dailyGoals } from '@/components/onboarding/onboardingContent';

const learningGoalCopy: Record<LearningGoal, string> = {
    understand_difficult_topics: 'understanding difficult topics',
    clear_study_notes: 'making your study notes clearer',
    prepare_for_exams: 'your exam goals',
    remember_learning: "remembering what you've learned",
    test_knowledge: 'checking what you know',
    make_studying_easier: 'making studying feel easier',
};

const challengeCopy: Record<StudyChallenge, string> = {
    understanding_concepts: 'help you break difficult ideas into clear steps',
    remembering_reading: "help key ideas stick by revisiting what you've read",
    staying_focused: 'help you stay focused with manageable sessions',
    knowing_where_to_start: 'help you find a clear place to begin',
    exam_preparation: 'help you organize exam preparation into manageable steps',
    managing_study_time: 'help you make the most of your study time',
};

const explanationCopy: Record<ExplanationPreference, string> = {
    simple: 'in clear, simple language',
    step_by_step: 'step by step',
    real_life_examples: 'with real-life examples',
    detailed: 'in detail',
    mixture: 'in a few ways, with examples and detail',
};

const LEGACY_DAILY_GOALS: DailyGoal[] = ['30', 'flexible'];

function dailyGoalSummary(dailyGoal: DailyGoal) {
    if (dailyGoal === 'flexible') {
        return "We'll keep session length flexible, so you can decide as you go.";
    }

    const unit = dailyGoal === '1' ? 'minute' : 'minutes';
    return `We'll plan around ${dailyGoal} ${unit} a day.`;
}

function summaryKey(
    goal: LearningGoal,
    challenge: StudyChallenge,
    explanation: ExplanationPreference,
    dailyGoal: DailyGoal,
) {
    return `${goal}:${challenge}:${explanation}:${dailyGoal}`;
}

function createSummaryBank() {
    const bank = new Map<string, string>();

    for (const goal of Object.keys(learningGoalCopy) as LearningGoal[]) {
        for (const challenge of Object.keys(challengeCopy) as StudyChallenge[]) {
            for (const explanation of Object.keys(
                explanationCopy,
            ) as ExplanationPreference[]) {
                for (const dailyGoal of [
                    ...dailyGoals.map(({ id }) => id),
                    ...LEGACY_DAILY_GOALS,
                ]) {
                    bank.set(
                        summaryKey(goal, challenge, explanation, dailyGoal),
                        `We'll focus on ${learningGoalCopy[goal]}. I'll ${challengeCopy[challenge]} and explain ideas ${explanationCopy[explanation]}.\n\n${dailyGoalSummary(dailyGoal)}`,
                    );
                }
            }
        }
    }

    return bank;
}

const summaryBank = createSummaryBank();

export function getOnboardingSummary(
    answers: Partial<OnboardingAnswers>,
): string | null {
    const goal = answers.learning_goals?.[0];
    const challenge = answers.study_challenges?.[0];
    const explanation = answers.explanation_preference;
    const dailyGoal = answers.daily_goal;

    if (!goal || !challenge || !explanation || !dailyGoal) return null;

    return summaryBank.get(summaryKey(goal, challenge, explanation, dailyGoal)) ?? null;
}
