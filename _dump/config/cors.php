<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins
    |--------------------------------------------------------------------------
    |
    | This array contains the origins that are allowed to make cross-origin
    | requests to your API. These are used by the App\Http\Middleware\HandleCors
    | middleware to set the Access-Control-Allow-Origin header.
    |
    */

    'allowed_origins' => [
        'https://skeeme.com',
        'https://www.skeeme.com',
        'http://localhost:8081',
        'http://127.0.0.1:8081',
        'http://localhost:19006',
        'http://localhost:3000',
        'http://skeeme.test',
    ],

];
