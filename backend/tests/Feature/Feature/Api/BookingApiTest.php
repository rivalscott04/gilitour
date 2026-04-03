<?php

namespace Tests\Feature\Feature\Api;

use App\Models\Booking;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_bookings_with_filters(): void
    {
        Booking::factory()->create(['customer_id' => null, 'customer_name' => 'Alice', 'status' => 'confirmed']);
        Booking::factory()->create(['customer_id' => null, 'customer_name' => 'Bob', 'status' => 'pending']);

        $response = $this->getJson('/api/v1/bookings?status=confirmed');

        $response->assertOk()
            ->assertJsonPath('data.0.customer_name', 'Alice')
            ->assertJsonCount(1, 'data');
    }

    public function test_it_updates_booking_status(): void
    {
        $booking = Booking::factory()->create(['status' => 'pending']);

        $response = $this->patchJson("/api/v1/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ]);

        $response->assertOk()->assertJsonPath('data.status', 'confirmed');
        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_it_issues_clickable_confirmation_link_and_confirms_booking(): void
    {
        $booking = Booking::factory()->create([
            'status' => 'pending',
            'confirmation_token' => null,
        ]);

        $issue = $this->postJson("/api/v1/bookings/{$booking->id}/issue-confirm-link");
        $issue->assertOk()->assertJsonPath('data.booking_id', $booking->id);

        $link = $issue->json('data.confirm_url');
        $pathAndQuery = parse_url($link, PHP_URL_PATH).'?'.parse_url($link, PHP_URL_QUERY);
        $this->getJson($pathAndQuery)
            ->assertOk()
            ->assertJsonPath('data.status', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
        ]);
    }

    public function test_it_updates_local_operational_fields_without_touching_external_data(): void
    {
        $booking = Booking::factory()->create([
            'tour_name' => 'External Tour Name',
            'status' => 'pending',
            'internal_notes' => null,
            'assigned_to_name' => null,
            'tags' => [],
            'needs_attention' => false,
        ]);

        $response = $this->patchJson("/api/v1/bookings/{$booking->id}/local-fields", [
            'internal_notes' => 'Customer requested hotel pickup.',
            'assigned_to_name' => 'Ops Team A',
            'tags' => ['pickup', 'vip'],
            'needs_attention' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.internal_notes', 'Customer requested hotel pickup.')
            ->assertJsonPath('data.assigned_to_name', 'Ops Team A')
            ->assertJsonPath('data.needs_attention', true)
            ->assertJsonPath('data.tour_name', 'External Tour Name');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'tour_name' => 'External Tour Name',
            'assigned_to_name' => 'Ops Team A',
            'needs_attention' => 1,
        ]);
    }
}
