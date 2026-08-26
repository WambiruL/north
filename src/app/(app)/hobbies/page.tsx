import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { listHobbiesWithCounts, getHobbyDetail, type HobbyDetail } from "@/services/hobbies";
import { HobbiesClient } from "@/components/hobbies/hobbies-client";

export const metadata: Metadata = { title: "Hobbies" };

export default async function HobbiesPage({
  searchParams,
}: {
  searchParams: Promise<{ hobby?: string }>;
}) {
  const { hobby } = await searchParams;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;

  const hobbies = user ? await listHobbiesWithCounts(supabase, user.id) : [];

  const details = user
    ? await Promise.all(hobbies.map((h) => getHobbyDetail(supabase, user.id, h.id)))
    : [];

  const detailById: Record<string, HobbyDetail> = {};
  for (const detail of details) {
    if (detail) detailById[detail.hobby.id] = detail;
  }

  return <HobbiesClient hobbies={hobbies} detailById={detailById} initialOpenId={hobby} />;
}
