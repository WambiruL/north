"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2.5 rounded-[13px] border border-line bg-surface py-3.5 text-[14.5px] font-bold text-ink transition-transform hover:-translate-y-0.5 disabled:opacity-60"
    >
      <span
        className="h-[18px] w-[18px] rounded-full"
        style={{
          background:
            "conic-gradient(#EA4335 0 25%, #FBBC05 0 50%, #34A853 0 75%, #4285F4 0)",
        }}
      />
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}
