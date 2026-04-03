import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  meta?: string;
  action?: ReactNode;
  size?: "page" | "section";
  className?: string;
}

export function PageHeader({
  title,
  description,
  meta,
  action,
  size = "page",
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        size === "page" ? "pb-4 border-b border-border/70" : "",
        className,
      )}
    >
      <div>
        {size === "page" ? <span className="mb-2 block h-1.5 w-12 rounded-full bg-primary/80" /> : null}
        <h1
          className={cn(
            "font-semibold tracking-tight",
            size === "page" ? "text-3xl sm:text-4xl" : "text-2xl",
          )}
        >
          {title}
        </h1>
        {description ? <p className="text-muted-foreground text-base mt-1 max-w-2xl">{description}</p> : null}
        {meta ? (
          <p className="text-sm mt-2 text-muted-foreground inline-flex rounded-md bg-muted px-2.5 py-1">
            {meta}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
