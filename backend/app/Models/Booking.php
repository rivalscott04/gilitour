<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    /** @use HasFactory<\Database\Factories\BookingFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'customer_id',
        'tour_name',
        'customer_name',
        'customer_email',
        'customer_phone',
        'tour_start_at',
        'location',
        'guide_name',
        'status',
        'confirmation_token',
        'confirmed_at',
        'participants',
        'notes',
        'internal_notes',
        'assigned_to_name',
        'tags',
        'needs_attention',
    ];

    protected function casts(): array
    {
        return [
            'tour_start_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'tags' => 'array',
            'needs_attention' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function statusEvents(): HasMany
    {
        return $this->hasMany(BookingStatusEvent::class);
    }
}
