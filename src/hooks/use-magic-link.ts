import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, ApiError } from "@/lib/api-client";
import type { MagicLinkData } from "@/types/magic-link";

export function useMagicLinkPreflight(bookingId: string | undefined, token: string | null) {
  return useQuery({
    queryKey: ["magic-link", bookingId, token],
    enabled: Boolean(bookingId && token),
    queryFn: async (): Promise<MagicLinkData> => {
      const qs = new URLSearchParams({ token: token! });
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/magic-link?${qs}`, {
        headers: { Accept: "application/json" },
      });
      const payload = (await res.json()) as { message?: string; data?: MagicLinkData };
      if (!res.ok) {
        throw new ApiError(payload.message ?? "Request failed", res.status);
      }
      if (!payload.data) {
        throw new ApiError("Invalid response", res.status);
      }
      return payload.data;
    },
  });
}

export function useMagicLinkSubmit(bookingId: string | undefined, token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (action: "confirm" | "cancel" | "reschedule"): Promise<MagicLinkData> => {
      const res = await fetch(`${API_BASE_URL}/bookings/${bookingId}/magic-link`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, action }),
      });
      const payload = (await res.json()) as { message?: string; data?: MagicLinkData };
      if (res.ok && payload.data) {
        return payload.data;
      }
      if (res.status === 422 && payload.data?.view === "done") {
        return payload.data;
      }
      throw new ApiError(payload.message ?? "Request failed", res.status);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["magic-link", bookingId, token], data);
    },
  });
}
