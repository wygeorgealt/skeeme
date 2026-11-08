import { onlineManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import type { AxiosError } from 'axios';
import { createElement, type ReactNode } from 'react';

onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
        setOnline(state.isConnected !== false && state.isInternetReachable !== false);
    })
);

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                const status = (error as AxiosError).response?.status;
                // Retrying a definitive HTTP failure creates duplicate requests
                // and duplicate failure UI. A transient connection failure gets
                // one quiet retry before the app falls back to cached data.
                return !status && failureCount < 1;
            },
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

export function QueryProvider({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
}
