import { useQuery } from '@tanstack/react-query';
import { apiStandard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useStudent() {
    const token = useAuthStore((s) => s.token);
    const updateUser = useAuthStore((s) => s.updateUser);

    return useQuery({
        queryKey: ['student', 'me'],
        queryFn: async () => {
            return await apiStandard.get('me');
        },
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!token,
        onSuccess: (data) => {
            try {
                if (data) updateUser(data as any);
            } catch (e) {
                if (__DEV__) console.error('useStudent onSuccess updateUser failed', e);
            }
        }
    });
}
