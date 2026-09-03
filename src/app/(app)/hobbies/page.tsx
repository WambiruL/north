import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { listHobbiesWithCounts } from "@/services/hobbies";
import { getHobbyPreview, type HobbyPreview } from "@/services/hobby-previews";
import { HobbiesClient } from "@/components/hobbies/hobbies-client";

export const metadata: Metadata = { title: "Hobbies" };

export default async function HobbiesPage() {
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;

  const hobbies = user ? await listHobbiesWithCounts(supabase, user.id) : [];

  const previews: Record<string, HobbyPreview> = {};
  if (user) {
    await Promise.all(
      hobbies.map(async (hobby) => {
        previews[hobby.id] = await getHobbyPreview(supabase, user.id, hobby);
      }),
    );
  }

  return <HobbiesClient hobbies={hobbies} previews={previews} />;
}
