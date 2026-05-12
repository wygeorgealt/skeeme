<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SupportController extends Controller
{
    /**
     * Handle incoming support requests from the mobile app.
     * Accepts optional screenshot image upload.
     */
    public function contact(Request $request)
    {
        $request->validate([
            'message' => 'required|string|min:10|max:5000',
            'screenshot' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120', // 5MB max
        ]);

        $user = $request->user();

        try {
            // Handle screenshot upload
            $screenshotPath = null;
            if ($request->hasFile('screenshot')) {
                $screenshotPath = $request->file('screenshot')
                    ->store('support-screenshots/' . $user->id, 'public');
            }

            $content = "Name: {$user->name}\n";
            $content .= "Email: {$user->email}\n";
            $content .= "User ID: {$user->id}\n";
            $content .= "Plan: " . ($user->is_unlimited_student ? 'Unlimited Pro' : 'Free') . "\n";
            if ($screenshotPath) {
                $content .= "Screenshot: " . url('storage/' . $screenshotPath) . "\n";
            }
            $content .= "----------------------------------------\n\n";
            $content .= "Message:\n" . $request->message . "\n";

            $recipient = 'otuturusolomom@gmail.com';
 
            // Save to database for Filament visibility
            \App\Models\SupportTicket::create([
                'user_id' => $user->id,
                'title' => 'Mobile App Support: ' . \Illuminate\Support\Str::limit($request->message, 50),
                'description' => $request->message,
                'screenshot_path' => $screenshotPath,
                'priority' => 'medium',
                'status' => 'open',
                'category' => 'other',
            ]);
 
            Mail::raw($content, function ($msg) use ($user, $recipient, $screenshotPath) {
                $mail = $msg->to($recipient)
                    ->replyTo($user->email, $user->name)
                    ->subject("Skeeme Support Ticket - {$user->name}");

                // Attach screenshot to email if present
                if ($screenshotPath) {
                    $fullPath = storage_path('app/public/' . $screenshotPath);
                    if (file_exists($fullPath)) {
                        $msg->attach($fullPath);
                    }
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Your support request has been sent successfully.'
            ]);
        } catch (\Exception $e) {
            Log::error('Support Email Failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again later.'
            ], 500);
        }
    }
}
