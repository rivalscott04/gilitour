<?php

namespace Tests\Feature\Feature\Api;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingMagicLinkRateLimitTest extends TestCase
{
    use RefreshDatabase;

    public function test_magic_link_requests_are_throttled_per_booking_and_ip(): void
    {
        $booking = Booking::factory()->create([
            'confirmation_token_hash' => hash('sha256', 'secret'),
            'confirmation_token_expires_at' => now()->addHour(),
        ]);

        $url = "/api/v1/bookings/{$booking->id}/magic-link?token=wrong";

        for ($i = 0; $i < 5; $i++) {
            $this->getJson($url)->assertForbidden();
        }

        $this->getJson($url)->assertStatus(429);
    }
}
