<?php

namespace App\Providers;

use App\Models\Booking;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): Limit {
            return Limit::perMinute(10)->by($request->ip());
        });

        RateLimiter::for('api-sensitive', function (Request $request): Limit {
            $key = $request->user() !== null
                ? 'user:'.$request->user()->getAuthIdentifier()
                : 'ip:'.$request->ip();

            return Limit::perMinute(240)->by($key);
        });

        RateLimiter::for('magic-link', function (Request $request): array {
            $booking = $request->route('booking');
            $bookingKey = $booking instanceof Booking ? (string) $booking->getKey() : 'unknown';

            $perBookingIp = max(1, (int) config('rate_limit.magic_link_per_booking_ip', 20));
            $perIp = max(1, (int) config('rate_limit.magic_link_per_ip', 100));

            return [
                Limit::perMinute($perBookingIp)->by('ml-booking:'.$bookingKey.':'.$request->ip()),
                Limit::perMinute($perIp)->by('ml-ip:'.$request->ip()),
            ];
        });
    }
}
