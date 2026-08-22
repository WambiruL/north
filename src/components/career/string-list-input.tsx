"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface StringListInputProps {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  layout?: "rows" | "chips";
}

/** Small add/remove editor for a plain text[] field — wins, tags, and the like. */
export function StringListInput({
  value,
  onChange,
  placeholder = "Add an item",
  layout = "rows",
}: StringListInputProps) {
  const [draft, setDraft] = useState("");

  function add() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setDraft("");
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" size="sm" variant="secondary" onClick={add} disabled={!draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      {value.length > 0 &&
        (layout === "chips" ? (
          <div className="flex flex-wrap gap-1.5">
            {value.map((item, i) => (
              <Badge key={i} variant="teal" className="gap-1 pr-1.5 normal-case tracking-normal">
                {item}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="ml-0.5 rounded-full hover:bg-black/10"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <ul className={cn("flex flex-col gap-1.5")}>
            {value.map((item, i) => (
              <li
                key={i}
                className="flex items-center justify-between gap-2 rounded-[10px] bg-surface-2 px-3 py-2 text-[13px] text-ink"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="shrink-0 text-faint hover:text-mahogany"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
