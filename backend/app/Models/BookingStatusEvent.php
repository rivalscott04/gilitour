<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class BookingStatusEvent extends Model
{
    protected $fillable = [
        'booking_id',
        'old_status',
        'new_status',
        'changed_by',
        'reason',
        'source',
        'source_message_id',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
