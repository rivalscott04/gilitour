import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api-client";
import {
  type BookingApiItem,
  type LaravelItemResponse,
  type LaravelListResponse,
  toBooking,
} from "@/lib/booking-adapter";
import type { Booking, BookingStatus } from "@/types/booking";

interface UseBookingsParams {
  search?: string;
  /** Single status, or comma-separated list (e.g. `standby,pending`) supported by the API. */
  status?: BookingStatus | "all" | "standby,pending";
}

export function useAssigneeSuggestions(query: string, enabled: boolean) {
  const params = new URLSearchParams();
  const trimmed = query.trim();
  if (trimmed) {
    params.set("q", trimmed);
  }

  const qs = params.toString();
  const path = qs ? `/bookings/assignees?${qs}` : "/bookings/assignees";

  return useQuery({
    queryKey: ["bookings", "assignees", qs],
    queryFn: async () => {
      const payload = await apiGet<{ data: string[] }>(path);
      return payload.data;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useBookings(params: UseBookingsParams = {}) {
  const queryParams = new URLSearchParams();

  if (params.search) queryParams.set("search", params.search);
  if (params.status && params.status !== "all") queryParams.set("status", params.status);
  queryParams.set("per_page", "100");

  const query = queryParams.toString();

  return useQuery({
    queryKey: ["bookings", query],
    queryFn: async () => {
      const payload = await apiGet<LaravelListResponse<BookingApiItem>>(`/bookings?${query}`);
      return payload.data.map(toBooking);
    },
  });
}

export function useBooking(id?: string) {
  return useQuery({
    queryKey: ["booking", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const payload = await apiGet<LaravelItemResponse<BookingApiItem>>(`/bookings/${id}`);
      return toBooking(payload.data);
    },
  });
}

interface IssueConfirmationLinkResponse {
  data: {
    booking_id: number | string;
    confirm_url: string;
  };
}

export function useIssueConfirmationLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const payload = await apiPost<IssueConfirmationLinkResponse>(`/bookings/${id}/issue-confirm-link`, {});
      return payload.data;
    },
    onSuccess: (data) => {
      const id = String(data.booking_id);
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BookingStatus }) => {
      const payload = await apiPatch<LaravelItemResponse<BookingApiItem>>(`/bookings/${id}/status`, {
        status,
      });
      return toBooking(payload.data);
    },
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(["booking", updatedBooking.id], updatedBooking);
      queryClient.setQueriesData<Booking[]>({ queryKey: ["bookings"] }, (current) => {
        if (!current) return current;
        return current.map((item) => (item.id === updatedBooking.id ? updatedBooking : item));
      });
    },
  });
}

interface UpdateBookingLocalFieldsPayload {
  id: string;
  internalNotes: string;
  assignedToName: string;
  tags: string[];
  needsAttention: boolean;
}

export function useUpdateBookingLocalFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      internalNotes,
      assignedToName,
      tags,
      needsAttention,
    }: UpdateBookingLocalFieldsPayload) => {
      const payload = await apiPatch<LaravelItemResponse<BookingApiItem>>(`/bookings/${id}/local-fields`, {
        internal_notes: internalNotes,
        assigned_to_name: assignedToName,
        tags,
        needs_attention: needsAttention,
      });
      return toBooking(payload.data);
    },
    onSuccess: (updatedBooking) => {
      queryClient.setQueryData(["booking", updatedBooking.id], updatedBooking);
      queryClient.setQueriesData<Booking[]>({ queryKey: ["bookings"] }, (current) => {
        if (!current) return current;
        return current.map((item) => (item.id === updatedBooking.id ? updatedBooking : item));
      });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assignees"] });
    },
  });
}
