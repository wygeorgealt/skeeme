import { useCallback, useState } from 'react';

const completedEntrances = new Set<string>();

export function useOnboardingEntrance(step: string) {
    const [shouldAnimate] = useState(() => !completedEntrances.has(step));
    const [isComplete, setIsComplete] = useState(!shouldAnimate);

    const complete = useCallback(() => {
        completedEntrances.add(step);
        setIsComplete(true);
    }, [step]);

    return {
        isComplete,
        shouldAnimate,
        complete,
    };
}

export function resetOnboardingEntrances() {
    completedEntrances.clear();
}
