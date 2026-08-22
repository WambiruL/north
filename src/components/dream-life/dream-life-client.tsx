"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Tables } from "@/types/database.types";
import type { DreamWithGoals } from "@/services/dream-life";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  saveFutureLetter,
  removeLifeArea,
  removeDream,
  removeVisionItem,
  removeFutureHorizon,
  removeBucketListItem,
  removeManifestoPrinciple,
  removeFutureLetter,
} from "@/server/actions/dream-life";
import { LifeAreaDialog } from "@/components/dream-life/life-area-dialog";
import { DreamDialog } from "@/components/dream-life/dream-dialog";
import { VisionItemDialog } from "@/components/dream-life/vision-item-dialog";
import { FutureHorizonDialog } from "@/components/dream-life/future-horizon-dialog";
import { BucketListDialog } from "@/components/dream-life/bucket-list-dialog";
import { ManifestoDialog } from "@/components/dream-life/manifesto-dialog";
import { FutureLetterDialog } from "@/components/dream-life/future-letter-dialog";
import { VisionBoardSection } from "@/components/dream-life/vision-board-section";
import { LifeAreasSection } from "@/components/dream-life/life-areas-section";
import { DreamsIntoActionSection } from "@/components/dream-life/dreams-into-action-section";
import { FutureTimelineSection } from "@/components/dream-life/future-timeline-section";
import { BucketListSection } from "@/components/dream-life/bucket-list-section";
import { ManifestoSection } from "@/components/dream-life/manifesto-section";
import { JournalSection } from "@/components/dream-life/journal-section";
import { ProgressSection } from "@/components/dream-life/progress-section";

type LifeArea = Tables<"life_areas">;
type VisionItem = Tables<"vision_items">;
type FutureHorizon = Tables<"future_horizons">;
type BucketListItem = Tables<"bucket_list_items">;
type ManifestoPrinciple = Tables<"manifesto_principles">;
type FutureLetter = Tables<"future_letters">;

const TABS = [
  { key: "vision", label: "Vision board" },
  { key: "areas", label: "Life areas" },
  { key: "action", label: "Dreams into action" },
  { key: "timeline", label: "Future timeline" },
  { key: "bucket", label: "Bucket list" },
  { key: "manifesto", label: "Manifesto" },
  { key: "journal", label: "Journal" },
  { key: "progress", label: "Progress" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const FUTURE_PROMPTS = [
  "Dear future me,",
  "A note for later,",
  "What I want you to remember,",
  "If you're reading this,",
  "In case you forgot,",
];

export function DreamLifeClient({
  lifeAreas,
  dreams,
  visionItems,
  horizons,
  bucketItems,
  principles,
  letters,
  autoOpen,
}: {
  lifeAreas: LifeArea[];
  dreams: DreamWithGoals[];
  visionItems: VisionItem[];
  horizons: FutureHorizon[];
  bucketItems: BucketListItem[];
  principles: ManifestoPrinciple[];
  letters: FutureLetter[];
  autoOpen: "dream_goal" | undefined;
}) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>(autoOpen === "dream_goal" ? "action" : "vision");

  // hero compose box
  const [letterDraft, setLetterDraft] = useState("");
  const [savingLetter, setSavingLetter] = useState(false);

  // dream dialog
  const [dreamDialogOpen, setDreamDialogOpen] = useState(autoOpen === "dream_goal");
  const [editingDream, setEditingDream] = useState<DreamWithGoals | undefined>(
    autoOpen === "dream_goal" && dreams.length > 0 ? dreams[0] : undefined,
  );

  // vision item dialog
  const [visionDialogOpen, setVisionDialogOpen] = useState(false);
  const [editingVisionItem, setEditingVisionItem] = useState<VisionItem | undefined>(undefined);

  // life area dialog
  const [lifeAreaDialogOpen, setLifeAreaDialogOpen] = useState(false);
  const [editingLifeArea, setEditingLifeArea] = useState<LifeArea | undefined>(undefined);

  // future horizon dialog
  const [horizonDialogOpen, setHorizonDialogOpen] = useState(false);
  const [editingHorizon, setEditingHorizon] = useState<FutureHorizon | undefined>(undefined);

  // bucket list dialog
  const [bucketDialogOpen, setBucketDialogOpen] = useState(false);
  const [editingBucketItem, setEditingBucketItem] = useState<BucketListItem | undefined>(undefined);

  // manifesto dialog
  const [manifestoDialogOpen, setManifestoDialogOpen] = useState(false);
  const [editingPrinciple, setEditingPrinciple] = useState<ManifestoPrinciple | undefined>(undefined);

  // future letter dialog (used from the Journal tab's own add button)
  const [letterDialogOpen, setLetterDialogOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<FutureLetter | undefined>(undefined);

  const lifeAreasById = useMemo(() => {
    const map = new Map<string, LifeArea>();
    for (const area of lifeAreas) map.set(area.id, area);
    return map;
  }, [lifeAreas]);

  const futureHint = useMemo(() => {
    if (letters.length === 0) return "Nothing written yet. Start with one line.";
    const s = letters.length === 1 ? "" : "s";
    return `${letters.length} letter${s} written to your future self so far`;
  }, [letters.length]);

  // ---- open helpers ----
  function openNewDream() {
    setEditingDream(undefined);
    setDreamDialogOpen(true);
  }
  function openEditDream(dream: DreamWithGoals) {
    setEditingDream(dream);
    setDreamDialogOpen(true);
  }
  function openNewVisionItem() {
    setEditingVisionItem(undefined);
    setVisionDialogOpen(true);
  }
  function openEditVisionItem(item: VisionItem) {
    setEditingVisionItem(item);
    setVisionDialogOpen(true);
  }
  function openNewLifeArea() {
    setEditingLifeArea(undefined);
    setLifeAreaDialogOpen(true);
  }
  function openEditLifeArea(area: LifeArea) {
    setEditingLifeArea(area);
    setLifeAreaDialogOpen(true);
  }
  function openNewHorizon() {
    setEditingHorizon(undefined);
    setHorizonDialogOpen(true);
  }
  function openEditHorizon(h: FutureHorizon) {
    setEditingHorizon(h);
    setHorizonDialogOpen(true);
  }
  function openNewBucketItem() {
    setEditingBucketItem(undefined);
    setBucketDialogOpen(true);
  }
  function openEditBucketItem(item: BucketListItem) {
    setEditingBucketItem(item);
    setBucketDialogOpen(true);
  }
  function openNewPrinciple() {
    setEditingPrinciple(undefined);
    setManifestoDialogOpen(true);
  }
  function openEditPrinciple(p: ManifestoPrinciple) {
    setEditingPrinciple(p);
    setManifestoDialogOpen(true);
  }
  function openNewLetter() {
    setEditingLetter(undefined);
    setLetterDialogOpen(true);
  }
  function openEditLetter(letter: FutureLetter) {
    setEditingLetter(letter);
    setLetterDialogOpen(true);
  }

  // ---- delete helpers ----
  async function handleDeleteDream(id: string) {
    await removeDream(id);
    toast.success("Dream removed");
    router.refresh();
  }
  async function handleDeleteVisionItem(id: string) {
    await removeVisionItem(id);
    toast.success("Removed from vision board");
    router.refresh();
  }
  async function handleDeleteLifeArea(id: string) {
    await removeLifeArea(id);
    toast.success("Life area removed");
    router.refresh();
  }
  async function handleDeleteHorizon(id: string) {
    await removeFutureHorizon(id);
    toast.success("Horizon removed");
    router.refresh();
  }
  async function handleDeleteBucketItem(id: string) {
    await removeBucketListItem(id);
    toast.success("Removed from the list");
    router.refresh();
  }
  async function handleDeletePrinciple(id: string) {
    await removeManifestoPrinciple(id);
    toast.success("Principle removed");
    router.refresh();
  }
  async function handleDeleteLetter(id: string) {
    await removeFutureLetter(id);
    toast.success("Letter removed");
    router.refresh();
  }

  async function handleSaveLetter() {
    const body = letterDraft.trim();
    if (!body) return;
    setSavingLetter(true);
    const prompt = FUTURE_PROMPTS[letters.length % FUTURE_PROMPTS.length];
    const result = await saveFutureLetter({ prompt, body });
    setSavingLetter(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Saved to your future self");
    setLetterDraft("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-[30px] bg-nav p-11 text-nav-ink">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-52 -top-44 h-[620px] w-[620px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,125,0,.26), transparent 66%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-64 -left-40 h-[520px] w-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(21,97,109,.5), transparent 68%)" }}
        />

        <div className="relative grid items-center gap-11 md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-[18px] text-[11px] font-extrabold uppercase tracking-[.18em] text-nav-muted">
              My north star
            </div>
            <h1 className="mb-[22px] max-w-[14em] text-[42px] font-extrabold leading-[1.14] tracking-tight">
              The life I am building
            </h1>
            <textarea
              value={letterDraft}
              onChange={(e) => setLetterDraft(e.target.value)}
              rows={4}
              placeholder="Dear future me, here's where things stand…"
              className="w-full max-w-[44em] resize-y rounded-[18px] border border-nav-line bg-[rgba(255,236,209,.08)] px-[22px] py-5 font-sans text-[18px] leading-relaxed text-nav-ink outline-none placeholder:text-nav-muted focus:border-amber"
            />
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="text-[12.5px] font-bold text-nav-muted">{futureHint}</span>
              <span className="h-1 w-1 rounded-full bg-nav-muted" />
              <span className="text-[13.5px] italic text-nav-ink">Slower, and better.</span>
              {letterDraft.trim().length > 0 && (
                <Button size="sm" variant="accent" onClick={handleSaveLetter} disabled={savingLetter}>
                  {savingLetter ? "Saving…" : "Save to your future self"}
                </Button>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex h-[230px] items-center justify-center rounded-[22px] border border-nav-line bg-[rgba(255,236,209,.06)]">
              <span className="text-[12px] font-bold uppercase tracking-wide text-nav-muted">
                your future self
              </span>
            </div>
          </div>
        </div>

        <div className="relative mt-[34px] flex flex-wrap gap-1.5 rounded-[20px] border border-nav-line bg-[rgba(255,236,209,.08)] p-[5px]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-[14px] px-4 py-2.5 text-[13px] font-bold transition-colors",
                activeTab === tab.key
                  ? "bg-amber text-[#001524]"
                  : "text-nav-muted hover:text-nav-ink",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "vision" && (
        <VisionBoardSection
          visionItems={visionItems}
          lifeAreasById={lifeAreasById}
          onAdd={openNewVisionItem}
          onEdit={openEditVisionItem}
          onDelete={handleDeleteVisionItem}
        />
      )}

      {activeTab === "areas" && (
        <LifeAreasSection
          lifeAreas={lifeAreas}
          onAdd={openNewLifeArea}
          onEdit={openEditLifeArea}
          onDelete={handleDeleteLifeArea}
        />
      )}

      {activeTab === "action" && (
        <DreamsIntoActionSection
          dreams={dreams}
          onAdd={openNewDream}
          onEdit={openEditDream}
          onDelete={handleDeleteDream}
        />
      )}

      {activeTab === "timeline" && (
        <FutureTimelineSection
          horizons={horizons}
          onAdd={openNewHorizon}
          onEdit={openEditHorizon}
          onDelete={handleDeleteHorizon}
        />
      )}

      {activeTab === "bucket" && (
        <BucketListSection
          items={bucketItems}
          onAdd={openNewBucketItem}
          onEdit={openEditBucketItem}
          onDelete={handleDeleteBucketItem}
        />
      )}

      {activeTab === "manifesto" && (
        <ManifestoSection
          principles={principles}
          onAdd={openNewPrinciple}
          onEdit={openEditPrinciple}
          onDelete={handleDeletePrinciple}
        />
      )}

      {activeTab === "journal" && (
        <JournalSection
          letters={letters}
          onAdd={openNewLetter}
          onEdit={openEditLetter}
          onDelete={handleDeleteLetter}
        />
      )}

      {activeTab === "progress" && (
        <ProgressSection
          dreams={dreams}
          visionItems={visionItems}
          letters={letters}
          bucketItems={bucketItems}
        />
      )}

      <DreamDialog
        open={dreamDialogOpen}
        onOpenChange={setDreamDialogOpen}
        dream={editingDream}
        lifeAreas={lifeAreas}
      />
      <VisionItemDialog
        open={visionDialogOpen}
        onOpenChange={setVisionDialogOpen}
        visionItem={editingVisionItem}
        dreams={dreams}
        lifeAreas={lifeAreas}
      />
      <LifeAreaDialog open={lifeAreaDialogOpen} onOpenChange={setLifeAreaDialogOpen} lifeArea={editingLifeArea} />
      <FutureHorizonDialog
        open={horizonDialogOpen}
        onOpenChange={setHorizonDialogOpen}
        horizon={editingHorizon}
      />
      <BucketListDialog open={bucketDialogOpen} onOpenChange={setBucketDialogOpen} item={editingBucketItem} />
      <ManifestoDialog
        open={manifestoDialogOpen}
        onOpenChange={setManifestoDialogOpen}
        principle={editingPrinciple}
      />
      <FutureLetterDialog open={letterDialogOpen} onOpenChange={setLetterDialogOpen} letter={editingLetter} />
    </div>
  );
}
