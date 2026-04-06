import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  setIslandToastEnqueue,
  type IslandToastItem,
} from "@/lib/island-toast-api";

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const VISIBLE_MS = 4200;
const COLLAPSED_W = 36;
const COLLAPSED_H = 28;
const EXPAND_MS = 520;
const COLLAPSE_MS = 380;

type AnimPhase = "expanding" | "visible" | "collapsing";

function maxIslandWidthPx(): number {
  if (typeof window === "undefined") return 560;
  return Math.max(COLLAPSED_W + 8, window.innerWidth - 32);
}

function ToastInner({
  item,
  mode,
  truncateText = false,
}: {
  item: IslandToastItem;
  mode: "measure" | "display";
  /** Only when message is wider than the viewport cap. */
  truncateText?: boolean;
}) {
  const Icon =
    item.variant === "error" ? CircleAlert : item.variant === "success" ? Check : null;
  return (
    <div
      className={cn(
        "flex flex-nowrap items-center gap-2.5 whitespace-nowrap px-3.5 py-2",
        mode === "measure" && "w-max",
        mode === "display" &&
          (truncateText ? "min-w-0 max-w-full flex-1" : "h-full w-max max-w-none"),
      )}
    >
      {Icon ? (
        <Icon
          className={`h-4 w-4 shrink-0 ${item.variant === "success" ? "text-emerald-400" : "text-red-400"}`}
          aria-hidden
        />
      ) : null}
      <span
        className={cn(
          "text-[13px] font-medium leading-none tracking-tight text-white/95",
          mode === "measure" && "shrink-0",
          mode === "display" && truncateText && "min-w-0 flex-1 truncate",
          mode === "display" && !truncateText && "shrink-0",
        )}
      >
        {item.message}
      </span>
    </div>
  );
}

function AnimatedIslandToast({
  item,
  onComplete,
}: {
  item: IslandToastItem;
  onComplete: () => void;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef<AnimPhase>("expanding");
  const expandDoneRef = useRef(false);
  const collapseDoneRef = useRef(false);

  const [dims, setDims] = useState({ w: COLLAPSED_W, h: COLLAPSED_H });
  const [truncateText, setTruncateText] = useState(false);
  const [phase, setPhase] = useState<AnimPhase>("expanding");
  /** When true, width/height changes apply instantly (no CSS transition). */
  const [transitionLocked, setTransitionLocked] = useState(true);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useLayoutEffect(() => {
    expandDoneRef.current = false;
    collapseDoneRef.current = false;
    setPhase("expanding");
    setTransitionLocked(true);
    setDims({ w: COLLAPSED_W, h: COLLAPSED_H });

    const el = measureRef.current;
    if (!el) return;

    const cap = maxIslandWidthPx();
    const naturalW = Math.ceil(Math.max(el.scrollWidth, el.getBoundingClientRect().width));
    const rawH = el.offsetHeight;
    const needsTruncate = naturalW > cap;
    setTruncateText(needsTruncate);
    const w = needsTruncate
      ? cap
      : Math.max(COLLAPSED_W + 2, naturalW + 2);
    const h = Math.max(COLLAPSED_H, rawH);

    const expandFallback = window.setTimeout(() => {
      setPhase((p) => (p === "expanding" ? "visible" : p));
    }, EXPAND_MS + 150);

    let tUnlock: number | undefined;
    let raf2 = 0;
    let raf3 = 0;

    const id = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        void el.offsetHeight;
        tUnlock = window.setTimeout(() => {
          setTransitionLocked(false);
          raf3 = requestAnimationFrame(() => {
            setDims({ w, h });
          });
        }, 52);
      });
    });

    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(raf2);
      cancelAnimationFrame(raf3);
      clearTimeout(tUnlock);
      clearTimeout(expandFallback);
    };
  }, [item.id]);

  useEffect(() => {
    if (phase !== "visible") return;
    const t = window.setTimeout(() => {
      setPhase("collapsing");
      setDims({ w: COLLAPSED_W, h: COLLAPSED_H });
    }, VISIBLE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "collapsing") return;
    const t = window.setTimeout(() => {
      if (collapseDoneRef.current) return;
      collapseDoneRef.current = true;
      onComplete();
    }, COLLAPSE_MS + 180);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  const handleTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== "width") return;

      const p = phaseRef.current;

      if (p === "expanding") {
        if (expandDoneRef.current) return;
        expandDoneRef.current = true;
        setPhase("visible");
        return;
      }

      if (p === "collapsing") {
        if (collapseDoneRef.current) return;
        collapseDoneRef.current = true;
        onComplete();
      }
    },
    [onComplete],
  );

  const durationMs = phase === "collapsing" ? COLLAPSE_MS : EXPAND_MS;
  const easing =
    phase === "collapsing" ? "cubic-bezier(0.55, 0.06, 0.68, 0.19)" : "cubic-bezier(0.16, 1, 0.3, 1)";

  const shellTransition = transitionLocked
    ? "none"
    : `width ${durationMs}ms ${easing}, height ${durationMs}ms ${easing}`;

  return (
    <>
      <div
        ref={measureRef}
        className="pointer-events-none fixed left-0 top-0 -z-10 flex w-max flex-nowrap invisible"
        aria-hidden
      >
        <ToastInner item={item} mode="measure" />
      </div>

      <div
        className="pointer-events-none fixed inset-x-0 top-3 z-[9999] flex justify-center px-4"
        role="status"
        aria-live="polite"
      >
        <div
          className="relative overflow-hidden rounded-[999px] bg-black text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14),0_12px_40px_rgba(0,0,0,0.45)] will-change-[width,height]"
          style={{
            width: dims.w,
            height: dims.h,
            transition: shellTransition,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          <div
            className={cn(
              "flex h-full w-full min-w-0 items-center justify-start overflow-hidden transition-[opacity,transform] duration-200 ease-out",
              phase === "collapsing" && "pointer-events-none scale-[0.92] opacity-0",
            )}
          >
            <ToastInner item={item} mode="display" truncateText={truncateText} />
          </div>
        </div>
      </div>
    </>
  );
}

export function IslandToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ current: IslandToastItem | null; queue: IslandToastItem[] }>(
    {
      current: null,
      queue: [],
    },
  );

  const enqueue = useCallback((item: Omit<IslandToastItem, "id">) => {
    const full = { ...item, id: uid() };
    setState((s) => {
      if (s.current === null) {
        return { ...s, current: full };
      }
      return { ...s, queue: [...s.queue, full] };
    });
  }, []);

  useEffect(() => {
    setIslandToastEnqueue(enqueue);
    return () => setIslandToastEnqueue(undefined);
  }, [enqueue]);

  const onToastComplete = useCallback(() => {
    setState((s) => {
      const [next, ...rest] = s.queue;
      return { current: next ?? null, queue: rest };
    });
  }, []);

  return (
    <>
      {children}
      {state.current ? (
        <AnimatedIslandToast key={state.current.id} item={state.current} onComplete={onToastComplete} />
      ) : null}
    </>
  );
}
