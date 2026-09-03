export type HobbyFieldType = "text" | "number" | "textarea" | "select" | "rating";

export interface HobbyFieldDef {
  key: string;
  label: string;
  type: HobbyFieldType;
  placeholder?: string;
  unit?: string;
  options?: string[];
  required?: boolean;
}

export type HobbyStatFact =
  | { kind: "sumMonth"; field: string; label: string; unit?: string; minutesToHours?: boolean; decimals?: number }
  | { kind: "avg"; field: string; label: string; unit?: string; decimals?: number }
  | { kind: "countMonth"; label: string }
  | { kind: "countTotal"; label: string }
  | { kind: "countDistinct"; field: string; label: string };

export interface HobbyTemplate {
  key: string;
  label: string;
  sub: string;
  entryVerb: string;
  entriesLabel: string;
  currentLabel: string;
  primaryField?: string;
  secondaryField?: string;
  projectsLabel: string;
  fields: HobbyFieldDef[];
  statFacts: HobbyStatFact[];
  logsDuration?: boolean;
}

export const HOBBY_TEMPLATES: Record<string, HobbyTemplate> = {
  reading: {
    key: "reading",
    label: "Reading",
    sub: "Track what you're reading and what it left you with.",
    entryVerb: "Log a book",
    entriesLabel: "Reading log",
    currentLabel: "Currently reading",
    primaryField: "title",
    secondaryField: "author",
    projectsLabel: "Reading list",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "What are you reading?" },
      { key: "author", label: "Author", type: "text" },
      { key: "pagesRead", label: "Pages read", type: "number", unit: "pages" },
      { key: "rating", label: "Rating", type: "rating" },
    ],
    statFacts: [
      { kind: "sumMonth", field: "pagesRead", label: "Pages this month", unit: "pages" },
      { kind: "avg", field: "rating", label: "Avg rating", decimals: 1 },
    ],
  },
  running: {
    key: "running",
    logsDuration: true,
    label: "Running",
    sub: "Every run, its distance, and how it felt.",
    entryVerb: "Log a run",
    entriesLabel: "Running log",
    currentLabel: "Last run",
    primaryField: "route",
    secondaryField: "feeling",
    projectsLabel: "Training goals",
    fields: [
      { key: "distanceKm", label: "Distance", type: "number", unit: "km" },
      { key: "route", label: "Route", type: "text", placeholder: "Where did you go?" },
      { key: "feeling", label: "How it felt", type: "select", options: ["Easy", "Steady", "Hard"] },
    ],
    statFacts: [
      { kind: "sumMonth", field: "distanceKm", label: "km this month", unit: "km", decimals: 1 },
      { kind: "countMonth", label: "Runs this month" },
    ],
  },
  gym: {
    key: "gym",
    logsDuration: true,
    label: "Strength training",
    sub: "Workouts, sessions, and how heavy things got.",
    entryVerb: "Log a workout",
    entriesLabel: "Training log",
    currentLabel: "Last workout",
    primaryField: "workout",
    secondaryField: undefined,
    projectsLabel: "Training goals",
    fields: [
      { key: "workout", label: "Workout", type: "text", placeholder: "Push day, legs, full body…" },
      { key: "sets", label: "Sets", type: "number" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Sessions this month" },
      { kind: "sumMonth", field: "duration_minutes", label: "Hours this month", minutesToHours: true, decimals: 1 },
    ],
  },
  cooking: {
    key: "cooking",
    label: "Cooking & baking",
    sub: "What you made, where the recipe came from, how it went.",
    entryVerb: "Log a dish",
    entriesLabel: "Cooking log",
    currentLabel: "Last made",
    primaryField: "dish",
    secondaryField: "source",
    projectsLabel: "Recipes to try",
    fields: [
      { key: "dish", label: "Dish", type: "text", required: true, placeholder: "What did you make?" },
      { key: "source", label: "Recipe from", type: "text" },
      { key: "rating", label: "Rating", type: "rating" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Dishes this month" },
      { kind: "avg", field: "rating", label: "Avg rating", decimals: 1 },
    ],
  },
  gardening: {
    key: "gardening",
    label: "Gardening",
    sub: "What's growing, what you did, what needs attention.",
    entryVerb: "Log some garden time",
    entriesLabel: "Garden log",
    currentLabel: "Latest in the garden",
    primaryField: "plant",
    secondaryField: "action",
    projectsLabel: "Beds & projects",
    fields: [
      { key: "plant", label: "Plant", type: "text", placeholder: "What are you tending to?" },
      { key: "bed", label: "Bed / pot", type: "text" },
      {
        key: "action",
        label: "What you did",
        type: "select",
        options: ["Planted", "Watered", "Harvested", "Pruned", "Observed"],
      },
    ],
    statFacts: [
      { kind: "countMonth", label: "Logs this month" },
      { kind: "countDistinct", field: "plant", label: "Plants tracked" },
    ],
  },
  music: {
    key: "music",
    logsDuration: true,
    label: "Playing music",
    sub: "Practice sessions and the pieces you're working on.",
    entryVerb: "Log a practice session",
    entriesLabel: "Practice log",
    currentLabel: "Working on",
    primaryField: "piece",
    secondaryField: "instrument",
    projectsLabel: "Repertoire",
    fields: [
      { key: "piece", label: "Piece", type: "text", placeholder: "What are you practicing?" },
      { key: "instrument", label: "Instrument", type: "text" },
      { key: "focus", label: "What you worked on", type: "text" },
    ],
    statFacts: [
      { kind: "sumMonth", field: "duration_minutes", label: "Minutes this month" },
      { kind: "countDistinct", field: "piece", label: "Pieces worked on" },
    ],
  },
  photography: {
    key: "photography",
    label: "Photography",
    sub: "Shoots, subjects, and the keepers you walked away with.",
    entryVerb: "Log a shoot",
    entriesLabel: "Shoot log",
    currentLabel: "Latest shoot",
    primaryField: "subject",
    secondaryField: "location",
    projectsLabel: "Projects",
    fields: [
      { key: "subject", label: "Subject", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "gear", label: "Gear", type: "text" },
      { key: "keepers", label: "Keepers", type: "number" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Shoots this month" },
      { kind: "sumMonth", field: "keepers", label: "Keepers this month" },
    ],
  },
  visual_art: {
    key: "visual_art",
    logsDuration: true,
    label: "Painting & drawing",
    sub: "Pieces in progress and time spent in the studio.",
    entryVerb: "Log studio time",
    entriesLabel: "Studio log",
    currentLabel: "Working on",
    primaryField: "piece",
    secondaryField: "medium",
    projectsLabel: "Pieces",
    fields: [
      { key: "piece", label: "Piece", type: "text" },
      { key: "medium", label: "Medium", type: "text", placeholder: "Watercolor, oil, pencil…" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Pieces this month" },
      { kind: "sumMonth", field: "duration_minutes", label: "Hours this month", minutesToHours: true, decimals: 1 },
    ],
  },
  writing: {
    key: "writing",
    label: "Writing",
    sub: "Sessions, word counts, and what stage things are at.",
    entryVerb: "Log a writing session",
    entriesLabel: "Writing log",
    currentLabel: "Working on",
    primaryField: "piece",
    secondaryField: "stage",
    projectsLabel: "Pieces",
    fields: [
      { key: "piece", label: "Piece", type: "text" },
      { key: "words", label: "Words written", type: "number", unit: "words" },
      { key: "stage", label: "Stage", type: "select", options: ["Draft", "Editing", "Done"] },
    ],
    statFacts: [
      { kind: "sumMonth", field: "words", label: "Words this month" },
      { kind: "countMonth", label: "Sessions this month" },
    ],
  },
  gaming: {
    key: "gaming",
    logsDuration: true,
    label: "Gaming",
    sub: "What you're playing and the moments worth remembering.",
    entryVerb: "Log a session",
    entriesLabel: "Play log",
    currentLabel: "Currently playing",
    primaryField: "game",
    secondaryField: "platform",
    projectsLabel: "Backlog",
    fields: [
      { key: "game", label: "Game", type: "text" },
      { key: "platform", label: "Platform", type: "text" },
      { key: "highlight", label: "A moment worth remembering", type: "text" },
    ],
    statFacts: [
      { kind: "sumMonth", field: "duration_minutes", label: "Hours this month", minutesToHours: true, decimals: 1 },
      { kind: "countDistinct", field: "game", label: "Games this month" },
    ],
  },
  crafting: {
    key: "crafting",
    logsDuration: true,
    label: "Making & crafting",
    sub: "Knitting, woodworking, building — whatever you're making.",
    entryVerb: "Log some time",
    entriesLabel: "Workshop log",
    currentLabel: "Working on",
    primaryField: "project",
    secondaryField: "material",
    projectsLabel: "Projects",
    fields: [
      { key: "project", label: "Project", type: "text" },
      { key: "material", label: "Material", type: "text" },
      { key: "stage", label: "Stage", type: "select", options: ["Planning", "In progress", "Finished"] },
    ],
    statFacts: [
      { kind: "countMonth", label: "Sessions this month" },
      { kind: "sumMonth", field: "duration_minutes", label: "Hours this month", minutesToHours: true, decimals: 1 },
    ],
  },
  yoga_meditation: {
    key: "yoga_meditation",
    logsDuration: true,
    label: "Yoga & meditation",
    sub: "Sessions, styles, and how you felt after.",
    entryVerb: "Log a session",
    entriesLabel: "Practice log",
    currentLabel: "Last practice",
    primaryField: "practiceType",
    secondaryField: "feeling",
    projectsLabel: "Focus areas",
    fields: [
      { key: "practiceType", label: "Style / practice", type: "text" },
      {
        key: "feeling",
        label: "How you felt after",
        type: "select",
        options: ["Calm", "Focused", "Restless", "Energised"],
      },
    ],
    statFacts: [
      { kind: "countMonth", label: "Sessions this month" },
      { kind: "sumMonth", field: "duration_minutes", label: "Minutes this month" },
    ],
  },
  language_learning: {
    key: "language_learning",
    logsDuration: true,
    label: "Language learning",
    sub: "Practice time and what you worked on.",
    entryVerb: "Log a practice session",
    entriesLabel: "Practice log",
    currentLabel: "Working on",
    primaryField: "language",
    secondaryField: "activity",
    projectsLabel: "Goals",
    fields: [
      { key: "language", label: "Language", type: "text" },
      {
        key: "activity",
        label: "What you practiced",
        type: "text",
        placeholder: "Vocabulary, grammar, conversation…",
      },
    ],
    statFacts: [
      { kind: "sumMonth", field: "duration_minutes", label: "Minutes this month" },
      { kind: "countMonth", label: "Sessions this month" },
    ],
  },
  travel: {
    key: "travel",
    label: "Travel",
    sub: "Places you've been, and places you want to go.",
    entryVerb: "Add a place",
    entriesLabel: "Places",
    currentLabel: "Latest",
    projectsLabel: "Places",
    fields: [],
    statFacts: [],
  },
  film: {
    key: "film",
    label: "Film & TV",
    sub: "What you're watching, and what you thought of it.",
    entryVerb: "Log a film",
    entriesLabel: "Watch log",
    currentLabel: "Currently watching",
    primaryField: "title",
    secondaryField: "year",
    projectsLabel: "Watchlist",
    fields: [
      { key: "title", label: "Title", type: "text", required: true },
      { key: "year", label: "Year", type: "text" },
      { key: "rating", label: "Rating", type: "rating" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Watched this month" },
      { kind: "countTotal", label: "Total watched" },
    ],
  },
  hiking: {
    key: "hiking",
    label: "Hiking & outdoors",
    sub: "Trails walked, and trails still on the list.",
    entryVerb: "Log a hike",
    entriesLabel: "Hike log",
    currentLabel: "Last hike",
    primaryField: "trail",
    secondaryField: "location",
    projectsLabel: "Want to do",
    fields: [
      { key: "trail", label: "Trail", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "distanceKm", label: "Distance", type: "number", unit: "km" },
    ],
    statFacts: [
      { kind: "countTotal", label: "Hikes completed" },
      { kind: "sumMonth", field: "distanceKm", label: "km this month", unit: "km", decimals: 1 },
    ],
  },
  dance: {
    key: "dance",
    logsDuration: true,
    label: "Dance",
    sub: "Routines you're learning, and practice as it happens.",
    entryVerb: "Log practice",
    entriesLabel: "Practice log",
    currentLabel: "Working on",
    primaryField: "routine",
    secondaryField: "style",
    projectsLabel: "Routines",
    fields: [
      { key: "routine", label: "Routine", type: "text" },
      { key: "style", label: "Style", type: "text" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Sessions this month" },
      { kind: "sumMonth", field: "duration_minutes", label: "Minutes this month" },
    ],
  },
  fashion: {
    key: "fashion",
    label: "Fashion",
    sub: "Pieces, outfits, and looks you love.",
    entryVerb: "Add a piece",
    entriesLabel: "Pieces",
    currentLabel: "Latest",
    primaryField: "item",
    secondaryField: "category",
    projectsLabel: "Wishlist",
    fields: [
      { key: "item", label: "Item", type: "text" },
      { key: "category", label: "Category", type: "text" },
    ],
    statFacts: [{ kind: "countTotal", label: "Pieces logged" }],
  },
  collecting: {
    key: "collecting",
    label: "Collecting",
    sub: "What you've found and what you're still hunting for.",
    entryVerb: "Log a find",
    entriesLabel: "Collection log",
    currentLabel: "Latest find",
    primaryField: "item",
    secondaryField: "category",
    projectsLabel: "Want list",
    fields: [
      { key: "item", label: "Item", type: "text" },
      { key: "category", label: "Category", type: "text" },
      { key: "source", label: "Where found", type: "text" },
    ],
    statFacts: [
      { kind: "countMonth", label: "Added this month" },
      { kind: "countTotal", label: "Collection size" },
    ],
  },
  other: {
    key: "other",
    label: "Something else",
    sub: "Not on the list? Give it its own quiet space anyway.",
    entryVerb: "Log a moment",
    entriesLabel: "Log",
    currentLabel: "Latest",
    primaryField: undefined,
    secondaryField: undefined,
    projectsLabel: "Projects",
    fields: [],
    statFacts: [],
  },
};

export const HOBBY_TEMPLATE_LIST: HobbyTemplate[] = [
  HOBBY_TEMPLATES.reading,
  HOBBY_TEMPLATES.photography,
  HOBBY_TEMPLATES.visual_art,
  HOBBY_TEMPLATES.music,
  HOBBY_TEMPLATES.travel,
  HOBBY_TEMPLATES.running,
  HOBBY_TEMPLATES.cooking,
  HOBBY_TEMPLATES.writing,
  HOBBY_TEMPLATES.film,
  HOBBY_TEMPLATES.gardening,
  HOBBY_TEMPLATES.gaming,
  HOBBY_TEMPLATES.hiking,
  HOBBY_TEMPLATES.crafting,
  HOBBY_TEMPLATES.dance,
  HOBBY_TEMPLATES.fashion,
  HOBBY_TEMPLATES.other,
];

export function getHobbyTemplate(kind: string | null | undefined): HobbyTemplate {
  return (kind && HOBBY_TEMPLATES[kind]) || HOBBY_TEMPLATES.other;
}

/** Kinds with a fully bespoke page/data-model instead of the shared flexible template. */
export const BESPOKE_HOBBY_KINDS = ["reading", "photography", "visual_art", "travel", "running", "cooking"] as const;
export type BespokeHobbyKind = (typeof BESPOKE_HOBBY_KINDS)[number];

export function isBespokeHobbyKind(kind: string | null | undefined): kind is BespokeHobbyKind {
  return !!kind && (BESPOKE_HOBBY_KINDS as readonly string[]).includes(kind);
}
