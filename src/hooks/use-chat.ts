import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api-client";
import type { ChatMessage, ChatThread } from "@/types/chat";

interface ChatThreadApiItem {
  booking_id: number | string;
  customer_name: string;
  tour_name: string;
  last_message: string;
  last_message_at: string | null;
}

interface ChatMessageApiItem {
  id: number | string;
  booking_id: number | string;
  sender: ChatMessage["sender"];
  message: string;
  source: ChatMessage["source"];
  timestamp: string;
}

interface LaravelListResponse<T> {
  data: T[];
}

interface LaravelItemResponse<T> {
  data: T;
}

function toThread(item: ChatThreadApiItem): ChatThread {
  return {
    bookingId: String(item.booking_id),
    customerName: item.customer_name,
    tourName: item.tour_name,
    lastMessage: item.last_message,
    lastMessageAt: item.last_message_at,
  };
}

function toMessage(item: ChatMessageApiItem): ChatMessage {
  return {
    id: String(item.id),
    bookingId: String(item.booking_id),
    sender: item.sender,
    message: item.message,
    source: item.source,
    timestamp: item.timestamp,
  };
}

export function useChatThreads(search?: string) {
  const queryParams = new URLSearchParams();
  if (search?.trim()) queryParams.set("search", search.trim());
  const query = queryParams.toString();

  return useQuery({
    queryKey: ["chat-threads", query],
    queryFn: async () => {
      const payload = await apiGet<LaravelListResponse<ChatThreadApiItem>>(
        `/chats${query ? `?${query}` : ""}`,
      );
      return payload.data.map(toThread);
    },
  });
}

export function useChatMessages(bookingId?: string) {
  return useQuery({
    queryKey: ["chat-messages", bookingId],
    enabled: Boolean(bookingId),
    queryFn: async () => {
      const payload = await apiGet<LaravelListResponse<ChatMessageApiItem>>(
        `/chats/${bookingId}/messages?per_page=50`,
      );

      return payload.data.map(toMessage).sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
    },
  });
}

export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      message,
      source = "whatsapp",
    }: {
      bookingId: string;
      message: string;
      source?: ChatMessage["source"];
    }) => {
      const payload = await apiPost<LaravelItemResponse<ChatMessageApiItem>>(
        `/chats/${bookingId}/messages`,
        {
          message,
          source,
        },
      );
      return toMessage(payload.data);
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<ChatMessage[]>(["chat-messages", newMessage.bookingId], (current = []) => {
        return [...current, newMessage];
      });
      queryClient.invalidateQueries({ queryKey: ["chat-threads"] });
    },
  });
}
