import { CalendarCheck, Clock, Users, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/button";
import { useBookings } from "@/hooks/use-bookings";
import { EmptyState, ErrorState, LoadingCardGrid } from "@/components/states";
import { PageHeader, PageSection } from "@/components/layout";
import { RefreshHint } from "@/components/feedback/RefreshHint";
import { DASHBOARD_BASE } from "@/lib/routes";

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: bookings = [], isLoading, isError, refetch, isFetching } = useBookings();

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) => new Date(b.date).getTime() > now && b.status !== "cancelled"
  );
  const urgent = upcoming.filter(
    (b) => new Date(b.date).getTime() - now < 1000 * 60 * 60 * 24
  );
  const totalGuests = upcoming.reduce((sum, b) => sum + b.participants, 0);
  const needsAttention = bookings.filter((b) => b.needsAttention).length;

  const statCards = [
    {
      label: "Needs Attention",
      value: needsAttention,
      icon: AlertTriangle,
      color: "text-warning",
      onClick: () => navigate(`${DASHBOARD_BASE}/bookings?needs_attention=1`),
      emphasized: true,
    },
    {
      label: "Total Bookings",
      value: bookings.length,
      icon: CalendarCheck,
      color: "text-primary",
      onClick: () => navigate(`${DASHBOARD_BASE}/bookings`),
      emphasized: false,
    },
    {
      label: "Upcoming Tours",
      value: upcoming.length,
      icon: Clock,
      color: "text-secondary",
      onClick: () => navigate(`${DASHBOARD_BASE}/bookings?status=confirmed`),
      emphasized: false,
    },
    {
      label: "Guests Expected",
      value: totalGuests,
      icon: Users,
      color: "text-primary",
      onClick: () => navigate(`${DASHBOARD_BASE}/bookings`),
      emphasized: false,
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome back"
        description="Here's what's happening with your tours today."
      />

      {isLoading && (
        <LoadingCardGrid count={4} className="grid-cols-2 lg:grid-cols-4" />
      )}

      {isError && (
        <ErrorState title="Failed to load dashboard data." onRetry={() => refetch()} />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <button
            key={stat.label}
            onClick={stat.onClick}
            className={`text-left bg-card rounded-xl card-shadow border p-4 transition-all hover:card-shadow-hover hover:-translate-y-0.5 ${
              stat.emphasized ? "border-warning/40" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-2xl font-semibold">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Urgent reminders */}
      {urgent.length > 0 && (
        <PageSection
          title="Starting soon"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate(`${DASHBOARD_BASE}/bookings`)}>
              View all
            </Button>
          }
        >
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {urgent.slice(0, 3).map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </PageSection>
      )}

      {/* Recent bookings */}
      <PageSection
        title="Recent bookings"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate(`${DASHBOARD_BASE}/bookings`)}>
            View all
          </Button>
        }
      >
        {bookings.length === 0 && !isLoading ? (
          <EmptyState title="No bookings available yet." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookings.slice(0, 6).map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </PageSection>
      <RefreshHint active={isFetching && !isLoading} />
    </div>
  );
}
