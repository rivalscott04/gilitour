<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tour_name' => $this->tour_name,
            'customer_name' => $this->customer?->full_name ?? $this->customer_name,
            'customer_email' => $this->customer?->email ?? $this->customer_email,
            'customer_phone' => $this->customer?->phone ?? $this->customer_phone,
            'tour_start_at' => $this->tour_start_at?->toISOString(),
            'date' => $this->tour_start_at?->toDateString(),
            'time' => $this->tour_start_at?->format('H:i'),
            'location' => $this->location,
            'guide_name' => $this->guide_name,
            'status' => $this->status,
            'confirm_url' => $this->confirmation_token
                ? $this->frontendMagicLinkUrl()
                : null,
            'customer_response' => $this->customer_response,
            'customer_responded_at' => $this->customer_responded_at?->toISOString(),
            'participants' => $this->participants,
            'notes' => $this->notes,
            'internal_notes' => $this->internal_notes,
            'assigned_to_name' => $this->assigned_to_name,
            'tags' => $this->tags ?? [],
            'needs_attention' => $this->needs_attention,
        ];
    }

    private function frontendMagicLinkUrl(): string
    {
        $base = config('app.frontend_url');

        return $base.'/booking/'.$this->id.'/respond?'.http_build_query([
            'token' => $this->confirmation_token,
        ]);
    }
}
