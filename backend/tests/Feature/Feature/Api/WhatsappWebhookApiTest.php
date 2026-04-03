<?php

namespace Tests\Feature\Feature\Api;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WhatsappWebhookApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_auto_confirms_pending_booking_on_positive_english_reply(): void
    {
        $booking = Booking::factory()->create([
            'status' => 'pending',
        ]);

        $response = $this->postJson('/api/v1/webhooks/whatsapp', [
            'booking_id' => $booking->id,
            'message' => 'Yes, sounds good. Confirmed.',
            'source_message_id' => 'wa-msg-001',
            'sender_phone' => '+12025550123',
        ]);

        $response->assertOk()
            ->assertJsonPath('data.status', 'confirmed')
            ->assertJsonPath('data.intent.intent', 'confirmed');

        $this->assertDatabaseHas('chat_messages', [
            'booking_id' => $booking->id,
            'sender' => 'customer',
            'source' => 'whatsapp',
        ]);

        $this->assertDatabaseHas('booking_status_events', [
            'booking_id' => $booking->id,
            'new_status' => 'confirmed',
            'reason' => 'wa_positive_reply',
        ]);
    }
}
