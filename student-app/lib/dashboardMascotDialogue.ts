export interface MascotDialogue {
    message: string;
    subtext: string;
}

/**
 * Returns dynamic, personality-filled Skeemy dialogue tailored to student's visit state.
 * These are designed as friendly companion notes rather than system notifications.
 */
export function getSkeemyDashboardDialogue(params: {
    isFirstVisit?: boolean;
    streak?: number;
    hasRecentSession?: boolean;
}): MascotDialogue {
    const { isFirstVisit, streak = 0, hasRecentSession } = params;

    if (isFirstVisit) {
        return {
            message: "Well, look who's ready to get brighter!",
            subtext: "Ready to explore your personal study workspace?",
        };
    }

    if (hasRecentSession) {
        return {
            message: "Look at you, making progress!",
            subtext: "Ready to pick up right where you left off?",
        };
    }

    if (streak > 2) {
        return {
            message: "Back for another round? Let's go!",
            subtext: `${streak}-day streak and counting. Let's keep the momentum going!`,
        };
    }

    const hour = new Date().getHours();
    if (hour < 12) {
        return {
            message: "A little brightness goes a long way.",
            subtext: "Morning study sessions build the strongest memory paths.",
        };
    }
    if (hour >= 17) {
        return {
            message: "Evening focus time.",
            subtext: "Ready to wrap up today's concepts?",
        };
    }

    return {
        message: "A little brightness goes a long way.",
        subtext: "Ready to pick up where you left off?",
    };
}
