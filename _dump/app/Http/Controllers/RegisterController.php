<?php

namespace App\Http\Controllers;

use Laravel\Fortify\Http\Controllers\RegisteredUserController as BaseRegisterController;
use Laravel\Fortify\Contracts\RegisterResponse;

class RegisterController extends BaseRegisterController
{
    /**
     * The user has been registered.
     *
     * @param  mixed  $user
     * @return mixed
     */
    protected function registered($request, $user)
    {
        return app(RegisterResponse::class)->toResponse($request);
    }
}
