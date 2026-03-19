<?php

namespace App\Http\Controllers\Api;

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
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:verification,password_reset'
        ]);

        $cooldown = $this->processSend($request->email, $request->type);
        
        if (is_int($cooldown)) {
            return response()->json([
                'message' => 'Please wait before resending.',
                'cooldown' => $cooldown
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

        $cooldown = $this->processSend($request->email, $request->type);
        if (is_int($cooldown)) {
            return response()->json([
                'message' => 'Please wait before resending.',
                'cooldown' => $cooldown
            ], 429);
        }

        return response()->json([
            'message' => 'A new OTP has been sent. Please check your email.',
            'last_sent_at' => now()->toIso8601String()
        ]);
    }

    private function processSend($email, $type)
    {
        $activeOtp = EmailOtp::where('email', $email)->where('type', $type)->first();

        if ($activeOtp) {
            if ($activeOtp->last_sent_at && $activeOtp->last_sent_at->diffInSeconds(now()) < 60) {
                return 60 - $activeOtp->last_sent_at->diffInSeconds(now()); // return remaining cooldown
            }
            $activeOtp->delete(); // Invalidate old code
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        EmailOtp::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'type' => $type,
            'last_sent_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);

        if ($type === 'verification') {
            Mail::mailer('resend')->to($email)->send(new SignupVerificationMail($code));
        } else {
            Mail::mailer('resend')->to($email)->send(new ForgotPasswordMail($code));
        }

        return true;
    }

    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
            'type' => 'required|in:verification,password_reset'
        ]);

        $otp = EmailOtp::where('email', $request->email)->where('type', $request->type)->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired code request.'], 400);
        }

        if ($otp->attempts >= 3) {
            $otp->delete();
            return response()->json(['message' => 'Too many incorrect attempts. Please request a new code.'], 400);
        }

        if (now()->greaterThan($otp->expires_at)) {
            return response()->json(['message' => 'This code has expired.'], 400);
        }

        if (!Hash::check($request->code, $otp->code_hash)) {
            $otp->increment('attempts');
            $remaining = 3 - $otp->attempts;
            
            if ($remaining <= 0) {
                $otp->delete();
                return response()->json(['message' => 'Too many incorrect attempts. Please request a new code.'], 400);
            }
            
            return response()->json(['message' => "Incorrect code. {$remaining} attempts remaining."], 400);
        }

        // Success
        $otp->delete();
        
        // Generate short-lived verification token
        $token = Str::random(64);
        Cache::put('otp_token_' . $token, $request->email, now()->addMinutes(15));

        return response()->json([
            'message' => 'Code verified successfully.',
            'token' => $token
        ]);
    }
}
