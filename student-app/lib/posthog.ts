import PostHog from 'posthog-react-native';

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
    return {
        capture: noop,
        identify: noop,
        reset: noop,
        screen: noop,
        flush: async () => {},
        shutdown: async () => {},
    } as unknown as PostHog;
}

export const posthog: PostHog = isPostHogEnabled
    ? new PostHog(posthogApiKey!, {
          host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
          enableSessionReplay: sessionReplayEnabled,
          captureAppLifecycleEvents: true,
      })
    : createNoopPostHog();
