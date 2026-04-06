import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Users, User, Phone, Mail, MessageCircle, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { chatTemplates, evaluateTemplate } from "@/data/templates";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/island-toast-api";
import { useBooking, useIssueConfirmationLink, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { EmptyState, ErrorState } from "@/components/states";
import { RefreshHint } from "@/components/feedback/RefreshHint";
import { PageHeader } from "@/components/layout";
import { digitsForWhatsApp } from "@/lib/utils";
import { DASHBOARD_BASE } from "@/lib/routes";

const WHATSAPP_PREFILL_MAX_LEN = 2000;

function clipWhatsAppPrefill(text: string): string {
  return text.length <= WHATSAPP_PREFILL_MAX_LEN ? text : text.slice(0, WHATSAPP_PREFILL_MAX_LEN);
}

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: booking, isLoading, isError, refetch, isFetching } = useBooking(id);
  const updateStatusMutation = useUpdateBookingStatus();
  const issueConfirmationMutation = useIssueConfirmationLink();

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
        <Button variant="ghost" className="mt-4" onClick={() => navigate(`${DASHBOARD_BASE}/bookings`)}>
          Back to bookings
        </Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16">
        <EmptyState title="Booking not found" />
        <Button variant="ghost" className="mt-4" onClick={() => navigate(`${DASHBOARD_BASE}/bookings`)}>
          Back to bookings
        </Button>
      </div>
    );
  }

  const tourDate = new Date(booking.date);
  const isUpcoming = tourDate.getTime() > Date.now() && booking.status !== "cancelled";
  const waDigits = digitsForWhatsApp(booking.customerPhone);
  const canWhatsApp = waDigits.length > 0;

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
            toast.success("Marked as attending");
          },
          onError: () => {
            toast.error("Could not update status");
          },
        },
      );
    }
  };

  const handleSendConfirmationWhatsApp = async () => {
    if (!booking || booking.status !== "pending") return;

    const digits = digitsForWhatsApp(booking.customerPhone);
    if (!digits) {
      toast.error("Add a customer phone number before sending WhatsApp.");
      return;
    }

    try {
      let confirmUrl = booking.confirmUrl;
      if (!confirmUrl) {
        const data = await issueConfirmationMutation.mutateAsync(booking.id);
        confirmUrl = data.confirm_url;
      }

      const text = [
        `Hi ${booking.customerName},`,
        "",
        `Quick reminder about your tour "${booking.tourName}" — you’re already booked (e.g. via GetYourGuide).`,
        "Please tap the link and let us know if you’re still joining us, if you need another time, or if you can’t make it:",
        confirmUrl,
        "",
        "Thank you!",
      ].join("\n");

      window.open(
        `https://wa.me/${digits}?text=${encodeURIComponent(clipWhatsAppPrefill(text))}`,
        "_blank",
      );
    } catch {
      toast.error("Could not create reminder link. Try again.");
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

        {booking.customerResponse && (
          <div className="mt-6 p-3 rounded-lg border border-border bg-background-subtle">
            <p className="text-sm text-muted-foreground mb-1">Guest reply (reminder link)</p>
            <p className="text-sm font-medium">
              {booking.customerResponse === "confirmed" && "Still joining — noted via link"}
              {booking.customerResponse === "cancelled" && "Can’t make it — noted via link"}
              {booking.customerResponse === "reschedule_requested" &&
                "Needs new time / running late — noted via link"}
            </p>
            {booking.customerRespondedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(booking.customerRespondedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            )}
          </div>
        )}

        {booking.notes && (
          <div className="mt-6 p-3 rounded-lg bg-background-subtle">
            <p className="text-sm text-muted-foreground mb-1">Notes</p>
            <p className="text-sm">{booking.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 gap-2"
            disabled={!canWhatsApp}
            title={canWhatsApp ? undefined : "No phone number on file"}
            onClick={() => {
              if (!canWhatsApp) return;
              const text = `Hi ${booking.customerName}, this is about your booking for "${booking.tourName}" (ref ${booking.id}).`;
              window.open(
                `https://wa.me/${waDigits}?text=${encodeURIComponent(clipWhatsAppPrefill(text))}`,
                "_blank",
              );
            }}
          >
            <MessageCircle className="h-4 w-4" />
            Chat on WhatsApp
          </Button>
          {booking.status === "pending" ? (
            <Button
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => void handleSendConfirmationWhatsApp()}
              disabled={!canWhatsApp || issueConfirmationMutation.isPending}
            >
              <MessageCircle className="h-4 w-4" />
              {issueConfirmationMutation.isPending ? "Preparing link…" : "Send reminder link"}
            </Button>
          ) : (
            <Button
              variant="outline"
              className="flex-1"
              disabled={!canWhatsApp}
              onClick={() => {
                if (!canWhatsApp) return;
                const text = evaluateTemplate(chatTemplates[0].content, {
                  customerName: booking.customerName,
                  tourName: booking.tourName,
                });
                window.open(
                  `https://wa.me/${waDigits}?text=${encodeURIComponent(clipWhatsAppPrefill(text))}`,
                  "_blank",
                );
              }}
            >
              Send reminder
            </Button>
          )}
        </div>
        {booking.status === "pending" && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={handleConfirmBooking}
            disabled={updateStatusMutation.isPending}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {updateStatusMutation.isPending ? "Saving…" : "Mark as attending manually (dashboard)"}
          </Button>
        )}
      </div>

      <RefreshHint active={isFetching} message="Refreshing booking data..." />
    </div>
  );
}
