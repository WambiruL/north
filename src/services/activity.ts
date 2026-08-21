import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export interface LogActivityInput {
  userId: string;
  module: Database["public"]["Tables"]["activities"]["Row"]["module"];
  verb: string;
  summary: string;
  entityTable?: string;
  entityId?: string;
}

export async function logActivity(supabase: Client, input: LogActivityInput) {
  await supabase.from("activities").insert({
    user_id: input.userId,
    module: input.module,
    verb: input.verb,
    summary: input.summary,
    entity_table: input.entityTable,
    entity_id: input.entityId,
  });
}

export async function getRecentActivity(supabase: Client, userId: string, limit = 8) {
  const { data } = await supabase
    .from("activities")
    .select("*")
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
