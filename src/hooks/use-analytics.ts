import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";

interface BreakdownItem {
  total: number;
}

interface StatusBreakdownItem extends BreakdownItem {
  status: string;
}

interface SourceBreakdownItem extends BreakdownItem {
  source: string;
}

interface TagBreakdownItem extends BreakdownItem {
  tag: string;
}

interface AnalyticsOverviewApi {
  total_customers: number;
  total_bookings: number;
  confirmed_rate: number;
  attention_rate: number;
  repeat_customer_rate: number;
  status_breakdown: StatusBreakdownItem[];
  source_breakdown: SourceBreakdownItem[];
  top_tags: TagBreakdownItem[];
}

interface AnalyticsTrendPoint {
  label: string;
  confirmed_rate: number;
  attention_rate: number;
  avg_response_minutes: number;
  volume: number;
}

interface AnalyticsTrendsApi {
  period: "weekly" | "monthly";
  trend: AnalyticsTrendPoint[];
  funnel: {
    standby_now: number;
    standby_to_confirmed: number;
    conversion_rate: number;
  };
}

interface LaravelItemResponse<T> {
  data: T;
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const payload = await apiGet<LaravelItemResponse<AnalyticsOverviewApi>>("/analytics/overview");
      return payload.data;
    },
  });
}

export function useAnalyticsTrends(period: "weekly" | "monthly") {
  return useQuery({
    queryKey: ["analytics-trends", period],
    queryFn: async () => {
      const payload = await apiGet<LaravelItemResponse<AnalyticsTrendsApi>>(`/analytics/trends?period=${period}`);
      return payload.data;
    },
  });
}
