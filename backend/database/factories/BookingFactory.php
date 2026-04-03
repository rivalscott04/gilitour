<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'tour_name' => fake()->randomElement(['Bali Sunrise Tour', 'Komodo Day Trip', 'Ubud Waterfall']),
            'customer_name' => fake()->name(), // Backward compatibility for existing frontend contract
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'tour_start_at' => fake()->dateTimeBetween('now', '+10 days'),
            'location' => fake()->city(),
            'guide_name' => fake()->name(),
            'status' => fake()->randomElement(['standby', 'confirmed', 'pending', 'cancelled']),
            'participants' => fake()->numberBetween(1, 8),
            'notes' => fake()->optional()->sentence(),
            'internal_notes' => fake()->optional()->sentence(),
            'assigned_to_name' => fake()->optional()->name(),
            'tags' => fake()->boolean(40) ? [fake()->randomElement(['vip', 'pickup', 'reschedule'])] : [],
            'needs_attention' => fake()->boolean(20),
        ];
    }
}
