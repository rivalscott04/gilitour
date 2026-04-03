import { cn } from "@/lib/utils";

type StateLayout = "page" | "card" | "compact";

interface EmptyStateProps {
  title: string;
  description?: string;
  layout?: StateLayout;
  className?: string;
}

const layoutClasses: Record<StateLayout, string> = {
  page: "rounded-xl border border-border bg-card p-8 text-center",
  card: "rounded-lg border border-border bg-card p-4 text-center",
  compact: "text-center py-3",
};

export function EmptyState({
  title,
  description,
  layout = "page",
  className = "",
}: EmptyStateProps) {
  return (
    <div className={cn(layoutClasses[layout], className)}>
      <p className={cn("text-muted-foreground", layout === "compact" ? "text-sm" : "text-lg")}>{title}</p>
      {description ? (
        <p className={cn("mt-1 text-muted-foreground text-sm")}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
