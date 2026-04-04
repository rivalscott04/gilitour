<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class DashboardService
{
    public function summary(User $viewer): array
    {
        $now = now();
        $base = $viewer->bookingsVisibleQuery();
        $upcoming = (clone $base)->where('tour_start_at', '>=', $now);

        return [
            'total_bookings' => (clone $base)->count(),
            'upcoming_tours' => (clone $upcoming)->count(),
            'guests_expected' => (clone $upcoming)->sum('participants'),
            'needs_attention' => (clone $base)
                ->whereBetween('tour_start_at', [$now, Carbon::now()->addDay()])
                ->count(),
        ];
    }

    public function urgentBookings(User $viewer, int $limit = 3)
    {
        return $viewer->bookingsVisibleQuery()
            ->with('customer')
            ->whereBetween('tour_start_at', [now(), now()->addDay()])
            ->orderBy('tour_start_at')
            ->limit($limit)
            ->get();
    }

    public function recentBookings(User $viewer, int $limit = 6)
    {
        return $viewer->bookingsVisibleQuery()
            ->with('customer')
            ->latest()
            ->limit($limit)
            ->get();
    }
}
