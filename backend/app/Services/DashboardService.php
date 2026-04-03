<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function summary(): array
    {
        $now = now();
        $upcoming = Booking::query()->where('tour_start_at', '>=', $now);

        return [
            'total_bookings' => Booking::query()->count(),
            'upcoming_tours' => (clone $upcoming)->count(),
            'guests_expected' => (clone $upcoming)->sum('participants'),
            'needs_attention' => Booking::query()
                ->whereBetween('tour_start_at', [$now, Carbon::now()->addDay()])
                ->count(),
        ];
    }

    public function urgentBookings(int $limit = 3)
    {
        return Booking::query()
            ->with('customer')
            ->whereBetween('tour_start_at', [now(), now()->addDay()])
            ->orderBy('tour_start_at')
            ->limit($limit)
            ->get();
    }

    public function recentBookings(int $limit = 6)
    {
        return Booking::query()->with('customer')->latest()->limit($limit)->get();
    }
}
