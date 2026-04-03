export type ChatSender = "customer" | "operator";
export type ChatSource = "whatsapp" | "web";

export interface ChatMessage {
  id: string;
  bookingId: string;
  sender: ChatSender;
  message: string;
  source: ChatSource;
  timestamp: string;
}

export interface ChatThread {
  bookingId: string;
  customerName: string;
  tourName: string;
  lastMessage: string;
  lastMessageAt: string | null;
}
