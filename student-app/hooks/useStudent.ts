import { useQuery } from '@tanstack/react-query';
import { apiStandard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useStudent() {
    const token = useAuthStore((s) => s.token);
    const updateUser = useAuthStore((s) => s.updateUser);
    const user = useAuthStore((s) => s.user);

    return useQuery({
        queryKey: ['student', 'me'],
        queryFn: async () => {
            try {
                const data: any = await apiStandard.get('me');

                // Normalize the API response shape before updating the Zustand user.
                // This mirrors the logic in authStore.hydrate/checkAuth: `data.user || data`.
                const refreshedUser = data?.user ?? data;

                if (refreshedUser) {
                    try {
                        updateUser(refreshedUser as any);
                    } catch (e) {
                        if (__DEV__) console.error('useStudent queryFn updateUser failed', e);
                    }
                }

                return refreshedUser;
            } catch (e) {
                // Network/temporary server errors shouldn't trigger global "Skeeme is down".
                // Keep showing the last-known user and let NetworkStatus handle the UI.
                return user;
            }
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!token,
    });
}
