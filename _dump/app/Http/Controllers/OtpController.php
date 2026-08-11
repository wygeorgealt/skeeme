<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    /**
     * Generate a 6-digit OTP
     */
    private function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Send OTP via email
     */
    private function sendOtp(string $email, string $otp): void
    {
        Mail::mailer(config('mail.default'))->to($email)->send(new OtpMail($otp, $email));
    }

    /**
     * Show registration OTP verification page
     */
    public function showRegisterOtp(Request $request)
    {
        $email = session('register_email');
        
        if (!$email) {
            return redirect()->route('register')->with('error', 'Please complete registration first.');
        }

        return view('livewire.auth.otp-register');
    }

    /**
     * Verify registration OTP
     */
    public function verifyRegisterOtp(Request $request)
    {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $email = session('register_email');
        $cachedOtp = Cache::get("otp.register.{$email}");

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return back()->with('error', 'Invalid verification code. Please try again.');
        }

        // OTP verified, create the user
        $userData = session('register_data');
        
        $user = User::create([
            'email' => $email,
            'password' => Hash::make($userData['password']),
            'email_verified_at' => now(),
        ]);

        // Clear session data
        session()->forget(['register_email', 'register_data']);
        Cache::forget("otp.register.{$email}");

        // Log the user in
        auth()->login($user);

        return redirect()->route('role-selection')->with('success', 'Email verified successfully!');
    }

    /**
     * Resend registration OTP
     */
    public function resendRegisterOtp(Request $request)
    {
        $email = session('register_email');

        if (!$email) {
            return redirect()->route('register')->with('error', 'Please complete registration first.');
        }

        $otp = $this->generateOtp();
        Cache::put("otp.register.{$email}", $otp, now()->addMinutes(10));
        
        try {
            $this->sendOtp($email, $otp);
            return back()->with('success', 'Verification code sent to your email.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send verification code. Please try again.');
        }
    }

    /**
     * Show password reset OTP verification page
     */
    public function showResetPasswordOtp(Request $request)
    {
        $email = session('reset_email');
        
        if (!$email) {
            return redirect()->route('password.request')->with('error', 'Please request a password reset first.');
        }

        return view('livewire.auth.otp-reset-password');
    }

    /**
     * Verify password reset OTP
     */
    public function verifyResetPasswordOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
            'otp' => 'required|digits:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = $request->email;
        $cachedOtp = Cache::get("otp.reset.{$email}");

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return back()->with('error', 'Invalid verification code. Please try again.');
        }

        // OTP verified, update password
        $user = User::where('email', $email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        // Clear session and cache
        session()->forget('reset_email');
        Cache::forget("otp.reset.{$email}");

        return redirect()->route('login')->with('success', 'Password reset successfully! Please log in with your new password.');
    }

    /**
     * Resend password reset OTP
     */
    public function resendResetPasswordOtp(Request $request)
    {
        $email = session('reset_email');

        if (!$email) {
            return redirect()->route('password.request')->with('error', 'Please request a password reset first.');
        }

        $otp = $this->generateOtp();
        Cache::put("otp.reset.{$email}", $otp, now()->addMinutes(10));
        
        try {
            $this->sendOtp($email, $otp);
            return back()->with('success', 'Verification code sent to your email.');
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to send verification code. Please try again.');
        }
    }
}
