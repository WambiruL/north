import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserAndProfile } from "@/services/profile";
import { getHobbyDetail } from "@/services/hobbies";
import { getHobbyTemplate } from "@/lib/constants/hobby-templates";
import { listBooks } from "@/services/books";
import { listRecipes, listCookingLogs } from "@/services/cooking";
import { listPhotos, listPhotoSeries } from "@/services/photography";
import { listArtworks } from "@/services/art";
import { listTravelEntries } from "@/services/travel";
import { listRuns } from "@/services/running";
import { BooksPage } from "@/components/hobbies/books/books-page";
import { CookingPage } from "@/components/hobbies/cooking/cooking-page";
import { PhotographyPage } from "@/components/hobbies/photography/photography-page";
import { ArtPage } from "@/components/hobbies/art/art-page";
import { TravelPage } from "@/components/hobbies/travel/travel-page";
import { RunningPage } from "@/components/hobbies/running/running-page";
import { FlexibleHobbyPage } from "@/components/hobbies/flexible/flexible-hobby-page";

export const metadata: Metadata = { title: "Hobby" };

export default async function HobbyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const user = (await getCurrentUserAndProfile())?.user ?? null;
  if (!user) notFound();

  const { data: hobby } = await supabase
    .from("hobbies")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!hobby) notFound();

  switch (hobby.kind) {
    case "reading": {
      const books = await listBooks(supabase, user.id, id);
      return <BooksPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} books={books} />;
    }
    case "cooking": {
      const [recipes, logs] = await Promise.all([
        listRecipes(supabase, user.id, id),
        listCookingLogs(supabase, user.id, id),
      ]);
      return (
        <CookingPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} recipes={recipes} logs={logs} />
      );
    }
    case "photography": {
      const [photos, series] = await Promise.all([
        listPhotos(supabase, user.id, id),
        listPhotoSeries(supabase, user.id, id),
      ]);
      return (
        <PhotographyPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} photos={photos} series={series} />
      );
    }
    case "visual_art": {
      const artworks = await listArtworks(supabase, user.id, id);
      return <ArtPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} artworks={artworks} />;
    }
    case "travel": {
      const entries = await listTravelEntries(supabase, user.id, id);
      return <TravelPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} entries={entries} />;
    }
    case "running": {
      const runs = await listRuns(supabase, user.id, id);
      return <RunningPage hobbyId={id} hobbyName={hobby.name} description={hobby.description} runs={runs} />;
    }
    default: {
      const detail = await getHobbyDetail(supabase, user.id, id);
      if (!detail) notFound();
      const template = getHobbyTemplate(hobby.kind);
      return <FlexibleHobbyPage hobby={hobby} template={template} detail={detail} />;
    }
  }
}
