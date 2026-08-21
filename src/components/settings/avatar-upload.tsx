"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateAvatar } from "@/server/actions/settings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AvatarUpload({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [isPending, startTransition] = useTransition();
  const initial = fullName.trim().charAt(0).toUpperCase() || "N";

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.set("avatar", file);

    startTransition(async () => {
      const result = await updateAvatar(formData);
      if (result?.error) toast.error(result.error);
      else toast.success("Avatar updated");
    });
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        {preview && <AvatarImage src={preview} alt={fullName} />}
        <AvatarFallback className="text-[20px]">{initial}</AvatarFallback>
      </Avatar>
      <div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? "Uploading…" : "Change photo"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
