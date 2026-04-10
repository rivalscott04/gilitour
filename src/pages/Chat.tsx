import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, MapPin, Calendar, Clock, MessageSquare, Search, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { chatTemplates, evaluateTemplate } from "@/data/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { CountdownTimer } from "@/components/CountdownTimer";
import { toast } from "@/lib/island-toast-api";
import { useBooking, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { isAwaitingConfirmation } from "@/types/booking";
import { useChatMessages, useChatThreads, useSendChatMessage } from "@/hooks/use-chat";
import type { ChatMessage } from "@/types/chat";
import { EmptyState, ErrorState, LoadingState } from "@/components/states";
import { PageHeader } from "@/components/layout";
import { DASHBOARD_BASE } from "@/lib/routes";

const CHAT_MESSAGE_MAX_LEN = 2000;

function ChatBubble({ msg, showAvatar }: { msg: ChatMessage; showAvatar?: boolean }) {
  const isOperator = msg.sender === "operator";
  const isWhatsapp = msg.source === "whatsapp";

  return (
    <div className={`flex items-end gap-2 ${isOperator ? "justify-end" : "justify-start"}`}>
      {/* Customer avatar */}
      {!isOperator && (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${showAvatar ? (isWhatsapp ? "bg-[#22C55E] text-white" : "bg-primary text-primary-foreground") : "invisible"}`}>
          {isWhatsapp ? "WA" : "CU"}
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isOperator
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-white text-foreground border border-border/60 shadow-sm rounded-bl-sm"
        }`}
      >
        <p className="leading-relaxed">{msg.message}</p>
        <div className={`flex items-center gap-1.5 mt-1.5 justify-end`}>
          <p className={`text-sm ${isOperator ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {format(new Date(msg.timestamp), "h:mm a")}
          </p>
          {!isOperator && isWhatsapp && (
             <MessageSquare className="w-3 h-3 text-[#22C55E]" />
          )}
        </div>
      </div>
      {/* Operator avatar */}
      {isOperator && (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${showAvatar ? "bg-primary text-primary-foreground" : "invisible"}`}>
          OP
        </div>
      )}
    </div>
  );
}

function groupMessages(messages: ChatMessage[]) {
  return messages.map((msg, i) => {
    const next = messages[i + 1];
    const isLastInGroup = !next || next.sender !== msg.sender;
    return { msg, showAvatar: isLastInGroup };
  });
}

function ChatList({ 
  selectedId, 
  onSelect,
  threads,
  isLoading,
}: { 
  selectedId?: string; 
  onSelect: (id: string) => void;
  threads: Array<{
    bookingId: string;
    customerName: string;
    lastMessage: string;
    lastMessageAt: string | null;
  }>;
  isLoading: boolean;
}) {
  const [search, setSearch] = useState("");
  const filteredThreads = useMemo(
    () =>
      threads.filter((thread) =>
        thread.customerName.toLowerCase().includes(search.toLowerCase()),
      ),
    [threads, search],
  );

  return (
    <div className="w-full lg:basis-80 lg:max-w-[28rem] lg:flex-shrink-0 border-r border-border bg-background flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-border space-y-3">
        <PageHeader title="Active Chats" size="section" className="!block" />
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isLoading && <p className="text-sm text-muted-foreground px-2">Loading chats...</p>}
        {filteredThreads.map((thread) => {
          const isSelected = selectedId === thread.bookingId;
          const isWhatsapp = true;

          return (
            <button
              key={thread.bookingId}
              onClick={() => onSelect(thread.bookingId)}
              className={`w-full text-left rounded-xl p-3 transition-colors ${
                isSelected 
                  ? "bg-muted border border-border shadow-sm" 
                  : "hover:bg-muted/50 border border-transparent"
              }`}
            >
              <div className="flex items-center justify-between mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-semibold text-sm truncate">{thread.customerName}</span>
                  {isWhatsapp && (
                    <span className="flex-shrink-0 bg-[#22C55E]/10 text-[#22C55E] px-1.5 py-0.5 rounded text-sm font-bold">
                      WA
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap ml-2">
                  {thread.lastMessageAt ? format(new Date(thread.lastMessageAt), "h:mm a") : "-"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate leading-snug">{thread.lastMessage}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Chat() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const {
    data: threads = [],
    isLoading: isThreadsLoading,
    isError: isThreadsError,
    refetch: refetchThreads,
  } = useChatThreads();
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    refetch: refetchMessages,
  } = useChatMessages(bookingId);
  const { data: booking, isLoading: isBookingLoading, isError: isBookingError, refetch: refetchBooking } = useBooking(bookingId);
  const sendMessageMutation = useSendChatMessage();
  const updateStatusMutation = useUpdateBookingStatus();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const message = input.trim().slice(0, CHAT_MESSAGE_MAX_LEN);
    if (!message || !bookingId) return;
    sendMessageMutation.mutate(
      { bookingId, message, source: "whatsapp" },
      {
        onSuccess: () => setInput(""),
        onError: () => toast.error("Failed to send message"),
      },
    );
  };

  const handleSelectBooking = (id: string) => {
    navigate(`${DASHBOARD_BASE}/chat/${id}`);
  };

  const handleConfirmBooking = () => {
    if (booking && isAwaitingConfirmation(booking.status)) {
      updateStatusMutation.mutate(
        {
          id: booking.id,
          status: "confirmed",
        },
        {
          onSuccess: () => toast.success("Booking confirmed successfully"),
          onError: () => toast.error("Failed to confirm booking"),
        },
      );
    }
  };

  const tourDate = booking ? new Date(booking.date) : null;
  const isUpcoming = tourDate && tourDate.getTime() > Date.now() && booking?.status !== "cancelled";

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] lg:h-[calc(100dvh-5rem)] lg:overflow-hidden bg-muted/20 border border-border rounded-xl shadow-sm">
      
      {/* 3-Column Layout: Left (Chat List) */}
      <div className={`${bookingId ? 'hidden lg:flex' : 'flex'} w-full lg:w-auto h-full`}>
        <ChatList
          selectedId={bookingId}
          onSelect={handleSelectBooking}
          threads={threads}
          isLoading={isThreadsLoading}
        />
      </div>

      {/* Middle: Chat Area */}
      {bookingId && booking ? (
        <div className="flex-1 flex flex-col min-w-0 bg-background h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <div>
              <h3 className="font-semibold">{booking.customerName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                WhatsApp (opens chat via wa.me)
              </p>
            </div>
            {/* Show on mobile to go back */}
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => navigate(`${DASHBOARD_BASE}/chat`)}>
              Back
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {isMessagesLoading ? (
              <p className="text-center text-muted-foreground text-sm py-8">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</p>
            ) : (
              groupMessages(messages).map(({ msg, showAvatar }) => (
                <ChatBubble key={msg.id} msg={msg} showAvatar={showAvatar} />
              ))
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 bg-white border-t border-border flex flex-col">
            {/* Quick Replies */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 hide-scrollbar">
              {chatTemplates.map((reply) => (
                <button
                  key={reply.id}
                  onClick={() =>
                    setInput(
                      evaluateTemplate(reply.content, {
                        customerName: booking.customerName,
                        tourName: booking.tourName,
                      }).slice(0, CHAT_MESSAGE_MAX_LEN),
                    )
                  }
                  className="whitespace-nowrap px-3 py-1.5 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground text-sm rounded-full transition-colors border border-border"
                  title={reply.name}
                >
                  {reply.name}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
              <Input
                placeholder="Type a message to WhatsApp..."
                value={input}
                maxLength={CHAT_MESSAGE_MAX_LEN}
                onChange={(e) => setInput(e.target.value.slice(0, CHAT_MESSAGE_MAX_LEN))}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 rounded-full px-4 h-11 bg-muted/50 border-transparent focus-visible:border-primary"
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || sendMessageMutation.isPending}
                className="h-11 w-11 rounded-full shrink-0"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            {sendMessageMutation.isPending && (
              <LoadingState message="Sending message..." className="py-2" />
            )}
            {isMessagesError && (
              <ErrorState
                title="Failed to load messages."
                onRetry={() => refetchMessages()}
                retryLabel="Retry messages"
                layout="card"
                className="mt-3"
              />
            )}
          </div>
        </div>
      ) : (
         <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-muted-foreground bg-background">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p>{isThreadsLoading ? "Loading chats..." : "Select a chat to start messaging"}</p>
            {isThreadsError && (
              <ErrorState
                title="Failed to load chat threads."
                onRetry={() => refetchThreads()}
                retryLabel="Retry chats"
                layout="card"
                className="mt-3 w-full max-w-sm"
              />
            )}
         </div>
      )}

      {/* Right: Booking Details (Visible if bookingId is selected and on large screens) */}
      {bookingId && booking && (
        <div className="hidden xl:flex xl:basis-80 xl:max-w-[28rem] xl:flex-shrink-0 flex-col border-l border-border bg-background p-6 h-full overflow-y-auto">
          <h2 className="font-semibold text-lg mb-6 text-foreground">Tour Details</h2>
          
          <div className="space-y-6">
             <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
                <h3 className="font-medium mb-1 leading-tight">{booking.tourName}</h3>
                <div className="flex items-center gap-2 mt-2">
                   <StatusBadge status={booking.status} />
                   {isAwaitingConfirmation(booking.status) && (
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={handleConfirmBooking}
                       disabled={updateStatusMutation.isPending}
                       className="h-8 text-sm px-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                     >
                       <CheckCircle2 className="w-3 h-3 mr-1" />
                       Confirm
                     </Button>
                   )}
                </div>
             </div>

             {isUpcoming && (
               <div className="bg-primary/5 rounded-xl border border-primary/20 p-4">
                 <p className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Countdown Time
                 </p>
                 <CountdownTimer targetDate={booking.date} />
               </div>
             )}

             <div className="space-y-4">
               <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                     <Calendar className="w-3.5 h-3.5" /> Date & Time
                  </p>
                  <p className="text-sm font-medium">{format(tourDate!, "MMM d, yyyy")} at {booking.time}</p>
               </div>
               
               <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                     <MapPin className="w-3.5 h-3.5" /> Meeting Point
                  </p>
                  <p className="text-sm font-medium">{booking.location}</p>
               </div>
             </div>

             <Button className="w-full mt-4" variant="outline" onClick={() => navigate(`${DASHBOARD_BASE}/bookings/${booking.id}`)}>
               View Full Invoice
             </Button>
          </div>
        </div>
      )}
      {bookingId && !booking && !isBookingLoading && (
        <div className="hidden xl:flex xl:basis-80 xl:max-w-[28rem] xl:flex-shrink-0 flex-col border-l border-border bg-background p-6 h-full overflow-y-auto">
          {isBookingError ? (
            <ErrorState
              title="Failed to load booking details."
              onRetry={() => refetchBooking()}
              retryLabel="Retry detail"
            />
          ) : (
            <EmptyState title="Booking detail unavailable." layout="card" />
          )}
        </div>
      )}

    </div>
  );
}
