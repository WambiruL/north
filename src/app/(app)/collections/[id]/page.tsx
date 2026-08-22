import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listCollections, getCollection } from "@/services/collections";
import { CollectionsClient } from "@/components/collections/collections-client";

export const metadata: Metadata = { title: "Lists" };

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const collections = user ? await listCollections(supabase, user.id) : [];

  if (collections.length === 0) {
    redirect("/collections");
  }

  const result = user ? await getCollection(supabase, user.id, id) : null;

  if (!result) {
    redirect(`/collections/${collections[0].id}`);
  }

  return (
    <CollectionsClient
      collections={collections}
      selectedId={id}
      selected={result.collection}
      items={result.items}
      autoOpen={false}
    />
  );
}
