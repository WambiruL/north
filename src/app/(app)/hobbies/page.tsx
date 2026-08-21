import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listHobbiesWithCounts } from "@/services/hobbies";
import { HobbiesClient } from "@/components/hobbies/hobbies-client";

export const metadata: Metadata = { title: "Hobbies" };

export default async function HobbiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hobbies = user ? await listHobbiesWithCounts(supabase, user.id) : [];

  return <HobbiesClient hobbies={hobbies} />;
}
