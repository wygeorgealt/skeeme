import { useQuery } from '@tanstack/react-query';
import { apiStandard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useCredits() {
    const token = useAuthStore((s) => s.token);
    return useQuery(['student', 'me', 'credits'], async () => {
        const data = await apiStandard.get('me');
        return data?.credits ?? null;
    }, {
        staleTime: 5 * 60 * 1000,
        retry: 1,
        enabled: !!token,
    });
}
