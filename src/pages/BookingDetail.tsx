import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, User, Phone, Mail, MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { chatTemplates, evaluateTemplate } from "@/data/templates";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBooking, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { EmptyState, ErrorState } from "@/components/states";
import { RefreshHint } from "@/components/feedback/RefreshHint";
import { PageHeader } from "@/components/layout";

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, refetch, isFetching } = useBooking(id);
  const updateStatusMutation = useUpdateBookingStatus();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 py-4">
        <div className="rounded-xl border border-border p-6 animate-pulse bg-card">
          <div className="h-5 w-40 bg-muted rounded mb-3" />
          <div className="h-3 w-56 bg-muted rounded" />
        </div>
        <div className="rounded-xl border border-border p-6 animate-pulse bg-card">
          <div className="h-4 w-28 bg-muted rounded mb-4" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-muted rounded" />
            <div className="h-3 w-2/3 bg-muted rounded" />
            <div className="h-3 w-1/2 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-16 space-y-4">
        <ErrorState title="Failed to load booking" onRetry={() => refetch()} />
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/bookings")}>
          Back to bookings
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16">
        <EmptyState title="Booking not found" />
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/bookings")}>
          Back to bookings
        </Button>
      </div>
    );
  }

  const tourDate = new Date(booking.date);
  const isUpcoming = tourDate.getTime() > Date.now() && booking.status !== "cancelled";

  const details = [
    { icon: Calendar, label: "Date & Time", value: `${format(tourDate, "MMM d, yyyy")} at ${booking.time}` },
    { icon: MapPin, label: "Location", value: booking.location },
    { icon: User, label: "Guide", value: booking.guideName },
    { icon: Users, label: "Participants", value: `${booking.participants} guest${booking.participants > 1 ? "s" : ""}` },
    { icon: Phone, label: "Phone", value: booking.customerPhone },
    { icon: Mail, label: "Email", value: booking.customerEmail },
  ];

  const handleConfirmBooking = () => {
    if (booking && booking.status === "pending") {
      updateStatusMutation.mutate(
        {
          id: booking.id,
          status: "confirmed",
        },
        {
          onSuccess: () => {
            toast.success("Booking confirmed successfully");
          },
          onError: () => {
            toast.error("Failed to confirm booking");
          },
        },
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-card rounded-xl card-shadow border border-border p-6">
        <PageHeader
          title={booking.tourName}
          meta={`Booking ${booking.id} · ${booking.customerName}`}
          action={<StatusBadge status={booking.status} />}
          size="section"
          className="mb-1"
        />

        {/* Countdown */}
        {isUpcoming && (
          <div className="mt-6 p-4 rounded-xl bg-background-subtle text-center">
            <p className="text-sm text-muted-foreground mb-2">Your tour starts in</p>
            <CountdownTimer targetDate={booking.date} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="bg-card rounded-xl card-shadow border border-border p-6">
        <h2 className="font-semibold mb-4">Tour Details</h2>
        <div className="space-y-4">
          {details.map((d) => (
            <div key={d.label} className="flex items-start gap-3">
              <d.icon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-muted-foreground">{d.label}</p>
                <p className="text-sm font-medium">{d.value}</p>
              </div>
            </div>
          ))}
        </div>

        {booking.notes && (
          <div className="mt-6 p-3 rounded-lg bg-background-subtle">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button className="flex-1 gap-2" onClick={() => window.open(`https://wa.me/1234567890?text=Hi, regarding my booking ${booking.id}...`, '_blank')}>
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </Button>
        {booking.status === "pending" ? (
          <Button 
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white" 
            onClick={handleConfirmBooking}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4" />
            {updateStatusMutation.isPending ? "Confirming..." : "Confirm Booking"}
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              const text = evaluateTemplate(chatTemplates[0].content, {
                customerName: booking.customerName,
                tourName: booking.tourName
              });
              window.open(`https://wa.me/${booking.customerPhone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
            }}
          >
            Send reminder
          </Button>
        )}
      </div>

      <RefreshHint active={isFetching} message="Refreshing booking data..." />
    </div>
  );
}
