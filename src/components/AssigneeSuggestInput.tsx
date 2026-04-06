import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useAssigneeSuggestions } from "@/hooks/use-bookings";

interface AssigneeSuggestInputProps {
  value: string;
  onChange: (next: string) => void;
  enabled: boolean;
  disabled?: boolean;
}

export function AssigneeSuggestInput({ value, onChange, enabled, disabled }: AssigneeSuggestInputProps) {
  const listId = useId();
  const [listOpen, setListOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState(value);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setListOpen(false);
      setDebouncedQuery("");
      return;
    }
    const t = setTimeout(() => setDebouncedQuery(value), 250);
    return () => clearTimeout(t);
  }, [value, enabled]);

  const { data: suggestions = [], isFetching } = useAssigneeSuggestions(debouncedQuery, enabled && listOpen);

  const cancelBlurClose = () => {
    if (blurTimer.current !== null) {
      clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelBlurClose();
    blurTimer.current = setTimeout(() => setListOpen(false), 180);
  };

  const showList =
    listOpen &&
    enabled &&
    !disabled &&
    (isFetching || suggestions.length > 0 || value.trim().length > 0);

  return (
    <div className="relative">
      <Input
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        value={value}
        disabled={disabled}
        placeholder="Search or pick from your bookings…"
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          cancelBlurClose();
          setListOpen(true);
        }}
        onBlur={scheduleClose}
      />
      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className={cn(
            "absolute z-[100] mt-1 max-h-48 w-full overflow-auto rounded-md border border-border bg-popover py-1 text-sm shadow-md",
          )}
        >
          {isFetching ? (
            <li className="px-3 py-2 text-muted-foreground">Loading suggestions…</li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-muted-foreground">
              No saved assignees match that text. You can still enter a new name and save.
            </li>
          ) : (
            suggestions.map((name) => (
              <li key={name} role="option" aria-selected={name === value}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full cursor-pointer px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground",
                    name === value && "bg-accent/60",
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(name);
                    cancelBlurClose();
                    setListOpen(false);
                  }}
                >
                  {name}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
