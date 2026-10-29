import React from 'react';
import PostHog, { PostHogProvider } from 'posthog-react-native';

const POSTHOG_PLACEHOLDER_KEY = 'phc_placeholder';

function resolvePostHogApiKey(): string | null {
    const key = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
    if (!key || key === POSTHOG_PLACEHOLDER_KEY) {
        return null;
    }
    return key;
}

const posthogApiKey = resolvePostHogApiKey();

/** True when a real PostHog project key is baked into the build (EAS env / .env). */
export const isPostHogEnabled = posthogApiKey !== null;

const sessionReplayEnabled =
    isPostHogEnabled && process.env.EXPO_PUBLIC_POSTHOG_SESSION_REPLAY === 'true';

function createNoopPostHog(): PostHog {
    const noop = () => {};
    const dummy: Record<string, any> = {
        capture: noop,
        identify: noop,
        reset: noop,
        screen: noop,
        flush: async () => {},
        shutdown: async () => {},
        optIn: noop,
        optOut: noop,
        isOptIn: () => true,
        isOptOut: () => false,
        on: noop,
        off: noop,
        getDistinctId: () => '',
    };
    return new Proxy(dummy, {
        get(target, prop) {
            if (prop in target) return target[prop as string];
            return noop;
        }
    }) as unknown as PostHog;
}

export const posthog: PostHog = isPostHogEnabled
    ? new PostHog(posthogApiKey!, {
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          enableSessionReplay: sessionReplayEnabled,
          captureAppLifecycleEvents: true,
      })
    : createNoopPostHog();

export const OptionalPostHogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isPostHogEnabled) {
        return <>{children}</>;
    }
    return (
        <PostHogProvider client={posthog} autocapture={{ captureScreens: false, captureTouches: false }}>
            {children}
        </PostHogProvider>
    );
};
