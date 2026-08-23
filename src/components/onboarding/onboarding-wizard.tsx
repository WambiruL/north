"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mark } from "@/components/ui/mark";
import { MoodPicker } from "@/components/check-ins/mood-picker";
import { ALL_SPACES } from "@/lib/constants/spaces";
import { ONBOARDING_SEASONS, DREAM_SUGGESTIONS } from "@/lib/validation/onboarding";
import { homeDensityValues, type PreferencesInput } from "@/lib/validation/settings";
import {
  saveOnboardingSeasons,
  saveOnboardingAreas,
  addOnboardingDream,
  saveOnboardingCheckIn,
  saveOnboardingPersonalization,
  completeOnboarding,
} from "@/server/actions/onboarding";

type StepKey = "arrival" | "season" | "areas" | "dreams" | "mini" | "personalize" | "arrive";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "arrival", label: "Arrival" },
  { key: "season", label: "Season" },
  { key: "areas", label: "Areas" },
  { key: "dreams", label: "Dreams" },
  { key: "mini", label: "Preview" },
  { key: "personalize", label: "Personalize" },
  { key: "arrive", label: "Arrive" },
];

const THEMES: { value: "light" | "dark"; label: string; note: string; bg: string; surface: string }[] = [
  { value: "light", label: "Cream", note: "Paper, for daylight and writing", bg: "#F2E8D6", surface: "#FFF9EF" },
  { value: "dark", label: "Midnight", note: "Navy, for evenings and check-ins", bg: "#001524", surface: "#04202C" },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-[11px] font-extrabold uppercase tracking-[.15em] text-faint">{children}</div>
  );
}

function StepTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="mb-3 font-display text-[38px] font-semibold leading-[1.15] tracking-tight text-ink sm:text-[46px]">
      {children}
    </h1>
  );
}

function StepSub({ children }: { children: React.ReactNode }) {
  return <p className="mb-9 max-w-[34em] text-[16px] leading-relaxed text-muted">{children}</p>;
}

export function OnboardingWizard({
  fullName,
  initialSeasons,
}: {
  fullName: string;
  initialSeasons: string[];
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const [seasons, setSeasons] = useState<string[]>(initialSeasons);
  const [areas, setAreas] = useState<string[]>([]);
  const [dreams, setDreams] = useState<{ id: string; title: string }[]>([]);
  const [dreamText, setDreamText] = useState("");

  const [mood, setMood] = useState(3);
  const [note, setNote] = useState("");
  const [taskDone, setTaskDone] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [homeDensity, setHomeDensity] = useState<PreferencesInput["homeDensity"]>("full");

  const step = STEPS[stepIndex];

  function toggleSeason(season: string) {
    setSeasons((prev) => (prev.includes(season) ? prev.filter((s) => s !== season) : [...prev, season]));
  }

  function toggleArea(key: string) {
    setAreas((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  async function addDream(title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    const result = await addOnboardingDream({ title: trimmed });
    if (result?.error || !result.dream) {
      toast.error(result?.error ?? "Couldn't save that");
      return;
    }
    setDreams((prev) => [...prev, { id: result.dream.id, title: result.dream.title }]);
    setDreamText("");
  }

  async function goNext() {
    setSaving(true);
    try {
      if (step.key === "season") await saveOnboardingSeasons({ seasons });
      if (step.key === "areas") await saveOnboardingAreas({ spaceKeys: areas });
      if (step.key === "mini" && (note.trim() || mood !== 3)) {
        await saveOnboardingCheckIn({ mood, note: note.trim() || undefined });
      }
      if (step.key === "personalize") {
        if (typeof window !== "undefined") {
          localStorage.setItem("north-theme", theme);
          document.documentElement.setAttribute("data-theme", theme);
        }
        await saveOnboardingPersonalization({
          reduceMotion: false,
          openCheckInAfterSignIn: false,
          showSeasonCard: true,
          homeDensity,
        });
      }
    } catch {
      toast.error("Something went wrong, but you can keep going");
    }
    setSaving(false);

    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function finish() {
    setSaving(true);
    await completeOnboarding();
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="relative flex flex-col justify-between overflow-hidden bg-nav px-7 py-9 text-nav-ink">
        <div
          className="pointer-events-none absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(21,97,109,.5), transparent 68%)" }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-nav-ink">
            <span className="h-2 w-2 rotate-45 bg-amber" />
          </span>
          <span className="text-[14px] font-extrabold tracking-[.18em]">NORTH</span>
        </div>

        <div className="relative flex flex-col gap-0.5">
          {STEPS.map((s, i) => {
            const active = i === stepIndex;
            const done = i < stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => (done ? setStepIndex(i) : undefined)}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-opacity",
                  done ? "cursor-pointer opacity-80" : active ? "opacity-100" : "cursor-default opacity-40",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-full",
                    active ? "bg-amber" : done ? "bg-nav-ink" : "border border-nav-muted bg-transparent",
                  )}
                />
                <span className="text-[13.5px] font-bold">{s.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative text-[12.5px] leading-relaxed text-nav-muted">
          Everything you set here can change later, from Settings or the space itself.
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center px-6 py-14 sm:px-12 md:px-[clamp(24px,5vw,72px)]">
          <div className="w-full">
            {step.key === "arrival" && (
              <div className="max-w-[640px]">
                <div className="relative mb-10 flex h-[118px] w-[118px] items-center justify-center rounded-full border border-line bg-surface">
                  <div className="absolute inset-3.5 rounded-full border border-dashed border-line-2" />
                  <div className="h-[62px] w-[3px] rounded-[3px] bg-gradient-to-b from-amber to-line" />
                </div>
                <h1 className="mb-5 font-display text-[54px] font-semibold leading-[1.05] tracking-tight text-ink sm:text-[66px]">
                  Welcome to North.
                </h1>
                <p className="mb-11 max-w-[26em] text-[19px] leading-relaxed text-muted sm:text-[20px]">
                  A place to understand where you are, decide where you are going, and keep the pieces of
                  your life together.
                </p>
                <Button variant="accent" size="lg" onClick={goNext}>
                  Let us set up your North
                </Button>
              </div>
            )}

            {step.key === "season" && (
              <div className="max-w-[840px]">
                <Eyebrow>Where you are</Eyebrow>
                <StepTitle>What season are you in?</StepTitle>
                <StepSub>Pick as many as are true. It only shapes what North puts in front of you.</StepSub>
                <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ONBOARDING_SEASONS.map((season) => {
                    const on = seasons.includes(season);
                    return (
                      <button
                        key={season}
                        aria-pressed={on}
                        onClick={() => toggleSeason(season)}
                        className={cn(
                          "flex flex-col items-start gap-3 rounded-[16px] border p-4 text-left transition-transform hover:-translate-y-0.5",
                          on ? "border-teal bg-teal-soft" : "border-line bg-surface",
                        )}
                      >
                        <Mark tone={on ? "teal" : "muted"} size={9} />
                        <span className="text-[14.5px] font-bold text-ink">{season}</span>
                      </button>
                    );
                  })}
                </div>
                <StepFooterActions onNext={goNext} onSkip={goNext} saving={saving} skipLabel="Skip for now" />
              </div>
            )}

            {step.key === "areas" && (
              <div className="max-w-[880px]">
                <Eyebrow>What North holds</Eyebrow>
                <StepTitle>What do you want North to help you hold onto?</StepTitle>
                <StepSub>
                  These become the parts of North you see first. You can change it whenever, from the
                  workspace switcher in the sidebar.
                </StepSub>
                <div className="mb-10 flex flex-wrap gap-2.5">
                  {ALL_SPACES.filter((s) => s.key !== "settings").map((space) => {
                    const on = areas.includes(space.key);
                    return (
                      <button
                        key={space.key}
                        aria-pressed={on}
                        onClick={() => toggleArea(space.key)}
                        className={cn(
                          "rounded-full border px-4 py-2.5 text-[14px] font-bold transition-transform hover:-translate-y-0.5",
                          on ? "border-teal bg-teal-soft text-teal" : "border-line bg-surface text-ink",
                        )}
                      >
                        {space.label}
                      </button>
                    );
                  })}
                </div>
                <StepFooterActions onNext={goNext} onSkip={goNext} saving={saving} skipLabel="Skip for now" />
              </div>
            )}

            {step.key === "dreams" && (
              <div className="max-w-[860px]">
                <Eyebrow>Somewhere ahead</Eyebrow>
                <StepTitle>What are you moving toward?</StepTitle>
                <StepSub>
                  One line is enough. Nothing here is a commitment, and not knowing yet is a legitimate
                  answer.
                </StepSub>
                <div className="mb-5 flex max-w-[620px] gap-3">
                  <Input
                    value={dreamText}
                    onChange={(e) => setDreamText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDream(dreamText);
                      }
                    }}
                    placeholder="Build a practice I am proud of"
                  />
                  <Button variant="primary" onClick={() => addDream(dreamText)}>
                    Add
                  </Button>
                </div>
                <div className="mb-4 flex flex-wrap gap-2">
                  {DREAM_SUGGESTIONS.filter((s) => !dreams.some((d) => d.title === s)).map((s) => (
                    <button
                      key={s}
                      onClick={() => addDream(s)}
                      className="rounded-full border border-dashed border-line px-4 py-2 text-[13.5px] font-bold text-muted transition-colors hover:border-amber hover:text-amber"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mb-9 flex min-h-[96px] flex-wrap items-start gap-2.5 rounded-[20px] border border-line-2 bg-surface p-6">
                  {dreams.length === 0 ? (
                    <span className="text-[14.5px] font-bold text-faint">
                      Your constellation is empty for now. That is allowed.
                    </span>
                  ) : (
                    dreams.map((d) => (
                      <span
                        key={d.id}
                        className="flex items-center gap-2 rounded-full border border-line-2 bg-raise px-3.5 py-2 text-[13.5px] font-semibold text-ink"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                        {d.title}
                      </span>
                    ))
                  )}
                </div>
                <StepFooterActions
                  onNext={goNext}
                  onSkip={goNext}
                  saving={saving}
                  skipLabel="I will figure this out later"
                />
              </div>
            )}

            {step.key === "mini" && (
              <div className="grid max-w-[960px] grid-cols-1 gap-10 lg:grid-cols-2">
                <div>
                  <Eyebrow>A first look</Eyebrow>
                  <StepTitle>This is your North.</StepTitle>
                  <StepSub>Not a tour. What you enter here is kept — it&apos;s today&apos;s real check-in.</StepSub>
                  <div className="overflow-hidden rounded-[24px] border border-line bg-surface">
                    <div className="bg-nav px-6 py-5 text-nav-ink">
                      <div className="mb-1.5 text-[11px] font-extrabold uppercase tracking-[.15em] text-nav-muted">
                        Today
                      </div>
                      <div className="font-display text-[26px] font-semibold">Good to see you, {fullName.split(" ")[0]}.</div>
                    </div>
                    <div className="flex flex-col gap-6 p-6">
                      <div>
                        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-faint">
                          Your check-in
                        </div>
                        <div className="mb-3.5 text-[15.5px] font-bold text-ink">How are you feeling today?</div>
                        <MoodPicker value={mood} onChange={setMood} />
                        <Input
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="A line about today, if you want one"
                          className="mt-3.5"
                        />
                      </div>
                      <div className="border-t border-line-2 pt-5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-faint">Your direction</div>
                        <div className="mt-2 text-[15.5px] font-extrabold text-ink">
                          {areas.length > 0
                            ? ALL_SPACES.find((s) => s.key === areas[0])?.label
                            : "Whatever you point North at next"}
                        </div>
                      </div>
                      <div className="border-t border-line-2 pt-5">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-faint">
                          One small thing
                        </div>
                        <button
                          onClick={() => setTaskDone((v) => !v)}
                          className="mt-3 flex items-center gap-3 text-left"
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-[6px] border",
                              taskDone ? "border-teal bg-teal" : "border-line",
                            )}
                          >
                            {taskDone && <Check className="h-3.5 w-3.5 text-white" />}
                          </span>
                          <span className={cn("text-[15px]", taskDone ? "text-faint line-through" : "text-ink")}>
                            Write down what today is for
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-faint">And it connects</div>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {["Check-ins", "Dream Life", "Career", "Work"].map((label, i, arr) => (
                      <div key={label} className="flex flex-col gap-2.5">
                        <div className="rounded-[12px] border border-line bg-surface px-4 py-3 text-[13.5px] font-bold text-ink">
                          {label}
                        </div>
                        {i < arr.length - 1 && <div className="ml-6 h-3.5 w-px bg-line" />}
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-[14.5px] leading-relaxed text-muted">
                    Everything can connect here. A dream becomes a goal, a goal becomes a week, a week
                    becomes a Tuesday.
                  </p>
                  <div className="mt-7">
                    <Button variant="accent" size="lg" onClick={goNext} disabled={saving}>
                      {saving ? "Saving…" : "Continue"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {step.key === "personalize" && (
              <div className="max-w-[820px]">
                <Eyebrow>Yours</Eyebrow>
                <StepTitle>Let us make this yours.</StepTitle>
                <StepSub>Two small decisions. Both live in Settings afterwards.</StepSub>

                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-faint">Appearance</div>
                <div className="mb-9 flex gap-3">
                  {THEMES.map((t) => (
                    <button
                      key={t.value}
                      aria-pressed={theme === t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        "flex items-center gap-3.5 rounded-[16px] border p-4 text-left transition-transform hover:-translate-y-0.5",
                        theme === t.value ? "border-teal" : "border-line",
                      )}
                    >
                      <span
                        className="h-9 w-9 shrink-0 rounded-full border border-line-2"
                        style={{ background: t.bg }}
                      />
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[15px] font-extrabold text-ink">{t.label}</span>
                        <span className="text-[12.5px] text-muted">{t.note}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-faint">
                  How the home page should feel
                </div>
                <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {homeDensityValues.map((d) => (
                    <button
                      key={d}
                      aria-pressed={homeDensity === d}
                      onClick={() => setHomeDensity(d)}
                      className={cn(
                        "flex flex-col gap-1.5 rounded-[16px] border p-4 text-left transition-transform hover:-translate-y-0.5",
                        homeDensity === d ? "border-teal bg-teal-soft" : "border-line bg-surface",
                      )}
                    >
                      <span className="text-[14.5px] font-extrabold capitalize text-ink">{d}</span>
                      <span className="text-[12.5px] leading-relaxed text-muted">
                        {d === "focused" && "Just your check-in and today's priorities."}
                        {d === "balanced" && "Adds the life snapshot and season highlight."}
                        {d === "full" && "Everything, including recent activity and wins."}
                      </span>
                    </button>
                  ))}
                </div>
                <StepFooterActions onNext={goNext} onSkip={goNext} saving={saving} skipLabel="Skip for now" />
              </div>
            )}

            {step.key === "arrive" && (
              <div className="max-w-[680px]">
                <Eyebrow>Ready</Eyebrow>
                <h1 className="mb-5 font-display text-[46px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[58px]">
                  Your North is ready.
                </h1>
                <p className="mb-8 max-w-[24em] text-[19px] leading-relaxed text-muted sm:text-[20px]">
                  You do not have to figure everything out today. Just start from here.
                </p>
                <div className="mb-9 flex flex-col gap-3.5 rounded-[22px] border border-line-2 bg-surface p-6">
                  <SummaryRow label="Season" value={seasons.length ? seasons.join(", ") : "Not set yet"} />
                  <SummaryRow
                    label="Focus areas"
                    value={
                      areas.length
                        ? areas.map((k) => ALL_SPACES.find((s) => s.key === k)?.label).join(", ")
                        : "Not set yet"
                    }
                  />
                  <SummaryRow
                    label="Dreams"
                    value={dreams.length ? `${dreams.length} added` : "None yet — add them anytime"}
                  />
                  <SummaryRow label="Appearance" value={theme === "light" ? "Cream" : "Midnight"} />
                </div>
                <Button variant="accent" size="lg" onClick={finish} disabled={saving}>
                  {saving ? "Entering…" : "Enter North"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 border-t border-line-2 px-6 py-6 sm:px-12 md:px-[clamp(24px,5vw,72px)]">
          {stepIndex > 0 && (
            <button onClick={goBack} className="text-[13.5px] font-bold text-muted hover:text-ink">
              Back
            </button>
          )}
          <span className="text-[13px] font-bold text-faint">
            Step {stepIndex + 1} of {STEPS.length}
          </span>
          <span className="flex-1" />
          {step.key !== "arrive" && (
            <button onClick={finish} className="text-[13.5px] font-bold text-faint hover:text-ink">
              Skip setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepFooterActions({
  onNext,
  onSkip,
  saving,
  skipLabel,
}: {
  onNext: () => void;
  onSkip: () => void;
  saving: boolean;
  skipLabel: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <Button variant="accent" size="lg" onClick={onNext} disabled={saving}>
        {saving ? "Saving…" : "Continue"}
      </Button>
      <button onClick={onSkip} className="text-[13.5px] font-bold text-muted hover:text-ink" disabled={saving}>
        {skipLabel}
      </button>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-4">
      <span className="w-[110px] shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-faint">
        {label}
      </span>
      <span className="text-[15px] font-bold leading-snug text-ink">{value}</span>
    </div>
  );
}
