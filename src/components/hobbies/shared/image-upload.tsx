"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ImagePlus, Loader2, X } from "lucide-react";
import { uploadHobbyMedia } from "@/server/actions/hobbies";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  label = "Add a photo",
  className,
  aspect = "aspect-square",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
  aspect?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isPending, startTransition] = useTransition();

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadHobbyMedia(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      if (result?.url) onChange(result.url);
    });

    event.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className={cn(
          "flex w-full items-center justify-center overflow-hidden rounded-[16px] border-[1.5px] border-dashed border-line bg-surface-2 text-muted transition-colors hover:border-teal hover:text-teal",
          aspect,
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1.5 px-4 py-6 text-center text-[12.5px] font-semibold">
            <ImagePlus className="h-5 w-5" />
            {label}
          </span>
        )}
        {isPending && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40">
            <Loader2 className="h-5 w-5 animate-spin text-bg" />
          </span>
        )}
      </button>
      {preview && !isPending && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove photo"
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-bg transition-colors hover:bg-ink"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
