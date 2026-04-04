import type { ComponentType } from "react";
import { BarChart3, Repeat, Siren, CheckCircle2, Users, ClipboardList, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalyticsOverview, useAnalyticsTrends } from "@/hooks/use-analytics";
import { PageHeader } from "@/components/layout";
import { EmptyState, ErrorState, LoadingCardGrid } from "@/components/states";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api-client";
import { DASHBOARD_BASE } from "@/lib/routes";
import { CartesianGrid, Line, LineChart, Bar, BarChart, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

function KpiCard({
  title,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "neutral" | "primary" | "secondary" | "success";
}) {
  const toneClass = {
    neutral: "bg-card border-border",
    primary: "bg-primary/5 border-primary/30",
    secondary: "bg-secondary/5 border-secondary/30",
    success: "bg-success/5 border-success/30",
  }[tone];

  return (
    <div className={cn("rounded-xl card-shadow border p-5", toneClass)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-3xl font-semibold mt-2 tracking-tight">{value}</p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  percent,
  tone = "primary",
}: {
  label: string;
  value: number;
  percent: number;
  tone?: "primary" | "secondary" | "success" | "warning";
}) {
  const toneClass = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", toneClass)} style={{ width: `${Math.max(5, percent)}%` }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly");
  const { data, isLoading, isError, refetch, isFetching } = useAnalyticsOverview();
  const { data: trendData, isLoading: trendLoading } = useAnalyticsTrends(period);

  if (isLoading) {
    return <LoadingCardGrid count={4} className="grid-cols-2 lg:grid-cols-4" />;
  }

  if (isError || !data) {
    return <ErrorState title="Failed to load analytics" onRetry={() => refetch()} />;
  }

  const statusTotal = data.status_breakdown.reduce((sum, item) => sum + item.total, 0) || 1;
  const sourceTotal = data.source_breakdown.reduce((sum, item) => sum + item.total, 0) || 1;
  const attentionLevel =
    data.attention_rate >= 30 ? "high" : data.attention_rate >= 15 ? "medium" : "healthy";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Detailed booking intelligence for daily operational decisions."
        meta={`Live overview · ${data.total_bookings} total bookings tracked`}
        action={
          <Button asChild>
            <a href={`${API_BASE_URL}/analytics/export/bookings.csv`} target="_blank" rel="noreferrer">
              Export CSV
            </a>
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Customers" value={String(data.total_customers)} icon={Users} tone="secondary" />
        <KpiCard title="Total Bookings" value={String(data.total_bookings)} icon={ClipboardList} tone="primary" />
        <KpiCard title="Confirmed Rate" value={`${data.confirmed_rate}%`} icon={CheckCircle2} tone="success" />
        <KpiCard title="Repeat Customer Rate" value={`${data.repeat_customer_rate}%`} icon={Repeat} tone="neutral" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl card-shadow border border-border p-5">
          <h2 className="font-semibold mb-3">Status Breakdown</h2>
          <div className="space-y-3">
            {data.status_breakdown.map((item) => (
              <DetailRow
                key={item.status}
                label={item.status}
                value={item.total}
                percent={(item.total / statusTotal) * 100}
                tone={
                  item.status === "confirmed"
                    ? "success"
                    : item.status === "pending"
                      ? "warning"
                      : "secondary"
                }
              />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl card-shadow border border-border p-5">
          <h2 className="font-semibold mb-3">Customer Sources</h2>
          <div className="space-y-3">
            {data.source_breakdown.map((item) => (
              <DetailRow
                key={item.source}
                label={item.source}
                value={item.total}
                percent={(item.total / sourceTotal) * 100}
                tone="primary"
              />
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl card-shadow border border-border p-5">
          <h2 className="font-semibold mb-3">Top Operational Tags</h2>
          <div className="flex flex-wrap gap-2">
            {data.top_tags.length === 0 ? (
              <EmptyState title="No tags yet." layout="compact" />
            ) : (
              data.top_tags.map((item) => (
                <Badge key={item.tag} variant="outline">
                  #{item.tag} ({item.total})
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl card-shadow border border-border p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Attention Rate</p>
              <p className="text-sm text-muted-foreground mt-1">
                Percentage of bookings currently flagged for manual follow-up.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning font-semibold">
              <Siren className="h-4 w-4" />
              {data.attention_rate}%
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted mt-4 overflow-hidden">
            <div className="h-full rounded-full bg-warning" style={{ width: `${Math.max(5, data.attention_rate)}%` }} />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 card-shadow">
          <p className="font-semibold">Operational Focus</p>
          <p className="text-sm text-muted-foreground mt-1">
            {attentionLevel === "high" && "High follow-up volume detected. Prioritize pending confirmations today."}
            {attentionLevel === "medium" &&
              "Moderate follow-up load. Keep reminders and confirmation checks running on schedule."}
            {attentionLevel === "healthy" && "Attention load is healthy. Focus on improving repeat customer experience."}
          </p>
          <Button className="mt-4 gap-2" onClick={() => navigate(`${DASHBOARD_BASE}/bookings?needs_attention=1`)}>
            Review high-priority bookings
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 card-shadow space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold">Trend Explorer</p>
          <div className="flex gap-1.5">
            <Button
              variant={period === "weekly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("weekly")}
            >
              Weekly
            </Button>
            <Button
              variant={period === "monthly" ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </Button>
          </div>
        </div>

        {trendLoading || !trendData ? (
          <LoadingCardGrid count={2} className="grid-cols-1 lg:grid-cols-2" />
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground mb-3">Confirmed vs Attention Rate (%)</p>
              <ChartContainer
                className="h-[260px] w-full"
                config={{
                  confirmed_rate: { label: "Confirmed Rate", color: "hsl(var(--success))" },
                  attention_rate: { label: "Attention Rate", color: "hsl(var(--warning))" },
                }}
              >
                <LineChart data={trendData.trend}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="confirmed_rate" stroke="var(--color-confirmed_rate)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="attention_rate" stroke="var(--color-attention_rate)" strokeWidth={2} dot={false} />
                </LineChart>
              </ChartContainer>
            </div>

            <div className="rounded-lg border border-border p-3">
              <p className="text-sm text-muted-foreground mb-3">Avg First Response Time (minutes)</p>
              <ChartContainer
                className="h-[260px] w-full"
                config={{
                  avg_response_minutes: { label: "Avg Response", color: "hsl(var(--primary))" },
                }}
              >
                <BarChart data={trendData.trend}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg_response_minutes" fill="var(--color-avg_response_minutes)" radius={4} />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </div>

      {trendData && (
        <div className="grid lg:grid-cols-3 gap-4">
          <KpiCard title="Standby Now" value={String(trendData.funnel.standby_now)} icon={ClipboardList} />
          <KpiCard title="Standby -> Confirmed" value={String(trendData.funnel.standby_to_confirmed)} icon={ArrowRight} />
          <KpiCard title="Funnel Conversion" value={`${trendData.funnel.conversion_rate}%`} icon={Repeat} tone="success" />
        </div>
      )}

      {isFetching && <p className="text-sm text-muted-foreground">Refreshing analytics...</p>}
    </div>
  );
}
