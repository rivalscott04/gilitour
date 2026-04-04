<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateBookingLocalFieldsRequest;
use App\Http\Requests\UpdateBookingStatusRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\Request;
class BookingController extends Controller
{
    public function __construct(private readonly BookingService $bookingService)
    {
    }

    public function index(Request $request)
    {
        $bookings = $this->bookingService->paginate($request->all());

        return BookingResource::collection($bookings);
    }

    public function show(Booking $booking): BookingResource
    {
        return new BookingResource($booking->loadMissing('customer'));
    }

    public function updateStatus(UpdateBookingStatusRequest $request, Booking $booking): BookingResource
    {
        $updatedBooking = $this->bookingService->updateStatus($booking, $request->validated('status'));

        return new BookingResource($updatedBooking);
    }

    public function updateLocalFields(UpdateBookingLocalFieldsRequest $request, Booking $booking): BookingResource
    {
        $updatedBooking = $this->bookingService->updateLocalFields($booking, $request->validated());

        return new BookingResource($updatedBooking->loadMissing('customer'));
    }

    public function issueConfirmationLink(Booking $booking)
    {
        $booking = $this->bookingService->generateConfirmationToken($booking);
        $base = config('app.frontend_url');
        $url = $base.'/booking/'.$booking->id.'/respond?'.http_build_query([
            'token' => $booking->confirmation_token,
        ]);

        return response()->json([
            'data' => [
                'booking_id' => $booking->id,
                'confirm_url' => $url,
            ],
        ]);
    }
}

