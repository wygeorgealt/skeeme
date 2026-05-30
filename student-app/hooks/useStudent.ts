import { useQuery } from '@tanstack/react-query';
import { apiStandard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useStudent() {
    const token = useAuthStore((s) => s.token);
    const updateUser = useAuthStore((s) => s.updateUser);

    return useQuery({
        queryKey: ['student', 'me'],
        queryFn: async () => {
            const data: any = await apiStandard.get('me');

            // Normalize API response shape so credits/fields land in the zustand user object.
            // This mirrors the logic in authStore.hydrate/checkAuth: `data.user || data`.
            const refreshedUser = data?.user ?? data;

            try {
                if (refreshedUser) updateUser(refreshedUser as any);
            } catch (e) {
                if (__DEV__) console.error('useStudent queryFn updateUser failed', e);
            }

            return refreshedUser;
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!token,
    });
}
