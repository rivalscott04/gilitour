<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private readonly AnalyticsService $analyticsService)
    {
    }

    public function overview()
    {
        return response()->json([
            'data' => $this->analyticsService->overview(),
        ]);
    }

    public function trends(Request $request)
    {
        $period = $request->query('period', 'weekly');
        if (! in_array($period, ['weekly', 'monthly'], true)) {
            $period = 'weekly';
        }

        return response()->json([
            'data' => $this->analyticsService->trends($period),
        ]);
    }

    public function exportCsv()
    {
        return $this->analyticsService->exportBookingsCsv();
    }
}
