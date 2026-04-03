import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types/booking";

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "bg-success/10 text-success" },
  pending: { label: "Pending", className: "bg-warning/10 text-warning" },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

const fallbackConfig = {
  label: "Pending review",
  className: "bg-warning/10 text-warning",
};

export function StatusBadge({ status }: { status: BookingStatus | string | null | undefined }) {
  const config = status ? statusConfig[status as BookingStatus] ?? fallbackConfig : fallbackConfig;
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-sm font-medium", config.className)}>
      {config.label}
    </span>
  );
}
