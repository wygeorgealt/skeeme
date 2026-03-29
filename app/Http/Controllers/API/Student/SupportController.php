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
     */
    public function contact(Request $request)
    {
        $request->validate([
            'message' => 'required|string|min:10|max:5000',
        ]);

        $user = $request->user();

        try {
            $content = "Name: {$user->name}\n";
            $content .= "Email: {$user->email}\n";
            $content .= "User ID: {$user->id}\n";
            $content .= "Plan: " . ($user->is_unlimited ? 'Unlimited Pro' : 'Free') . "\n";
            $content .= "----------------------------------------\n\n";
            $content .= "Message:\n" . $request->message . "\n";

            $recipient = env('ADMIN_EMAIL', 'support@contact.skeeme.com');
 
            // Save to database for Filament visibility
            \App\Models\SupportTicket::create([
                'user_id' => $user->id,
                'title' => 'Mobile App Support: ' . \Illuminate\Support\Str::limit($request->message, 50),
                'description' => $request->message,
                'priority' => 'medium',
                'status' => 'open',
                'category' => 'other',
            ]);
 
            Mail::raw($content, function ($msg) use ($user, $recipient) {
                $msg->to($recipient)
                    ->replyTo($user->email, $user->name)
                    ->subject("Skeeme Support Ticket - {$user->name}");
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
