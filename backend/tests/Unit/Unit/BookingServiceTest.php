<?php

namespace Tests\Unit\Unit;

use App\Models\Booking;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_filters_bookings_by_status_and_search(): void
    {
        Booking::factory()->create([
            'tour_name' => 'Bali Sunrise Tour',
            'customer_name' => 'Alice',
            'status' => 'confirmed',
        ]);
        Booking::factory()->create([
            'tour_name' => 'Komodo Day Trip',
            'customer_name' => 'Bob',
            'status' => 'pending',
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $service = new BookingService;
        $result = $service->paginate([
            'search' => 'Bali',
            'status' => 'confirmed',
            'per_page' => 10,
        ], $admin);

        $this->assertCount(1, $result->items());
        $this->assertSame('Alice', $result->items()[0]->customer_name);
    }

    public function test_it_filters_bookings_by_comma_separated_status(): void
    {
        Booking::factory()->create([
            'customer_name' => 'Standby Guest',
            'status' => 'standby',
        ]);
        Booking::factory()->create([
            'customer_name' => 'Pending Guest',
            'status' => 'pending',
        ]);
        Booking::factory()->create([
            'customer_name' => 'Confirmed Guest',
            'status' => 'confirmed',
        ]);

        $admin = User::factory()->create(['role' => 'admin']);
        $service = new BookingService;
        $result = $service->paginate([
            'status' => 'standby,pending',
            'per_page' => 10,
        ], $admin);

        $names = collect($result->items())->pluck('customer_name')->sort()->values()->all();
        $this->assertSame(['Pending Guest', 'Standby Guest'], $names);
    }
}
