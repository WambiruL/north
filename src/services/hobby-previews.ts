import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getHobbyTemplate } from "@/lib/constants/hobby-templates";
import { computeCurrentActivity } from "@/services/hobbies";

type Client = SupabaseClient<Database>;
type Hobby = { id: string; kind: string };

export type HobbyPreview =
  | { kind: "book"; label: string; title: string; author: string | null; coverUrl: string | null }
  | { kind: "photos"; images: string[] }
  | { kind: "dish"; label: string; name: string; photoUrl: string | null }
  | { kind: "art"; label: string; title: string; imageUrl: string | null }
  | { kind: "travel"; label: string; title: string; imageUrl: string | null }
  | { kind: "run"; distanceKm: number; durationMinutes: number; occurredOn: string }
  | { kind: "generic"; label: string; title: string; sub: string | null }
  | { kind: "empty" };

export async function getHobbyPreview(supabase: Client, userId: string, hobby: Hobby): Promise<HobbyPreview> {
  switch (hobby.kind) {
    case "reading": {
      const { data } = await supabase
        .from("books")
        .select("title, author, cover_url, status")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .eq("status", "reading")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return { kind: "empty" };
      return { kind: "book", label: "Currently reading", title: data.title, author: data.author, coverUrl: data.cover_url };
    }
    case "photography": {
      const { data } = await supabase
        .from("photos")
        .select("image_url")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("occurred_on", { ascending: false })
        .limit(3);
      if (!data || data.length === 0) return { kind: "empty" };
      return { kind: "photos", images: data.map((p) => p.image_url) };
    }
    case "cooking": {
      const { data } = await supabase
        .from("cooking_logs")
        .select("dish_name, photo_url")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("occurred_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return { kind: "empty" };
      return { kind: "dish", label: "Latest", name: data.dish_name, photoUrl: data.photo_url };
    }
    case "visual_art": {
      const { data } = await supabase
        .from("artworks")
        .select("title, image_url, status")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("occurred_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return { kind: "empty" };
      return {
        kind: "art",
        label: data.status === "current" ? "Working on" : "Latest",
        title: data.title,
        imageUrl: data.image_url,
      };
    }
    case "travel": {
      const { data } = await supabase
        .from("travel_entries")
        .select("title, image_urls, status")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return { kind: "empty" };
      return {
        kind: "travel",
        label: data.status === "been" ? "Recently visited" : "Want to go",
        title: data.title,
        imageUrl: data.image_urls?.[0] ?? null,
      };
    }
    case "running": {
      const { data } = await supabase
        .from("runs")
        .select("distance_km, duration_minutes, occurred_on")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("occurred_on", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) return { kind: "empty" };
      return {
        kind: "run",
        distanceKm: Number(data.distance_km),
        durationMinutes: Number(data.duration_minutes),
        occurredOn: data.occurred_on,
      };
    }
    default: {
      const template = getHobbyTemplate(hobby.kind);
      const { data } = await supabase
        .from("hobby_memories")
        .select("*")
        .eq("user_id", userId)
        .eq("hobby_id", hobby.id)
        .order("occurred_on", { ascending: false })
        .limit(1);
      const current = computeCurrentActivity(template, data ?? []);
      if (!current) return { kind: "empty" };
      return { kind: "generic", label: current.label, title: current.title, sub: current.sub };
    }
  }
}
