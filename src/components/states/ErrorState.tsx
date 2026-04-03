import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StateLayout = "page" | "card" | "compact";

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  layout?: StateLayout;
  className?: string;
}

const layoutClasses: Record<StateLayout, string> = {
  page: "rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center",
  card: "rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center",
  compact: "text-center py-2",
};

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Retry",
  layout = "page",
  className = "",
}: ErrorStateProps) {
  return (
    <div className={cn(layoutClasses[layout], className)}>
      <p className="text-sm text-destructive">{title}</p>
      {description ? <p className="text-sm text-muted-foreground mt-1">{description}</p> : null}
      {onRetry ? (
        <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
