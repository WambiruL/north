import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { listCollections } from "@/services/collections";
import { CollectionsClient } from "@/components/collections/collections-client";

export const metadata: Metadata = { title: "Lists" };

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: newParam } = await searchParams;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;

  const collections = user ? await listCollections(supabase, user.id) : [];
  const wantsNewDialog = newParam === "collection";

  // The master-detail view always needs a selected list. If any exist and
  // the user isn't specifically here to create one, jump straight to the
  // first list so the detail pane is never blank on first load.
  if (collections.length > 0 && !wantsNewDialog) {
    redirect(`/collections/${collections[0].id}`);
  }

  return (
    <CollectionsClient
      collections={collections}
      selectedId={null}
      selected={null}
      items={[]}
      autoOpen={wantsNewDialog}
    />
  );
}
