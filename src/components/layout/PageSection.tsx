import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function PageSection({
  title,
  description,
  action,
  children,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4 rounded-xl border border-border/60 bg-card/60 p-4 sm:p-5", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          {description ? <p className="text-base text-muted-foreground mt-1">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
