import { useQuery } from '@tanstack/react-query';
import { apiStandard } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function usePendingRewards() {
    const token = useAuthStore((s) => s.token);
    return useQuery(['student', 'referral', 'pending'], async () => {
        return await apiStandard.get('student/referral/pending-rewards');
    }, {
        staleTime: 2 * 60 * 1000,
        retry: 1,
        enabled: !!token,
    });
}
