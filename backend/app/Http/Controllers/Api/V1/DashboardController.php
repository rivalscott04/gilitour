<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly DashboardService $dashboardService) {}

    public function summary(Request $request)
    {
        $this->authorize('viewAny', Booking::class);

        return response()->json([
            'data' => $this->dashboardService->summary($request->user()),
        ]);
    }

    public function urgentBookings(Request $request)
    {
        $this->authorize('viewAny', Booking::class);

        return BookingResource::collection(
            $this->dashboardService->urgentBookings($request->user(), (int) $request->query('limit', 3))
        );
    }

    public function recentBookings(Request $request)
    {
        $this->authorize('viewAny', Booking::class);

        return BookingResource::collection(
            $this->dashboardService->recentBookings($request->user(), (int) $request->query('limit', 6))
        );
    }
}
