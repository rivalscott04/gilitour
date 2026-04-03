export type BookingStatus = "confirmed" | "pending" | "cancelled";

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
  internalNotes: string;
  assignedToName: string;
  tags: string[];
  needsAttention: boolean;
}
