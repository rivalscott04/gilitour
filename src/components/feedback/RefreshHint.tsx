import { cn } from "@/lib/utils";

interface RefreshHintProps {
  active?: boolean;
  message?: string;
  className?: string;
}

export function RefreshHint({
  active = false,
  message = "Refreshing data...",
  className,
}: RefreshHintProps) {
  if (!active) return null;

  return (
    <p className={cn("text-sm text-muted-foreground animate-pulse", className)}>
      {message}
    </p>
  );
}
