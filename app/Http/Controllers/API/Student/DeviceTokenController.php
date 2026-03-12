<?php

namespace App\Http\Controllers\API\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    /**
     * Store the Expo Push Token for the authenticated user.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'expo_push_token' => 'required|string',
        ]);

        $user = auth()->user();
        $user->expo_push_token = $request->input('expo_push_token');
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Device token updated successfully',
        ]);
    }
}
