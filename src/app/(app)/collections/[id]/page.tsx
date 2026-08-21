import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCollection } from "@/services/collections";
import { CollectionDetailClient } from "@/components/collections/collection-detail-client";

export const metadata: Metadata = { title: "Collection" };

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

  if (!user) notFound();

  const result = await getCollection(supabase, user.id, id);
  if (!result) notFound();

  return <CollectionDetailClient collection={result.collection} items={result.items} />;
}
