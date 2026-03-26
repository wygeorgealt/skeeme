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
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                // If it's a 500 error or a connection error, mask it with the friendly message
                if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface) {
                    $status = $e->getStatusCode();
                } else {
                    $status = 500;
                }

                if ($status >= 500) {
                    return response()->json([
                        'message' => 'Skeeme is down, Please try again later.',
                        'error_code' => 'SERVER_ERROR'
                    ], 500);
                }
            }
        });
    })->create();
