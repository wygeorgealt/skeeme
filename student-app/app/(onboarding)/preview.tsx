import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function OnboardingPreviewScreen() {
  const router = useRouter();

  useEffect(() => {
    // Preview onboarding removed. If a stale link exists, bounce back to onboarding entry.
    router.replace('/(onboarding)/auth-select');
  }, [router]);

  return null;
}
