<?php

namespace Tests\Feature\Feature\Api;

use App\Models\Booking;
use App\Models\User;

class BookingApiTest extends AuthenticatedApiTestCase
{
    public function test_operator_cannot_access_booking_owned_by_peer(): void
    {
        $peer = User::factory()->create(['role' => 'operator']);
        $booking = Booking::factory()->create(['user_id' => $peer->id]);

        $this->getJson("/api/v1/bookings/{$booking->id}")->assertForbidden();
        $this->patchJson("/api/v1/bookings/{$booking->id}/status", [
            'status' => 'confirmed',
        ])->assertForbidden();
    }

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

    public function test_it_issues_magic_link_url_pointing_at_frontend_spa(): void
    {
        $booking = Booking::factory()->create([
            'status' => 'pending',
            'confirmation_token' => null,
        ]);

        $issue = $this->postJson("/api/v1/bookings/{$booking->id}/issue-confirm-link");
        $issue->assertOk()->assertJsonPath('data.booking_id', $booking->id);

        $link = $issue->json('data.confirm_url');
        $this->assertStringContainsString('/booking/'.$booking->id.'/respond', $link);
        $this->assertStringContainsString('token=', $link);
    }

    public function test_magic_link_api_preflight_and_confirm(): void
    {
        $booking = Booking::factory()->create([
            'status' => 'pending',
            'confirmation_token' => null,
            'confirmation_token_hash' => null,
            'confirmation_token_expires_at' => null,
        ]);

        $issue = $this->postJson("/api/v1/bookings/{$booking->id}/issue-confirm-link")->assertOk();
        $link = $issue->json('data.confirm_url');
        $this->assertIsString($link);
        parse_str((string) parse_url($link, PHP_URL_QUERY), $query);
        $token = $query['token'] ?? '';
        $this->assertNotSame('', $token);

        $this->getJson("/api/v1/bookings/{$booking->id}/magic-link?token={$token}")
            ->assertOk()
            ->assertJsonPath('data.view', 'form');

        $this->postJson("/api/v1/bookings/{$booking->id}/magic-link", [
            'token' => $token,
            'action' => 'confirm',
        ])->assertOk()
            ->assertJsonPath('data.view', 'done')
            ->assertJsonPath('data.customer_response', 'confirmed');

        $this->assertDatabaseHas('bookings', [
            'id' => $booking->id,
            'status' => 'confirmed',
            'customer_response' => 'confirmed',
        ]);
    }

    public function test_magic_link_records_cancel_and_reschedule(): void
    {
        $pending = Booking::factory()->create([
            'status' => 'pending',
            'confirmation_token' => null,
            'confirmation_token_hash' => hash('sha256', 'tok-cancel-test'),
            'confirmation_token_expires_at' => now()->addDay(),
            'needs_attention' => false,
        ]);

        $this->postJson("/api/v1/bookings/{$pending->id}/magic-link", [
            'token' => 'tok-cancel-test',
            'action' => 'cancel',
        ])->assertOk();

        $pending->refresh();
        $this->assertSame('cancelled', $pending->status);
        $this->assertSame('cancelled', $pending->customer_response);

        $confirmed = Booking::factory()->create([
            'status' => 'confirmed',
            'confirmation_token' => null,
            'confirmation_token_hash' => hash('sha256', 'tok-resched-test'),
            'confirmation_token_expires_at' => now()->addDay(),
            'needs_attention' => false,
        ]);

        $this->postJson("/api/v1/bookings/{$confirmed->id}/magic-link", [
            'token' => 'tok-resched-test',
            'action' => 'reschedule',
        ])->assertOk();

        $confirmed->refresh();
        $this->assertSame('pending', $confirmed->status);
        $this->assertTrue($confirmed->needs_attention);
        $this->assertSame('reschedule_requested', $confirmed->customer_response);
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
