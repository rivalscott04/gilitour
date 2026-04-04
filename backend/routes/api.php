<?php

use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\BookingMagicLinkController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\ChatTemplateController;
use App\Http\Controllers\Api\V1\CustomerController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/trends', [AnalyticsController::class, 'trends']);
    Route::get('/analytics/export/bookings.csv', [AnalyticsController::class, 'exportCsv']);
    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/urgent-bookings', [DashboardController::class, 'urgentBookings']);
    Route::get('/dashboard/recent-bookings', [DashboardController::class, 'recentBookings']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}/status', [BookingController::class, 'updateStatus']);
    Route::patch('/bookings/{booking}/local-fields', [BookingController::class, 'updateLocalFields']);
    Route::post('/bookings/{booking}/issue-confirm-link', [BookingController::class, 'issueConfirmationLink']);
    Route::get('/bookings/{booking}/magic-link', [BookingMagicLinkController::class, 'show']);
    Route::post('/bookings/{booking}/magic-link', [BookingMagicLinkController::class, 'submit']);

    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{booking}/messages', [ChatController::class, 'messages']);
    Route::post('/chats/{booking}/messages', [ChatController::class, 'sendMessage']);

    Route::apiResource('chat-templates', ChatTemplateController::class)->only([
        'index',
        'store',
        'update',
        'destroy',
    ]);

    Route::post('/webhooks/whatsapp', [WebhookController::class, 'whatsapp']);
});
