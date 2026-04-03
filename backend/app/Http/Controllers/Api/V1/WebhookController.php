<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreWhatsappWebhookRequest;
use App\Models\Booking;
use App\Services\BookingService;
use App\Services\WhatsappIntentService;

class WebhookController extends Controller
{
    public function __construct(
        private readonly WhatsappIntentService $intentService,
        private readonly BookingService $bookingService
    ) {
    }

    public function whatsapp(StoreWhatsappWebhookRequest $request)
    {
        $validated = $request->validated();
        $booking = Booking::query()->findOrFail($validated['booking_id']);

        $booking->chatMessages()->create([
            'sender' => 'customer',
            'message' => $validated['message'],
            'source' => 'whatsapp',
        ]);

        $intent = $this->intentService->detectIntent($validated['message']);
        $updated = $booking;

        if ($intent['intent'] === 'confirmed' && $intent['confidence'] >= 0.85 && $booking->status === 'pending') {
            $updated = $this->bookingService->confirmByCustomerMessage(
                $booking,
                $validated['source_message_id'],
                ['sender_phone' => $validated['sender_phone'] ?? null]
            );
        }

        return response()->json([
            'data' => [
                'booking_id' => $updated->id,
                'status' => $updated->status,
                'intent' => $intent,
            ],
        ]);
    }
}
