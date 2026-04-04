<?php

namespace Tests\Unit\Unit;

use App\Models\Booking;
use App\Models\User;
use App\Services\DashboardService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_builds_dashboard_summary(): void
    {
        Booking::factory()->create([
            'tour_start_at' => now()->addHours(3),
            'participants' => 2,
        ]);
        Booking::factory()->create([
            'tour_start_at' => now()->addDays(2),
            'participants' => 4,
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $summary = (new DashboardService)->summary($admin);

        $this->assertSame(2, $summary['total_bookings']);
        $this->assertSame(2, $summary['upcoming_tours']);
        $this->assertSame(6, $summary['guests_expected']);
        $this->assertSame(1, $summary['needs_attention']);
    }
}
