import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listCheckIns } from "@/services/check-ins";
import { CheckInsClient } from "@/components/check-ins/check-ins-client";

export const metadata: Metadata = { title: "Check-ins" };

export default async function CheckInsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const checkIns = user ? await listCheckIns(supabase, user.id) : [];

  return <CheckInsClient checkIns={checkIns} autoOpen={newParam === "check_in"} />;
}
