"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search } from "lucide-react";
import { globalSearch, type SearchResult } from "@/server/actions/search";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) return;

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const found = await globalSearch(query);
      setResults(found);
      setLoading(false);
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showResults = query.trim().length >= 2;
  const visibleResults = showResults ? results : [];

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-xs items-center gap-2 rounded-[10px] border border-line bg-raise px-3 text-[13px] text-faint transition-colors hover:border-teal"
      >
        <Search className="h-3.5 w-3.5" />
        Search North…
        <kbd className="ml-auto rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-[20%] max-w-xl translate-y-0 p-0">
          <Command shouldFilter={false} className="flex flex-col">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <Search className="h-4 w-4 text-faint" />
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search notes, projects, dreams, courses…"
                className="h-8 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-faint"
              />
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {loading && <div className="px-3 py-6 text-center text-[13px] text-faint">Searching…</div>}
              {!loading && showResults && visibleResults.length === 0 && (
                <div className="px-3 py-6 text-center text-[13px] text-faint">Nothing found for &ldquo;{query}&rdquo;</div>
              )}
              {visibleResults.map((result) => (
                <Command.Item
                  key={result.id}
                  value={result.id}
                  onSelect={() => go(result.href)}
                  className="flex cursor-pointer flex-col gap-0.5 rounded-[10px] px-3 py-2.5 data-[selected=true]:bg-surface-2"
                >
                  <span className="text-[13.5px] font-semibold text-ink">{result.title}</span>
                  <span className="text-[11.5px] text-muted">{result.subtitle}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
