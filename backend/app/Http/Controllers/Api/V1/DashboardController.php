<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService)
    {
    }

    public function summary()
    {
        return response()->json([
            'data' => $this->dashboardService->summary(),
        ]);
    }

    public function urgentBookings(Request $request)
    {
        return BookingResource::collection(
            $this->dashboardService->urgentBookings((int) $request->query('limit', 3))
        );
    }

    public function recentBookings(Request $request)
    {
        return BookingResource::collection(
            $this->dashboardService->recentBookings((int) $request->query('limit', 6))
        );
    }
}
