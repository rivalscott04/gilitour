<?php

namespace App\Models;

use Database\Factories\ChatTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatTemplate extends Model
{
    /** @use HasFactory<ChatTemplateFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'content',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
