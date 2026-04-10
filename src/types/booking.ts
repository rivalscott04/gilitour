export type BookingStatus = "standby" | "confirmed" | "pending" | "cancelled";

/** Bookings that still need guest confirmation / ops follow-up (DB: standby or pending). */
export function isAwaitingConfirmation(status: BookingStatus): boolean {
  return status === "standby" || status === "pending";
}

export interface Booking {
  id: string;
  tourName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  time: string;
  location: string;
  guideName: string;
  status: BookingStatus;
  participants: number;
  notes: string;
  confirmUrl: string | null;
  customerResponse: "confirmed" | "cancelled" | "reschedule_requested" | null;
  customerRespondedAt: string | null;
  internalNotes: string;
  assignedToName: string;
  tags: string[];
  needsAttention: boolean;
}
