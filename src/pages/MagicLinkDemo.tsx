import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RefreshCw, Copy, CheckCircle2, ChevronsUpDown, Check, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useBooking, useBookings, useIssueConfirmationLink } from "@/hooks/use-bookings";
import { toast } from "@/lib/island-toast-api";
import type { Booking } from "@/types/booking";
import { StatusBadge } from "@/components/StatusBadge";

function prettyResponse(response: "confirmed" | "cancelled" | "reschedule_requested" | null): string {
  if (!response) return "-";
  if (response === "confirmed") return "Confirmed (Yes, I'm coming)";
  if (response === "cancelled") return "Cancelled (I can't make it)";
  return "Reschedule requested";
}

export default function MagicLinkDemo() {
  const [manualId, setManualId] = useState("");
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [whatsappDialogOpen, setWhatsappDialogOpen] = useState(false);
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const { data: bookings = [], isLoading: listLoading, isError: listError, refetch: refetchList } = useBookings({
    status: "pending",
  });

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bookings]);

  const selectedFromList = useMemo(
    () => sortedBookings.find((b) => b.id === activeBookingId),
    [sortedBookings, activeBookingId],
  );

  const issueConfirmationMutation = useIssueConfirmationLink();
  const { data: booking, isLoading, isError, refetch, isFetching } = useBooking(activeBookingId ?? undefined);

  const canGenerate = useMemo(() => Boolean(activeBookingId), [activeBookingId]);
  const linkLabel = selectedFromList?.tourName ?? booking?.tourName ?? "your booking";
  const recipientName = selectedFromList?.customerName ?? booking?.customerName ?? "there";

  const buildWhatsappMessage = (confirmUrl: string) =>
    `Hi ${recipientName},\n\nPlease confirm your attendance for ${linkLabel} by opening this magic link:\n${confirmUrl}\n\nThank you.`;

  useEffect(() => {
    if (!autoRefresh || !activeBookingId) return;
    const timer = window.setInterval(() => {
      void refetch();
    }, 3000);
    return () => window.clearInterval(timer);
  }, [autoRefresh, activeBookingId, refetch]);

  const selectBooking = (b: Booking) => {
    setActiveBookingId(b.id);
    setGeneratedLink(null);
    setPickerOpen(false);
  };

  const handleLoadManualId = () => {
    const id = manualId.trim();
    if (!id) {
      toast.error("Please enter a booking ID.");
      return;
    }
    setActiveBookingId(id);
    setGeneratedLink(null);
  };

  const handleGenerateLink = async () => {
    if (!activeBookingId) return;
    try {
      const data = await issueConfirmationMutation.mutateAsync(activeBookingId);
      setGeneratedLink(data.confirm_url);
      setWhatsappMessage(buildWhatsappMessage(data.confirm_url));
      toast.success("Magic link generated successfully.");
    } catch {
      toast.error("Failed to generate magic link.");
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success("Link copied.");
    } catch {
      toast.error("Clipboard failed. Please copy the link manually.");
    }
  };

  const sanitizeWhatsappNumber = (raw: string) => raw.replace(/\D/g, "");

  const handleOpenWhatsappDialog = () => {
    if (!generatedLink) return;
    setWhatsappPhone("");
    setWhatsappMessage((prev) => prev || buildWhatsappMessage(generatedLink));
    setWhatsappDialogOpen(true);
  };

  const handleSendToWhatsapp = () => {
    if (!generatedLink) return;
    const phone = sanitizeWhatsappNumber(whatsappPhone);
    if (!phone) {
      toast.error("Please enter a valid WhatsApp number.");
      return;
    }
    if (!whatsappMessage.includes(generatedLink)) {
      toast.error("Please include the magic link in the WhatsApp message.");
      return;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setWhatsappDialogOpen(false);
    toast.success("WhatsApp message is ready to send.");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Magic Link Demo</CardTitle>
          <CardDescription>
            Admin demo page to generate a test magic link and verify whether confirmation from that link is recorded
            in the system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Pick a booking</p>
            <p className="text-sm text-muted-foreground">
              Open the picker to search by booking ID, guest, tour, location, or status.               With an empty search, pending bookings only (up to 100) are shown. Choosing a row closes the picker.
            </p>
            {listError ? (
              <p className="text-sm text-destructive">Could not load bookings. Check your connection and try again.</p>
            ) : listLoading ? (
              <p className="text-sm text-muted-foreground">Loading bookings…</p>
            ) : (
              <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={pickerOpen}
                    className="h-auto min-h-11 w-full justify-between gap-2 py-2 font-normal text-left"
                  >
                    <div className="min-w-0 flex-1 truncate text-left">
                      {selectedFromList ? (
                        <div className="space-y-0.5">
                          <p className="truncate font-medium text-foreground">{selectedFromList.tourName}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {selectedFromList.customerName} ·{" "}
                            {format(new Date(selectedFromList.date), "MMM d, yyyy")} · ID {selectedFromList.id}
                          </p>
                        </div>
                      ) : activeBookingId ? (
                        <div className="space-y-0.5">
                          <p className="font-mono font-medium text-foreground">ID {activeBookingId}</p>
                          <p className="text-xs text-muted-foreground">Loaded manually — open to pick from list</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Select a booking…</span>
                      )}
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] max-w-[min(100vw-2rem,42rem)] p-0"
                  align="start"
                >
                  <Command className="rounded-md border-0 bg-popover shadow-none">
                    <CommandInput placeholder="Search by ID, guest, tour, location…" />
                    <CommandList>
                      <CommandEmpty>No bookings match your search.</CommandEmpty>
                      <CommandGroup heading="Bookings">
                        {sortedBookings.map((b) => (
                          <CommandItem
                            key={b.id}
                            value={`${b.id} ${b.customerName} ${b.tourName} ${b.location} ${b.status}`}
                            onSelect={() => selectBooking(b)}
                            className="flex cursor-pointer flex-col items-stretch gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="truncate font-medium text-foreground">{b.tourName}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {b.customerName} · {format(new Date(b.date), "MMM d, yyyy")} · ID {b.id}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                              <StatusBadge status={b.status} />
                              {b.id === activeBookingId ? (
                                <Check className="h-4 w-4 text-primary" aria-hidden />
                              ) : null}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div className="space-y-2 rounded-lg border border-border bg-background-subtle p-3">
            <p className="text-sm font-medium">Or load by ID</p>
            <p className="text-xs text-muted-foreground">
              Use this if the booking is not in the list above (e.g. beyond the first page of results).
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Booking ID"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLoadManualId();
                }}
              />
              <Button type="button" variant="secondary" onClick={handleLoadManualId}>
                Load
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background-subtle p-3 text-sm space-y-1">
            <p className="font-medium">Demo flow:</p>
            <p>1) Pick a booking - 2) Generate magic link - 3) Open link - 4) Click "Yes, I&apos;m coming"</p>
            <p>5) Return to this page and refresh status to verify the system update.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void handleGenerateLink()} disabled={!canGenerate || issueConfirmationMutation.isPending}>
              {issueConfirmationMutation.isPending ? "Generating..." : "Generate Magic Link"}
            </Button>
            <Button
              variant="outline"
              onClick={() => void refetch()}
              disabled={!activeBookingId || isFetching}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void refetchList()}
              disabled={listLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${listLoading ? "animate-spin" : ""}`} />
              Refresh List
            </Button>
            <Button
              type="button"
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh((v) => !v)}
              disabled={!activeBookingId}
            >
              {autoRefresh ? "Auto refresh: ON" : "Auto refresh: OFF"}
            </Button>
          </div>

          {generatedLink && (
            <div className="space-y-2 rounded-lg border border-border p-3">
              <p className="text-sm font-medium">Generated link</p>
              <Input value={generatedLink} readOnly />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => void handleCopyLink()} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleOpenWhatsappDialog}>
                  <MessageCircle className="h-4 w-4" />
                  Send to WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(generatedLink, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open link
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={whatsappDialogOpen} onOpenChange={setWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send magic link to WhatsApp</DialogTitle>
            <DialogDescription>
              Enter destination phone number, review the message, then confirm to open WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Destination number</p>
              <Input
                value={whatsappPhone}
                onChange={(e) => setWhatsappPhone(e.target.value)}
                placeholder="e.g. 6281234567890"
              />
              <p className="text-xs text-muted-foreground">
                Use country code format. Any spaces or symbols will be removed automatically.
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Message preview</p>
              <textarea
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                className="min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Keep the magic link in the message so recipient can open and confirm.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWhatsappDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendToWhatsapp}>Confirm & Open WhatsApp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {activeBookingId && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Status Monitor</CardTitle>
            <CardDescription>Verify that the response from the magic link is recorded on the booking.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading booking...</p>
            ) : isError || !booking ? (
              <p className="text-sm text-destructive">Booking not found or failed to load.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Booking ID:</span> {booking.id}</p>
                <p><span className="font-medium">Guest:</span> {booking.customerName}</p>
                <p><span className="font-medium">Tour:</span> {booking.tourName}</p>
                <p><span className="font-medium">Booking status:</span> {booking.status}</p>
                <p><span className="font-medium">Customer response:</span> {prettyResponse(booking.customerResponse)}</p>
                <p>
                  <span className="font-medium">Responded at:</span>{" "}
                  {booking.customerRespondedAt ? format(new Date(booking.customerRespondedAt), "MMM d, yyyy HH:mm:ss") : "-"}
                </p>

                {booking.customerResponse === "confirmed" && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-green-800">
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmation from the magic link is recorded in the system.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
