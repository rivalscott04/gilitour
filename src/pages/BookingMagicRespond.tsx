import { useMemo, useState, type ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Calendar, Loader2 } from "lucide-react";
import { toast } from "@/lib/island-toast-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useMagicLinkPreflight, useMagicLinkSubmit } from "@/hooks/use-magic-link";
import { ApiError } from "@/lib/api-client";
import type { MagicLinkData } from "@/types/magic-link";

function GuestHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-primary bg-primary">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-6 w-6 object-contain" width={24} height={24} />
          <span className="text-lg font-semibold tracking-[0.1px] text-primary-foreground">Gilitour</span>
        </div>
        <span className="ml-auto text-sm font-medium text-primary-foreground/90">Trip reminder</span>
      </div>
    </header>
  );
}

function FormView({
  data,
  acting,
  onAction,
}: {
  data: MagicLinkData;
  acting: "confirm" | "cancel" | "reschedule" | null;
  onAction: (a: "confirm" | "cancel" | "reschedule") => void;
}) {
  const whenLabel = useMemo(() => {
    if (!data.tour_start_at) return null;
    try {
      const d = parseISO(data.tour_start_at);
      return format(d, "EEE, MMM d, yyyy · h:mm a");
    } catch {
      return null;
    }
  }, [data.tour_start_at]);

  return (
    <Card className="card-shadow max-w-lg border-border">
      <CardHeader className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Quick check-in</p>
        <div className="space-y-1">
          <CardTitle className="font-semibold leading-tight text-2xl text-foreground md:text-[1.75rem]">
            {data.tour_name}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-foreground-secondary">
            Hi {data.customer_name}, you already have a reservation (for example through GetYourGuide). This is a
            short reminder so we can plan the day — please let us know if you&apos;re still joining us. Your reply
            is saved right away.
          </CardDescription>
        </div>
        {whenLabel && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <span className="text-muted-foreground font-normal">Tour date & time: </span>
                {whenLabel}
              </span>
            </p>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4 border-t border-border pt-6">
        <p className="text-sm font-medium text-foreground">How should we plan for you?</p>
        <div className="flex flex-col gap-3" role="group" aria-label="Trip reminder options">
          <Button
            type="button"
            className="h-11 w-full gap-2 font-semibold shadow-sm"
            disabled={acting !== null}
            onClick={() => onAction("confirm")}
          >
            {acting === "confirm" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Yes, I&apos;m coming
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 border-2 border-warning/55 bg-background font-semibold text-amber-800 shadow-none hover:!border-warning hover:!bg-warning/10 hover:!text-amber-950 focus-visible:!text-amber-950 dark:text-warning dark:hover:!text-warning"
            disabled={acting !== null}
            onClick={() => onAction("reschedule")}
          >
            {acting === "reschedule" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            I need another time / I&apos;m running late
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full gap-2 border-2 border-destructive/55 bg-background font-semibold text-destructive shadow-none hover:!border-destructive hover:!bg-destructive/10 hover:!text-destructive focus-visible:!text-destructive active:!text-destructive"
            disabled={acting !== null}
            onClick={() => onAction("cancel")}
          >
            {acting === "cancel" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            I can&apos;t make it
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function DoneView({ data }: { data: MagicLinkData }) {
  const r = data.customer_response;
  return (
    <Card className="card-shadow max-w-lg border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold md:text-2xl">
          {r === "confirmed" && "Great — see you then!"}
          {r === "cancelled" && "Thanks for letting us know"}
          {r === "reschedule_requested" && "We've got your message"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm leading-relaxed text-foreground-secondary">
        {r === "confirmed" && (
          <p>
            Thank you, {data.customer_name}. We&apos;ve noted that you&apos;re still joining{" "}
            <strong className="text-foreground">{data.tour_name}</strong> on the date above. See you soon!
          </p>
        )}
        {r === "cancelled" && (
          <p>
            We&apos;ve recorded that you can&apos;t make <strong className="text-foreground">{data.tour_name}</strong>.
            If that changes or this was a mistake, please reach out to us.
          </p>
        )}
        {r === "reschedule_requested" && (
          <p>
            Thanks, {data.customer_name}. We&apos;ve noted that you need a different time or are running late for{" "}
            <strong className="text-foreground">{data.tour_name}</strong>. Our team will follow up with you
            shortly.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ClosedView({ data }: { data: MagicLinkData }) {
  return (
    <Card className="card-shadow max-w-lg border-border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold md:text-2xl">No longer available</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-foreground-secondary">
        <p>
          Updates for <strong className="text-foreground">{data.tour_name}</strong> can&apos;t be made through this
          link anymore. Please message us if you still need help.
        </p>
      </CardContent>
    </Card>
  );
}

export default function BookingMagicRespond() {
  const { bookingId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [acting, setActing] = useState<"confirm" | "cancel" | "reschedule" | null>(null);

  const { data, isLoading, isError, error, refetch } = useMagicLinkPreflight(bookingId, token);
  const submit = useMagicLinkSubmit(bookingId, token);

  const handleAction = async (action: "confirm" | "cancel" | "reschedule") => {
    setActing(action);
    try {
      await submit.mutateAsync(action);
      toast.success("Thanks — we've saved your reply.");
    } catch (e) {
      if (e instanceof ApiError) {
        toast.error(e.message);
        if (e.status === 422) void refetch();
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setActing(null);
    }
  };

  let body: ReactNode;

  if (!token) {
    body = (
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle>Invalid link</AlertTitle>
        <AlertDescription>This page needs a valid link from your message. Please use the link we sent you.</AlertDescription>
      </Alert>
    );
  } else if (isLoading) {
    body = (
      <div className="flex min-h-[12rem] flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin" aria-hidden />
        <span className="text-sm">Loading…</span>
      </div>
    );
  } else if (isError) {
    body = (
      <Alert variant="destructive" className="max-w-lg">
        <AlertTitle>Link not valid</AlertTitle>
        <AlertDescription>
          {error instanceof ApiError ? error.message : "We could not open this booking. Ask your host for a new link."}
        </AlertDescription>
      </Alert>
    );
  } else if (data?.view === "form") {
    body = <FormView data={data} acting={acting} onAction={handleAction} />;
  } else if (data?.view === "done") {
    body = <DoneView data={data} />;
  } else if (data?.view === "closed") {
    body = <ClosedView data={data} />;
  } else {
    body = null;
  }

  return (
    <div className="min-h-screen bg-background-subtle">
      <GuestHeader />
      <div className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1200px] items-center justify-center px-4 py-8">
        {body}
      </div>
    </div>
  );
}
