<?php

namespace App\Services;

use App\Models\EmailOtp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use App\Mail\SignupVerificationMail;
use App\Mail\ForgotPasswordMail;

class OtpService
{
    /**
     * Send an OTP to the given email.
     * Returns true on success, or an integer (seconds) if in cooldown.
     */
    public function sendOtp(string $email, string $type)
    {
        $activeOtp = EmailOtp::where('email', $email)->where('type', $type)->first();

        if ($activeOtp) {
            if ($activeOtp->last_sent_at && $activeOtp->last_sent_at->diffInSeconds(now()) < 60) {
                return 60 - $activeOtp->last_sent_at->diffInSeconds(now());
            }
            $activeOtp->delete();
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        EmailOtp::create([
            'email' => $email,
            'code_hash' => Hash::make($code),
            'type' => $type,
            'last_sent_at' => now(),
            'expires_at' => now()->addMinutes(10),
        ]);

        try {
            if ($type === 'verification') {
                Mail::mailer('resend')->to($email)->send(new SignupVerificationMail($code));
            } else {
                Mail::mailer('resend')->to($email)->send(new ForgotPasswordMail($code));
            }
            \Illuminate\Support\Facades\Log::info("OTP email sent successfully to {$email}", ['type' => $type]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to send OTP email to {$email}", [
                'type' => $type,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            // Re-throw or handle as needed, but for now we want to see the error in logs
        }

        return true;
    }

    /**
     * Verify an OTP.
     * Returns a 64-char token on success, or an error message string.
     */
    public function verifyOtp(string $email, string $code, string $type)
    {
        $otp = EmailOtp::where('email', $email)->where('type', $type)->first();

        if (!$otp) {
            return "Invalid or expired code request.";
        }

        if ($otp->attempts >= 3) {
            $otp->delete();
            return "Too many incorrect attempts. Please request a new code.";
        }

        if (now()->greaterThan($otp->expires_at)) {
            return "This code has expired.";
        }

        if (!Hash::check($code, $otp->code_hash)) {
            $otp->increment('attempts');
            $remaining = 3 - $otp->attempts;
            
            if ($remaining <= 0) {
                $otp->delete();
                return "Too many incorrect attempts. Please request a new code.";
            }
            
            return "Incorrect code. {$remaining} attempts remaining.";
        }

        // Success
        $otp->delete();
        
        $token = Str::random(64);
        Cache::put('otp_token_' . $token, $email, now()->addMinutes(15));

        return $token;
    }
}
