import { MapPin, Users, MessageCircle, ChevronRight, AlertTriangle, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { Booking } from "@/types/booking";
import { StatusBadge } from "./StatusBadge";
import { CountdownTimer } from "./CountdownTimer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_BASE } from "@/lib/routes";

export function BookingCard({
  booking,
  onManageGuide,
}: {
  booking: Booking;
  onManageGuide?: (booking: Booking) => void;
}) {
  const navigate = useNavigate();
  const tourDate = new Date(booking.date);
  const isUpcoming = tourDate.getTime() > Date.now();

  return (
    <div className="bg-card rounded-xl card-shadow p-4 sm:p-6 transition-shadow duration-200 hover:card-shadow-hover border border-border">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-base truncate">{booking.tourName}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(tourDate, "MMM d, yyyy")} · {booking.time} · ID {booking.id}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {(booking.needsAttention || booking.assignedToName || booking.tags.length > 0) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {booking.needsAttention && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Needs attention
            </Badge>
          )}
          {booking.assignedToName && (
            <Badge variant="secondary" className="gap-1">
              <UserRound className="h-3 w-3" />
              {booking.assignedToName}
            </Badge>
          )}
          {booking.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
        <span className="flex items-center gap-1 min-w-0 max-w-full">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{booking.location}</span>
        </span>
        <span className="flex items-center gap-1 shrink-0">
          <Users className="h-3.5 w-3.5 shrink-0" /> {booking.participants}
        </span>
      </div>

      {isUpcoming && booking.status !== "cancelled" && (
        <div className="mb-4 p-3 rounded-lg bg-background-subtle">
          <p className="text-sm text-muted-foreground mb-1">Starts in</p>
          <CountdownTimer targetDate={booking.date} compact />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => navigate(`${DASHBOARD_BASE}/chat/${booking.id}`)}
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </Button>
        {onManageGuide && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onManageGuide(booking)}
          >
            Guide
          </Button>
        )}
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => navigate(`${DASHBOARD_BASE}/bookings/${booking.id}`)}
        >
          View details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
