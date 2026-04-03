import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import BookingList from "./pages/BookingList";
import BookingDetail from "./pages/BookingDetail";
import Chat from "./pages/Chat";
import ChatTemplates from "./pages/ChatTemplates";
import CustomerList from "./pages/CustomerList";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/bookings" element={<BookingList />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/bookings/:id" element={<BookingDetail />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat/:bookingId" element={<Chat />} />
            <Route path="/templates" element={<ChatTemplates />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
