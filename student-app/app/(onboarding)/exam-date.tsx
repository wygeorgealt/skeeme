import { useEffect } from 'react';
import { useRouter } from 'expo-router';

/**
 * Next exam/test page is now the SAME as the repurposed birthday step.
 * Keep this route as a redirect-only placeholder to avoid broken navigation.
 */
export default function ExamDateScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/(onboarding)/birthday');
  }, [router]);

  return null;
}
