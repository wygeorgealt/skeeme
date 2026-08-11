<?php

namespace App\Http\Controllers\API\Team;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Exam;
use App\Models\ExamSession;

class DashboardController extends Controller
{
    public function index()
    {
        // Calculate high-level stats
        $stats = [
            'total_users' => User::count(),
            'active_students' => User::where('role', 'student')->count(),
            'total_exams' => Exam::count(),
            'exams_taken_today' => ExamSession::whereDate('created_at', today())->count(),
            'recent_signups' => User::orderBy('created_at', 'desc')->take(5)->get(['id', 'name', 'email', 'created_at']),
        ];

        return response()->json($stats);
    }
}
