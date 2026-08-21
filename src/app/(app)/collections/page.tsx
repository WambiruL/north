import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { listCollections } from "@/services/collections";
import { CollectionsClient } from "@/components/collections/collections-client";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const collections = user ? await listCollections(supabase, user.id) : [];

  return <CollectionsClient collections={collections} autoOpen={newParam === "collection"} />;
}
