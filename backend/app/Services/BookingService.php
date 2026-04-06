<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingStatusEvent;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class BookingService
{
    public function paginate(array $filters, User $viewer): LengthAwarePaginator
    {
        $perPage = (int) ($filters['per_page'] ?? 15);
        $sortBy = $filters['sort_by'] ?? 'tour_start_at';
        $sortDir = $filters['sort_dir'] ?? 'asc';

        if (! in_array($sortBy, ['tour_start_at', 'customer_name', 'status', 'created_at'], true)) {
            $sortBy = 'tour_start_at';
        }

        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'asc';
        }

        return $viewer->bookingsVisibleQuery()
            ->with('customer')
            ->when($filters['search'] ?? null, function ($query, string $search): void {
                $query->where(function ($nested) use ($search): void {
                    $nested->where('tour_name', 'like', '%'.$search.'%')
                        ->orWhere('customer_name', 'like', '%'.$search.'%');
                });
            })
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage);
    }

    public function updateStatus(Booking $booking, string $status): Booking
    {
        $oldStatus = $booking->status;
        $booking->update(['status' => $status]);
        $this->logStatusEvent($booking, $oldStatus, $status, 'operator', 'manual_update', 'api');

        return $booking->refresh();
    }

    /**
     * Distinct assignee labels already used on visible bookings (for autocomplete).
     *
     * @return list<string>
     */
    public function assigneeNameSuggestions(User $viewer, ?string $q = null): array
    {
        $q = $q !== null ? trim($q) : '';
        if (strlen($q) > 200) {
            $q = substr($q, 0, 200);
        }

        $safe = str_replace(['%', '_'], '', $q);

        return $viewer->bookingsVisibleQuery()
            ->whereNotNull('assigned_to_name')
            ->where('assigned_to_name', '!=', '')
            ->when($safe !== '', function ($query) use ($safe): void {
                $query->where('assigned_to_name', 'like', '%'.$safe.'%');
            })
            ->select('assigned_to_name')
            ->distinct()
            ->orderBy('assigned_to_name')
            ->limit(30)
            ->pluck('assigned_to_name')
            ->values()
            ->all();
    }

    public function updateLocalFields(Booking $booking, array $payload): Booking
    {
        $booking->update([
            'internal_notes' => $payload['internal_notes'] ?? $booking->internal_notes,
            'assigned_to_name' => $payload['assigned_to_name'] ?? $booking->assigned_to_name,
            'tags' => $payload['tags'] ?? $booking->tags,
            'needs_attention' => $payload['needs_attention'] ?? $booking->needs_attention,
        ]);

        return $booking->refresh();
    }

    /**
     * @return array{0: Booking, 1: string}
     */
    public function generateConfirmationToken(Booking $booking): array
    {
        $plain = Str::random(48);
        $booking->update([
            'confirmation_token' => null,
            'confirmation_token_hash' => hash('sha256', $plain),
            'confirmation_token_expires_at' => now()->addDays(7),
        ]);

        return [$booking->refresh(), $plain];
    }

    /**
     * @param  string  $action  confirm|cancel|reschedule
     */
    public function respondViaMagicLink(Booking $booking, string $action): Booking
    {
        if ($booking->customer_response !== null) {
            return $booking->refresh();
        }

        $oldStatus = $booking->status;

        return match ($action) {
            'confirm' => $this->magicLinkConfirm($booking, $oldStatus),
            'cancel' => $this->magicLinkCancel($booking, $oldStatus),
            'reschedule' => $this->magicLinkReschedule($booking, $oldStatus),
            default => $booking->refresh(),
        };
    }

    public function confirmByLink(Booking $booking): Booking
    {
        return $this->respondViaMagicLink($booking, 'confirm');
    }

    private function magicLinkConfirm(Booking $booking, string $oldStatus): Booking
    {
        if ($booking->status === 'cancelled') {
            return $booking->refresh();
        }

        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => $booking->confirmed_at ?? now(),
            'customer_response' => 'confirmed',
            'customer_responded_at' => now(),
        ]);

        if ($oldStatus !== 'confirmed') {
            $this->logStatusEvent($booking, $oldStatus, 'confirmed', 'customer', 'magic_link_confirm', 'web');
        }

        return $booking->refresh();
    }

    private function magicLinkCancel(Booking $booking, string $oldStatus): Booking
    {
        $booking->update([
            'status' => 'cancelled',
            'customer_response' => 'cancelled',
            'customer_responded_at' => now(),
        ]);

        if ($oldStatus !== 'cancelled') {
            $this->logStatusEvent($booking, $oldStatus, 'cancelled', 'customer', 'magic_link_cancel', 'web');
        }

        return $booking->refresh();
    }

    private function magicLinkReschedule(Booking $booking, string $oldStatus): Booking
    {
        if ($booking->status === 'cancelled') {
            return $booking->refresh();
        }

        $payload = [
            'needs_attention' => true,
            'customer_response' => 'reschedule_requested',
            'customer_responded_at' => now(),
        ];

        if ($oldStatus === 'confirmed') {
            $payload['status'] = 'pending';
            $payload['confirmed_at'] = null;
        }

        $booking->update($payload);
        $booking->refresh();

        $this->logStatusEvent(
            $booking,
            $oldStatus,
            $booking->status,
            'customer',
            'magic_link_reschedule',
            'web',
            null,
            ['customer_response' => 'reschedule_requested']
        );

        return $booking;
    }

    private function logStatusEvent(
        Booking $booking,
        string $oldStatus,
        string $newStatus,
        string $changedBy,
        ?string $reason = null,
        ?string $source = null,
        ?string $sourceMessageId = null,
        ?array $metadata = null
    ): void {
        BookingStatusEvent::query()->create([
            'booking_id' => $booking->id,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'changed_by' => $changedBy,
            'reason' => $reason,
            'source' => $source,
            'source_message_id' => $sourceMessageId,
            'metadata' => $metadata,
        ]);
    }
}
