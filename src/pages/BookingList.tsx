import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { BookingCard } from "@/components/BookingCard";
import { Input } from "@/components/ui/input";
import { AssigneeSuggestInput } from "@/components/AssigneeSuggestInput";
import { useBookings, useUpdateBookingLocalFields } from "@/hooks/use-bookings";
import type { BookingStatus } from "@/types/booking";
import { EmptyState, ErrorState, LoadingCardGrid } from "@/components/states";
import { RefreshHint } from "@/components/feedback/RefreshHint";
import { PageHeader } from "@/components/layout";
import type { Booking } from "@/types/booking";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/lib/island-toast-api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const filters = ["all", "confirmed", "pending", "cancelled"] as const;
const ITEMS_PER_PAGE = 4;

export default function BookingList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>(
    (searchParams.get("status") as (typeof filters)[number]) || "all",
  );
  const [attentionOnly, setAttentionOnly] = useState(searchParams.get("needs_attention") === "1");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [needsAttention, setNeedsAttention] = useState(false);
  const updateLocalFieldsMutation = useUpdateBookingLocalFields();
  const { data: bookings = [], isLoading, isError, refetch, isFetching } = useBookings({
    search: search.trim() || undefined,
    status: activeFilter as BookingStatus | "all",
  });

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.tourName.toLowerCase().includes(search.toLowerCase()) ||
        b.customerName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === "all" || b.status === activeFilter;
      const matchAttention = !attentionOnly || b.needsAttention;
      return matchSearch && matchFilter && matchAttention;
    });
  }, [bookings, search, activeFilter, attentionOnly]);

  // Reset to page 1 if filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter, attentionOnly]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeFilter !== "all") next.set("status", activeFilter);
    else next.delete("status");

    if (attentionOnly) next.set("needs_attention", "1");
    else next.delete("needs_attention");

    setSearchParams(next, { replace: true });
  }, [activeFilter, attentionOnly, searchParams, setSearchParams]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedBookings = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const needsAttentionCount = useMemo(
    () => bookings.filter((booking) => booking.needsAttention).length,
    [bookings],
  );

  const openManageGuide = (booking: Booking) => {
    setSelectedBooking(booking);
    setInternalNotes(booking.internalNotes);
    setAssignedToName(booking.assignedToName);
    setTagsInput(booking.tags.join(", "));
    setNeedsAttention(booking.needsAttention);
  };

  const handleSaveGuide = () => {
    if (!selectedBooking) return;
    const tags = tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean);
    updateLocalFieldsMutation.mutate(
      {
        id: selectedBooking.id,
        internalNotes,
        assignedToName,
        tags,
        needsAttention,
      },
      {
        onSuccess: () => {
          toast.success("Guide fields saved");
          setSelectedBooking(null);
        },
        onError: () => toast.error("Failed to save guide fields"),
      },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description="Manage all tour bookings"
        meta={`${bookings.length} total bookings · ${needsAttentionCount} need attention`}
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tour or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2 sm:mt-0">
          <button
            onClick={() => setAttentionOnly((prev) => !prev)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              attentionOnly
                ? "bg-warning text-warning-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Needs Attention
          </button>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                activeFilter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingCardGrid count={ITEMS_PER_PAGE} />
      ) : isError ? (
        <ErrorState
          title="Failed to load bookings"
          description="Check API connection and try again."
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState title="No bookings found" description="Try adjusting your search or filter." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {paginatedBookings.map((b) => (
              <BookingCard key={b.id} booking={b} onManageGuide={openManageGuide} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(p => p - 1);
                      }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        isActive={currentPage === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages) setCurrentPage(p => p + 1);
                      }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
      <RefreshHint active={isFetching && !isLoading} message="Refreshing list..." />

      <Dialog open={Boolean(selectedBooking)} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guide</DialogTitle>
            <DialogDescription>
              Edit local guide fields without changing scraped source data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Assigned To</p>
              <AssigneeSuggestInput
                value={assignedToName}
                onChange={setAssignedToName}
                enabled={Boolean(selectedBooking)}
                disabled={updateLocalFieldsMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Suggestions come from assignee names already used on your bookings. You can still type a new name.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tags (comma-separated)</p>
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Internal Notes</p>
              <Textarea rows={4} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Needs Attention</p>
                <p className="text-sm text-muted-foreground">Mark this booking for manual follow-up.</p>
              </div>
              <Switch checked={needsAttention} onCheckedChange={setNeedsAttention} />
            </div>

            <Button onClick={handleSaveGuide} disabled={updateLocalFieldsMutation.isPending}>
              {updateLocalFieldsMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
