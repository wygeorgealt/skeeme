<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\SetLocaleMiddleware::class,
            \App\Http\Middleware\SetUserTimezone::class,
            \App\Http\Middleware\RedirectBasedOnRole::class,
            \App\Http\Middleware\CheckSchoolIpRestriction::class,
        ]);

        $middleware->api(prepend: [
            \App\Http\Middleware\HandleCors::class,
        ], append: [
            \App\Http\Middleware\GzipMiddleware::class,
        ]);

        $middleware->trustProxies(at: '*');

        $middleware->validateCsrfTokens(except: [
            'api/v1/webhooks/zoom',
        ]);
        
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
            'admin' => \App\Http\Middleware\AdminMiddleware::class,
            'ensure.team.member' => \App\Http\Middleware\EnsureTeamMember::class,
            'check.team.permission' => \App\Http\Middleware\CheckTeamPermission::class,
            'sufficient.credits' => \App\Http\Middleware\CheckSufficientCredits::class,
            'rate.limit.ai' => \App\Http\Middleware\RateLimitAiEndpoints::class,
            'ensure.user.exists' => \App\Http\Middleware\EnsureUserExists::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            // Handle RouteNotFoundException (missing route name used in code)
            if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                if (!$request->is('api/*')) {
                    abort(404);
                }
            }

            if ($request->is('api/*')) {
                // Let Laravel handle auth failures natively (returns 401)
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'message' => 'Unauthenticated. Your session has expired, please log in again.',
                    ], 401);
                }

                // Let Laravel handle validation errors natively (returns 422)
                if ($e instanceof \Illuminate\Validation\ValidationException) {
                    return null; // Fall through to Laravel's default handler
                }

                // For HTTP exceptions, use their actual status code
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                } else {
                    $status = 500;
                }

                // Only mask genuine 500 server errors
                if ($status >= 500) {
                    return response()->json([
                        'message' => 'Skeeme is down, Please try again later.',
                        'error_code' => 'SERVER_ERROR'
                    ], 500);
                }
            }
        });
    })->create();
