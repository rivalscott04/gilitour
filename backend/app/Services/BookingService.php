<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingStatusEvent;
use Illuminate\Support\Str;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class BookingService
{
    public function paginate(array $filters): LengthAwarePaginator
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

        return Booking::query()
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

    public function generateConfirmationToken(Booking $booking): Booking
    {
        if ($booking->confirmation_token) {
            return $booking;
        }

        $booking->update([
            'confirmation_token' => Str::random(40),
        ]);

        return $booking->refresh();
    }

    public function confirmByCustomerMessage(Booking $booking, string $sourceMessageId, array $metadata = []): Booking
    {
        if ($booking->status === 'confirmed') {
            return $booking;
        }

        $oldStatus = $booking->status;
        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $this->logStatusEvent(
            $booking,
            $oldStatus,
            'confirmed',
            'system',
            'wa_positive_reply',
            'whatsapp',
            $sourceMessageId,
            $metadata
        );

        return $booking->refresh();
    }

    public function confirmByLink(Booking $booking): Booking
    {
        if ($booking->status === 'confirmed') {
            return $booking;
        }

        $oldStatus = $booking->status;
        $booking->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $this->logStatusEvent($booking, $oldStatus, 'confirmed', 'customer', 'confirm_link_click', 'web');

        return $booking->refresh();
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
