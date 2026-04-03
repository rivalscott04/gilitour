import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

function getTimeLeft(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, total: diff };
}

function formatCountdown(t: ReturnType<typeof getTimeLeft>, compact?: boolean) {
  if (!t) return "Tour has started";
  if (compact) {
    if (t.days > 0) return `${t.days}d ${t.hours}h`;
    if (t.hours > 0) return `${t.hours}h ${t.minutes}m`;
    return `${t.minutes}m ${t.seconds}s`;
  }
  return t;
}

export function CountdownTimer({ targetDate, compact }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  const isUrgent = timeLeft && timeLeft.total < 1000 * 60 * 60 * 3; // < 3 hours
  const isPast = !timeLeft;

  if (compact) {
    return (
      <span className={`inline-flex items-center gap-1 text-sm font-medium ${isUrgent ? "text-accent animate-pulse-soft" : isPast ? "text-muted-foreground" : "text-primary"}`}>
        <Clock className="h-3.5 w-3.5" />
        {formatCountdown(timeLeft, true) as string}
      </span>
    );
  }

  if (isPast) {
    return <p className="text-sm text-muted-foreground">Tour has started</p>;
  }

  const t = timeLeft;
  const unitClass = "flex flex-col items-center";
  const numClass = `text-2xl font-semibold ${isUrgent ? "text-accent" : "text-primary"}`;
  const labelClass = "text-sm text-muted-foreground mt-0.5";

  return (
    <div className={`flex gap-4 ${isUrgent ? "animate-pulse-soft" : ""}`}>
      {t.days > 0 && (
        <div className={unitClass}>
          <span className={numClass}>{t.days}</span>
          <span className={labelClass}>days</span>
        </div>
      )}
      <div className={unitClass}>
        <span className={numClass}>{String(t.hours).padStart(2, "0")}</span>
        <span className={labelClass}>hours</span>
      </div>
      <div className={unitClass}>
        <span className={numClass}>{String(t.minutes).padStart(2, "0")}</span>
        <span className={labelClass}>min</span>
      </div>
      <div className={unitClass}>
        <span className={numClass}>{String(t.seconds).padStart(2, "0")}</span>
        <span className={labelClass}>sec</span>
      </div>
    </div>
  );
}
