/// <reference types="nativewind/types" />

declare namespace NodeJS {
    interface ProcessEnv {
        EXPO_PUBLIC_API_URL?: string;
        EXPO_PUBLIC_AI_SERVICE_URL?: string;
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?: string;
        EXPO_PUBLIC_POSTHOG_API_KEY?: string;
        EXPO_PUBLIC_POSTHOG_HOST?: string;
        /** Set to "true" only after Play Data Safety / privacy policy cover session replay. */
        EXPO_PUBLIC_POSTHOG_SESSION_REPLAY?: string;
    }
}
