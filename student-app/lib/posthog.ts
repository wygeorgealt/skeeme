import PostHog from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_API_KEY || 'phc_placeholder';

export const posthog = new PostHog(POSTHOG_API_KEY, {
    host: process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    enableSessionReplay: true, // Requires additional setup but setting it here is safe
    captureAppLifecycleEvents: true,
});
