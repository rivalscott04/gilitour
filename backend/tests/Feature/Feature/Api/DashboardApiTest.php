<?php

namespace Tests\Feature\Feature\Api;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_returns_dashboard_summary_and_lists(): void
    {
        Booking::factory()->create([
            'tour_start_at' => now()->addHours(2),
            'participants' => 3,
            'status' => 'pending',
        ]);
        Booking::factory()->create([
            'tour_start_at' => now()->addDays(3),
            'participants' => 2,
            'status' => 'confirmed',
        ]);

        $this->getJson('/api/v1/dashboard/summary')
            ->assertOk()
            ->assertJsonPath('data.total_bookings', 2);

        $this->getJson('/api/v1/dashboard/urgent-bookings?limit=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->getJson('/api/v1/dashboard/recent-bookings?limit=1')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
