<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\EmailOtp;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Mail\SignupVerificationMail;
use App\Mail\ForgotPasswordMail;

class OtpController extends Controller
{
    protected $otpService;

    public function __construct(\App\Services\OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:verification,password_reset'
        ]);

        $result = $this->otpService->sendOtp($request->email, $request->type);
        
        if (is_int($result)) {
            return response()->json([
                'message' => 'Please wait before resending.',
                'cooldown' => $result
            ], 429);
        }

        return response()->json([
            'message' => 'OTP sent successfully. Please check your email.'
        ]);
    }

    public function resend(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:verification,password_reset'
        ]);

        $result = $this->otpService->sendOtp($request->email, $request->type);
        
        if (is_int($result)) {
            return response()->json([
                'message' => 'Please wait before resending.',
                'cooldown' => $result
            ], 429);
        }

        return response()->json([
            'message' => 'A new OTP has been sent. Please check your email.',
            'last_sent_at' => now()->toIso8601String()
        ]);
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'type' => 'required|in:verification,password_reset'
        ]);

        $result = $this->otpService->verifyOtp($request->email, $request->code, $request->type);

        if (Str::length($result) === 64) {
            return response()->json([
                'message' => 'Code verified successfully.',
                'token' => $result
            ]);
        }

        return response()->json(['message' => $result], 400);
    }
}
