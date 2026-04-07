<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\BookingStatusEvent;
use App\Models\ChatMessage;
use App\Models\ChatTemplate;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    private const ENGLISH_CHAT_MESSAGES = [
        'Hi, I would like to confirm my booking details.',
        'Could you please share the exact meeting point?',
        'Thank you, that schedule works for us.',
        'We are on our way and should arrive on time.',
        'Can we request hotel pickup for this tour?',
        'Perfect, see you tomorrow morning.',
        'Please let me know if anything changes.',
        'I have completed the payment, thank you.',
        'Thanks for the update, we are ready.',
        'Could you confirm the pickup time once again?',
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->resetSeedData();

        User::query()->updateOrCreate(
            ['email' => 'admin@gilitour.test'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'role' => 'admin',
            ],
        );

        $guideUser = User::query()->updateOrCreate(
            ['email' => 'guide@gilitour.test'],
            [
                'name' => 'Guide Lead',
                'password' => 'password',
                'role' => 'operator',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'support@gilitour.test'],
            [
                'name' => 'Support Agent',
                'password' => 'password',
                'role' => 'operator',
            ],
        );

        ChatTemplate::query()->firstOrCreate(
            ['name' => 'Booking Reminder'],
            ['content' => '{{greeting}} {{customerName}}! Friendly reminder: you already have {{tourName}} booked. Please let us know if you’re still joining us on the day, or if anything changed. Thanks!']
        );
        ChatTemplate::query()->firstOrCreate(
            ['name' => 'Thank You'],
            ['content' => '{{greeting}} {{customerName}}, thanks for choosing us! We hope you enjoyed the {{tourName}}.']
        );
        ChatTemplate::query()->firstOrCreate(
            ['name' => 'Payment Request'],
            ['content' => '{{greeting}} {{customerName}}, please kindly complete the payment for your {{tourName}} booking at your earliest convenience.']
        );

        $customers = collect([
            ['name' => 'James Carter', 'email' => 'james.carter@example.com', 'phone' => '+1-202-555-0101', 'source' => 'getyourguide', 'country' => 'US'],
            ['name' => 'Emma Wilson', 'email' => 'emma.wilson@example.com', 'phone' => '+44-20-7946-0123', 'source' => 'getyourguide', 'country' => 'GB'],
            ['name' => 'Liam Brown', 'email' => 'liam.brown@example.com', 'phone' => '+61-2-9012-4455', 'source' => 'manual', 'country' => 'AU'],
            ['name' => 'Sophia Miller', 'email' => 'sophia.miller@example.com', 'phone' => '+49-30-1234-5678', 'source' => 'whatsapp-import', 'country' => 'DE'],
            ['name' => 'Noah Davis', 'email' => 'noah.davis@example.com', 'phone' => '+33-1-8456-7788', 'source' => 'getyourguide', 'country' => 'FR'],
            ['name' => 'Olivia Martin', 'email' => 'olivia.martin@example.com', 'phone' => '+39-06-9988-2211', 'source' => 'manual', 'country' => 'IT'],
            ['name' => 'Ethan Taylor', 'email' => 'ethan.taylor@example.com', 'phone' => '+34-91-558-7744', 'source' => 'getyourguide', 'country' => 'ES'],
            ['name' => 'Ava Anderson', 'email' => 'ava.anderson@example.com', 'phone' => '+31-20-665-9988', 'source' => 'whatsapp-import', 'country' => 'NL'],
            ['name' => 'Mason Thomas', 'email' => 'mason.thomas@example.com', 'phone' => '+65-6123-4455', 'source' => 'getyourguide', 'country' => 'SG'],
            ['name' => 'Isabella Moore', 'email' => 'isabella.moore@example.com', 'phone' => '+81-3-4567-8899', 'source' => 'manual', 'country' => 'JP'],
            ['name' => 'Lucas Jackson', 'email' => 'lucas.jackson@example.com', 'phone' => '+1-310-555-0134', 'source' => 'getyourguide', 'country' => 'US'],
            ['name' => 'Mia White', 'email' => 'mia.white@example.com', 'phone' => '+1-646-555-0199', 'source' => 'whatsapp-import', 'country' => 'US'],
        ])->map(function (array $item) {
            return Customer::query()->create([
                'external_source' => $item['source'],
                'external_customer_ref' => 'SRC-'.strtoupper(substr($item['source'], 0, 3)).'-'.fake()->unique()->numberBetween(10000, 99999),
                'full_name' => $item['name'],
                'email' => $item['email'],
                'phone' => $item['phone'],
                'country_code' => $item['country'],
                'raw_payload' => ['seed' => true, 'channel' => $item['source']],
            ]);
        });

        $tours = [
            'Gili Trawangan Snorkeling Escape',
            'Gili Air Coral Garden Tour',
            'Gili Meno Turtle Point Adventure',
            '3 Gili Island Hopping',
            'Gili Trawangan Cycling & Sunset Point',
            'Gili Air Freedive Starter Trip',
            'Gili Meno Private Beach Picnic',
            'Lombok Selatan Beach Discovery',
            'Rinjani Foothill Sunrise Trek',
            'Senggigi Sunset Cruise',
            'Kuta Mandalika Coastal Trip',
            'Sendang Gile & Tiu Kelep Waterfall Trek',
            'Benang Kelambu and Benang Stokel Waterfall Tour',
            'Jeruk Manis Waterfall Nature Walk',
            'Mangku Sakti Waterfall Adventure',
            'Sembalun Highland & Pergasingan Viewpoint',
            'Tetebatu Rice Terrace and Village Tour',
        ];
        $locations = [
            'Bangsal Harbor',
            'Teluk Nare Pier',
            'Gili Trawangan Port',
            'Gili Air Harbor',
            'Gili Meno Jetty',
            'Senggigi Meeting Point',
            'Kuta Mandalika Pickup Point',
            'Mataram City Center',
            'Senaru Waterfall Gate',
            'Aik Berik Village Basecamp',
            'Tetebatu Main Junction',
            'Sembalun Valley Point',
        ];
        $guides = ['Rahman', 'Lalu', 'Ari', 'Teguh', 'Fadli', 'Zul', 'Irfan'];
        $statuses = ['standby', 'confirmed', 'cancelled'];
        $guideTeams = ['Guide Team A', 'Guide Team B', 'Guide Team C'];

        $customers->each(function (Customer $customer, int $index) use ($guideUser, $tours, $locations, $guides, $statuses, $guideTeams): void {
            $bookingCount = $index % 3 === 0 ? 2 : 1;

            foreach (range(1, $bookingCount) as $i) {
                $tourStart = Carbon::now()->addDays(($index + $i) % 8 - 2)->setTime(8 + (($index + $i) % 5), 0);
                $status = $statuses[($index + $i) % count($statuses)];
                $needsAttention = $status !== 'cancelled' && $tourStart->isBetween(now(), now()->addDays(2));

                $booking = Booking::query()->create([
                    'user_id' => $guideUser->id,
                    'customer_id' => $customer->id,
                    'tour_name' => $tours[($index + $i) % count($tours)],
                    'customer_name' => $customer->full_name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'tour_start_at' => $tourStart,
                    'location' => $locations[($index + $i) % count($locations)],
                    'guide_name' => $guides[($index + $i) % count($guides)],
                    'status' => $status,
                    'participants' => (($index + $i) % 4) + 1,
                    'notes' => 'Seeded booking data for demo environment.',
                    'internal_notes' => $needsAttention ? 'Please reconfirm pickup location one day before departure.' : null,
                    'assigned_to_name' => $guideTeams[($index + $i) % count($guideTeams)],
                    'tags' => $needsAttention ? ['pickup', 'follow-up'] : ['standard'],
                    'needs_attention' => $needsAttention,
                ]);

                foreach (range(0, 2) as $msgIndex) {
                    ChatMessage::query()->create([
                        'booking_id' => $booking->id,
                        'sender' => $msgIndex % 2 === 0 ? 'customer' : 'operator',
                        'message' => self::ENGLISH_CHAT_MESSAGES[($index + $i + $msgIndex) % count(self::ENGLISH_CHAT_MESSAGES)],
                        'source' => 'whatsapp',
                        'created_at' => $tourStart->copy()->subDays(2)->addMinutes($msgIndex * 45),
                        'updated_at' => now(),
                    ]);
                }

                if ($status === 'confirmed') {
                    BookingStatusEvent::query()->create([
                        'booking_id' => $booking->id,
                        'old_status' => 'standby',
                        'new_status' => 'confirmed',
                        'changed_by' => 'system',
                        'reason' => 'wa_positive_reply',
                        'source' => 'whatsapp',
                        'source_message_id' => 'seed-msg-'.$booking->id,
                        'metadata' => ['seeded' => true],
                    ]);
                }
            }
        });
    }

    private function resetSeedData(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');
        } else {
            DB::statement('PRAGMA foreign_keys = OFF');
        }
        BookingStatusEvent::query()->delete();
        ChatMessage::query()->delete();
        Booking::query()->delete();
        Customer::query()->delete();
        ChatTemplate::query()->delete();
        User::query()->whereIn('email', ['admin@gilitour.test', 'guide@gilitour.test', 'support@gilitour.test'])->delete();
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
        } else {
            DB::statement('PRAGMA foreign_keys = ON');
        }
    }
}
