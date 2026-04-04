export type MagicLinkView = "form" | "done" | "closed";

export interface MagicLinkData {
  view: MagicLinkView;
  tour_name: string;
  customer_name: string;
  status?: string;
  tour_start_at?: string | null;
  customer_response?: "confirmed" | "cancelled" | "reschedule_requested";
  closed_reason?: string | null;
}
