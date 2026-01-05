<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\ExamSession;
use Symfony\Component\HttpFoundation\Response;

class ExamSecurity
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $session = $request->route('session');

        if ($session instanceof ExamSession) {
            // Verify session ownership
            if ($session->student_id !== auth()->id()) {
                abort(403, 'Unauthorized to access this exam session');
            }

            // Prevent tab switching (detect if exam is taken in fullscreen)
            // This would be enforced client-side with JavaScript
            if (!$request->header('X-Exam-Fullscreen')) {
                // Log security concern but allow (can be made stricter)
                \Log::warning("Exam session {$session->id} accessed without fullscreen mode");
            }

            // Check if using allowed browser/device
            $userAgent = $request->header('User-Agent');
            if ($this->isBlockedUserAgent($userAgent)) {
                abort(403, 'Exam access from this device/browser is not permitted');
            }

            // Rate limit exam submissions (prevent automated cheating attempts)
            $cacheKey = "exam_submissions_{$session->id}_" . auth()->id();
            if (\Cache::has($cacheKey)) {
                abort(429, 'Too many submission attempts. Please wait before trying again.');
            }

            // Mark that submission was attempted
            \Cache::put($cacheKey, true, now()->addSeconds(5));

            // Verify session is still active
            if (!$session->isActive() && $request->route()->getName() === 'student.exam.delivery') {
                return redirect()->route('student.exams.results', $session)
                    ->with('warning', 'This exam session has expired.');
            }

            // Log exam access for audit trail
            $this->logExamAccess($session);
        }

        return $next($request);
    }

    /**
     * Check if user agent is blocked (e.g., bots, suspicious clients)
     */
    private function isBlockedUserAgent(string $userAgent): bool
    {
        $blockedPatterns = [
            'bot' => '/bot/i',
            'crawler' => '/crawler/i',
            'spider' => '/spider/i',
            'scraper' => '/scraper/i',
        ];

        foreach ($blockedPatterns as $type => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Log exam access for audit purposes
     */
    private function logExamAccess(ExamSession $session): void
    {
        $session->update([
            'last_accessed_at' => now(),
            'metadata' => array_merge(
                $session->metadata ?? [],
                [
                    'last_ip' => request()->ip(),
                    'last_user_agent' => request()->header('User-Agent'),
                    'access_count' => ($session->metadata['access_count'] ?? 0) + 1,
                ]
            ),
        ]);
    }
}
