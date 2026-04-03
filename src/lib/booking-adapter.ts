import type { Booking } from "@/types/booking";

export interface BookingApiItem {
  id: number | string;
  tour_name: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  tour_start_at: string | null;
  date: string | null;
  time: string | null;
  location: string;
  guide_name: string;
  status: Booking["status"];
  participants: number;
  notes: string | null;
  confirm_url: string | null;
  internal_notes: string | null;
  assigned_to_name: string | null;
  tags: string[] | null;
  needs_attention: boolean;
}

export interface LaravelListResponse<T> {
  data: T[];
}

export interface LaravelItemResponse<T> {
  data: T;
}

export function toBooking(item: BookingApiItem): Booking {
  return {
    id: String(item.id),
    tourName: item.tour_name,
    customerName: item.customer_name,
    customerEmail: item.customer_email,
    customerPhone: item.customer_phone,
    date: item.tour_start_at ?? item.date ?? new Date().toISOString(),
    time: item.time ?? "-",
    location: item.location,
    guideName: item.guide_name,
    status: item.status,
    participants: item.participants,
    notes: item.notes ?? "",
    confirmUrl: item.confirm_url,
    internalNotes: item.internal_notes ?? "",
    assignedToName: item.assigned_to_name ?? "",
    tags: item.tags ?? [],
    needsAttention: item.needs_attention ?? false,
  };
}
