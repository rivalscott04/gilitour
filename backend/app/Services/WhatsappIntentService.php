<?php

namespace App\Services;

class WhatsappIntentService
{
    public function detectIntent(string $message): array
    {
        $text = strtolower(trim($message));

        $positiveKeywords = [
            'yes', 'confirmed', 'confirm', 'okay', 'ok', 'sounds good', 'perfect', 'see you',
        ];
        $negativeKeywords = [
            'no', "can't", 'cannot', 'reschedule', 'not sure', 'maybe', 'change time', 'cancel',
        ];

        foreach ($negativeKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return ['intent' => 'uncertain', 'confidence' => 0.3];
            }
        }

        foreach ($positiveKeywords as $keyword) {
            if (str_contains($text, $keyword)) {
                return ['intent' => 'confirmed', 'confidence' => 0.9];
            }
        }

        return ['intent' => 'unknown', 'confidence' => 0.2];
    }
}
