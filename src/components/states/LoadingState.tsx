import { cn } from "@/lib/utils";

type StateLayout = "page" | "card" | "compact";

interface LoadingStateProps {
  message?: string;
  layout?: StateLayout;
  className?: string;
}

const layoutClasses: Record<StateLayout, string> = {
  page: "text-center py-10",
  card: "rounded-xl border border-border bg-card p-6 text-center",
  compact: "text-center py-2",
};

export function LoadingState({
  message = "Loading...",
  layout = "page",
  className = "",
}: LoadingStateProps) {
  return (
    <div className={cn(layoutClasses[layout], "text-muted-foreground", className)}>
      <p className="text-sm">{message}</p>
    </div>
  );
}

interface LoadingCardGridProps {
  count?: number;
  className?: string;
}

export function LoadingCardGrid({ count = 4, className = "" }: LoadingCardGridProps) {
  return (
    <div className={`grid sm:grid-cols-2 lg:grid-cols-2 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="rounded-xl border border-border bg-card p-6 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-3" />
          <div className="h-3 w-48 bg-muted rounded mb-5" />
          <div className="h-3 w-full bg-muted rounded mb-2" />
          <div className="h-3 w-2/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
