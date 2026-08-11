<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class GzipMiddleware
{
    /**
     * Handle an incoming request and apply Gzip compression to the response payload.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Don't compress if browser doesn't accept gzip, or zlib extension is missing
        if (! in_array('gzip', $request->getEncodings()) || ! function_exists('gzencode')) {
            return $response;
        }

        // Don't compress binary, streamed downloads, or redirects
        if (
            $response instanceof BinaryFileResponse ||
            $response instanceof StreamedResponse ||
            $response->isRedirection()
        ) {
            return $response;
        }

        $content = $response->getContent();

        // Prevent compressing empty responses or already compressed data
        if (empty($content) || $response->headers->has('Content-Encoding')) {
            return $response;
        }

        // Apply compression (level 5 is an optimal balance between CPU load and bandwidth savings)
        $compressed = gzencode($content, 5);

        if ($compressed !== false) {
            $response->setContent($compressed);
            $response->headers->set('Content-Encoding', 'gzip');
            $response->headers->set('Vary', 'Accept-Encoding');
            $response->headers->set('Content-Length', strlen($compressed));
        }

        return $response;
    }
}
