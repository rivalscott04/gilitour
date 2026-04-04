import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const BookingList = lazy(() => import("./pages/BookingList"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));
const Chat = lazy(() => import("./pages/Chat"));
const ChatTemplates = lazy(() => import("./pages/ChatTemplates"));
const CustomerList = lazy(() => import("./pages/CustomerList"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BookingMagicRespond = lazy(() => import("./pages/BookingMagicRespond"));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <span className="sr-only">Loading page</span>
    </div>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Landing />
              </Suspense>
            }
          />
          <Route
            path="/login"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Login />
              </Suspense>
            }
          />
          <Route
            path="/booking/:bookingId/respond"
            element={
              <Suspense fallback={<RouteFallback />}>
                <BookingMagicRespond />
              </Suspense>
            }
          />
          <Route path="/dashboard" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route
                index
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Index />
                  </Suspense>
                }
              />
              <Route
                path="bookings"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <BookingList />
                  </Suspense>
                }
              />
              <Route
                path="customers"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <CustomerList />
                  </Suspense>
                }
              />
              <Route
                path="analytics"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Analytics />
                  </Suspense>
                }
              />
              <Route
                path="bookings/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <BookingDetail />
                  </Suspense>
                }
              />
              <Route
                path="chat"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Chat />
                  </Suspense>
                }
              />
              <Route
                path="chat/:bookingId"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <Chat />
                  </Suspense>
                }
              />
              <Route
                path="templates"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ChatTemplates />
                  </Suspense>
                }
              />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFound />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
