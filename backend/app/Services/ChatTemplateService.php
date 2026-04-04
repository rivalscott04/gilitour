<?php

namespace App\Services;

use App\Models\ChatTemplate;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ChatTemplateService
{
    /**
     * @var array<int, array{name: string, content: string}>
     */
    private const DEFAULT_TEMPLATES = [
        [
            'name' => 'Booking Reminder',
            'content' => '{{greeting}} {{customerName}}! Friendly reminder: you already have {{tourName}} booked. Please let us know if you’re still joining us on the day, or if anything changed. Thanks!',
        ],
        [
            'name' => 'Thank You',
            'content' => '{{greeting}} {{customerName}}, thanks for choosing us! We hope you enjoyed the {{tourName}}.',
        ],
        [
            'name' => 'Payment Request',
            'content' => '{{greeting}} {{customerName}}, please kindly complete the payment for your {{tourName}} booking at your earliest convenience.',
        ],
    ];

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        $this->ensureDefaults();

        return ChatTemplate::query()->latest()->paginate($perPage);
    }

    private function ensureDefaults(): void
    {
        if (ChatTemplate::query()->exists()) {
            return;
        }

        ChatTemplate::query()->insert(
            array_map(
                fn (array $template): array => [
                    'name' => $template['name'],
                    'content' => $template['content'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                self::DEFAULT_TEMPLATES
            )
        );
    }
}
