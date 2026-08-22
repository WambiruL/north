"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  lifeAreaSchema,
  dreamSchema,
  visionItemSchema,
  futureHorizonSchema,
  bucketListItemSchema,
  manifestoPrincipleSchema,
  futureLetterSchema,
  type LifeAreaInput,
  type DreamInput,
  type VisionItemInput,
  type FutureHorizonInput,
  type BucketListItemInput,
  type ManifestoPrincipleInput,
  type FutureLetterInput,
} from "@/lib/validation/dream-life";
import * as dreamLifeService from "@/services/dream-life";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

// ---------- life areas ----------

export async function saveLifeArea(input: LifeAreaInput, id?: string) {
  const parsed = lifeAreaSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateLifeArea(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createLifeArea(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeLifeArea(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteLifeArea(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- dreams ----------

export async function saveDream(input: DreamInput, id?: string) {
  const parsed = dreamSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateDream(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createDream(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeDream(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteDream(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- vision items ----------

export async function saveVisionItem(input: VisionItemInput, id?: string) {
  const parsed = visionItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateVisionItem(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createVisionItem(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeVisionItem(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteVisionItem(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- future timeline (horizons) ----------

export async function saveFutureHorizon(input: FutureHorizonInput, id?: string) {
  const parsed = futureHorizonSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateFutureHorizon(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createFutureHorizon(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeFutureHorizon(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteFutureHorizon(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- bucket list ----------

export async function saveBucketListItem(input: BucketListItemInput, id?: string) {
  const parsed = bucketListItemSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateBucketListItem(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createBucketListItem(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeBucketListItem(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteBucketListItem(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- manifesto ----------

export async function saveManifestoPrinciple(input: ManifestoPrincipleInput, id?: string) {
  const parsed = manifestoPrincipleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateManifestoPrinciple(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createManifestoPrinciple(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeManifestoPrinciple(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteManifestoPrinciple(supabase, userId, id);
  revalidatePath("/dream-life");
}

// ---------- future letters (journal) ----------

export async function saveFutureLetter(input: FutureLetterInput, id?: string) {
  const parsed = futureLetterSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await dreamLifeService.updateFutureLetter(supabase, userId, id, parsed.data);
    } else {
      await dreamLifeService.createFutureLetter(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidatePath("/dream-life");
  return {};
}

export async function removeFutureLetter(id: string) {
  const { supabase, userId } = await requireUser();
  await dreamLifeService.deleteFutureLetter(supabase, userId, id);
  revalidatePath("/dream-life");
}
