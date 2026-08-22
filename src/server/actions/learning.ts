"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  learningPathSchema,
  courseSchema,
  shelfItemSchema,
  momentSchema,
  noteSchema,
  projectSchema,
  sessionSchema,
  journalEntrySchema,
  certificateSchema,
  curiositySchema,
  type LearningPathInput,
  type CourseInput,
  type ShelfItemInput,
  type MomentInput,
  type NoteInput,
  type ProjectInput,
  type SessionInput,
  type JournalEntryInput,
  type CertificateInput,
  type CuriosityInput,
} from "@/lib/validation/learning";
import * as learningService from "@/services/learning";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

export async function saveLearningPath(input: LearningPathInput, id?: string) {
  const parsed = learningPathSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateLearningPath(supabase, userId, id, parsed.data);
    } else {
      await learningService.createLearningPath(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeLearningPath(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteLearningPath(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveCourse(input: CourseInput, id?: string) {
  const parsed = courseSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateCourse(supabase, userId, id, parsed.data);
    } else {
      await learningService.createCourse(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeCourse(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteCourse(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveShelfItem(input: ShelfItemInput, id?: string) {
  const parsed = shelfItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await learningService.updateShelfItem(supabase, userId, id, parsed.data);
    } else {
      await learningService.createShelfItem(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/learning");
  return {};
}

export async function removeShelfItem(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteShelfItem(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveMoment(input: MomentInput, id?: string) {
  const parsed = momentSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateMoment(supabase, userId, id, parsed.data);
    } else {
      await learningService.createMoment(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeMoment(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteMoment(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveNote(input: NoteInput, id?: string) {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateNote(supabase, userId, id, parsed.data);
    } else {
      await learningService.createNote(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeNote(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteNote(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveProject(input: ProjectInput, id?: string) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateProject(supabase, userId, id, parsed.data);
    } else {
      await learningService.createProject(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeProject(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteProject(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveSession(input: SessionInput, id?: string) {
  const parsed = sessionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateSession(supabase, userId, id, parsed.data);
    } else {
      await learningService.createSession(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeSession(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteSession(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveJournalEntry(input: JournalEntryInput, id?: string) {
  const parsed = journalEntrySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateJournalEntry(supabase, userId, id, parsed.data);
    } else {
      await learningService.createJournalEntry(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeJournalEntry(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteJournalEntry(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveCertificate(input: CertificateInput, id?: string) {
  const parsed = certificateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateCertificate(supabase, userId, id, parsed.data);
    } else {
      await learningService.createCertificate(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeCertificate(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteCertificate(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveCuriosity(input: CuriosityInput, id?: string) {
  const parsed = curiositySchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const { supabase, userId } = await requireUser();
  try {
    if (id) {
      await learningService.updateCuriosity(supabase, userId, id, parsed.data);
    } else {
      await learningService.createCuriosity(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}

export async function removeCuriosity(id: string) {
  const { supabase, userId } = await requireUser();
  await learningService.deleteCuriosity(supabase, userId, id);
  revalidatePath("/learning");
}

export async function saveFocus(focus: string) {
  const { supabase, userId } = await requireUser();
  try {
    await learningService.saveLearningFocus(supabase, userId, focus);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }
  revalidatePath("/learning");
  return {};
}
