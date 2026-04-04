<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Laravel\Fortify\Http\Controllers\RegisteredUserController as FortifyController;

class RegisteredUserController extends FortifyController
{
    /**
     * Handle a registration request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // Generate OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store in cache for 10 minutes
        Cache::put("otp.register.{$request->email}", $otp, now()->addMinutes(10));
        
        // Store registration data in session
        session([
            'register_email' => $request->email,
            'register_data' => [
                'email' => $request->email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
            ],
        ]);

        // Send OTP via email
        try {
            Mail::mailer('resend')->to($request->email)->send(new OtpMail($otp, $request->email));
        } catch (\Exception $e) {
            \Log::error('Failed to send OTP email: ' . $e->getMessage());
            return redirect()->route('register')->with('error', 'Failed to send verification code. Please try again.');
        }

        return redirect()->route('register.otp')->with('success', 'Verification code sent to your email.');
    }
}
