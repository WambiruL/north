"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  clientSchema,
  projectSchema,
  taskSchema,
  focusTaskSchema,
  opportunitySchema,
  invoiceSchema,
  winSchema,
  workNoteSchema,
  contactSchema,
  type ClientInput,
  type ProjectInput,
  type TaskInput,
  type FocusTaskInput,
  type OpportunityInput,
  type InvoiceInput,
  type WinInput,
  type WorkNoteInput,
  type ContactInput,
} from "@/lib/validation/work";
import * as workService from "@/services/work";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateWork(projectId?: string) {
  revalidatePath("/work");
  if (projectId) revalidatePath(`/work/${projectId}`);
}

export async function saveClient(input: ClientInput, id?: string) {
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateWorkClient(supabase, userId, id, parsed.data);
    } else {
      await workService.createWorkClient(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeClient(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteWorkClient(supabase, userId, id);
  revalidateWork();
}

export async function saveProject(input: ProjectInput, id?: string) {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateProject(supabase, userId, id, parsed.data);
    } else {
      await workService.createProject(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork(id);
  return {};
}

export async function removeProject(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteProject(supabase, userId, id);
  revalidateWork();
}

export async function saveTask(workProjectId: string, input: TaskInput, id?: string) {
  const parsed = taskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateTask(supabase, userId, id, parsed.data);
    } else {
      await workService.createTask(supabase, userId, workProjectId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork(workProjectId);
  return {};
}

export async function removeTask(id: string, workProjectId: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteTask(supabase, userId, id);
  revalidateWork(workProjectId);
}

export async function toggleTask(id: string, workProjectId: string) {
  const { supabase, userId } = await requireUser();
  await workService.toggleTaskDone(supabase, userId, id);
  revalidateWork(workProjectId);
}

// ---------- Focus tasks (priorities + deadlines) ----------

export async function saveFocusTask(input: FocusTaskInput, id?: string) {
  const parsed = focusTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateFocusTask(supabase, userId, id, parsed.data);
    } else {
      await workService.createFocusTask(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function toggleFocusTask(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.toggleTaskDone(supabase, userId, id);
  revalidateWork();
}

export async function removeFocusTask(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteTask(supabase, userId, id);
  revalidateWork();
}

// ---------- Opportunities ----------

export async function saveOpportunity(input: OpportunityInput, id?: string) {
  const parsed = opportunitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateOpportunity(supabase, userId, id, parsed.data);
    } else {
      await workService.createOpportunity(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeOpportunity(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteOpportunity(supabase, userId, id);
  revalidateWork();
}

// ---------- Invoices ----------

export async function saveInvoice(input: InvoiceInput, id?: string) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateInvoice(supabase, userId, id, parsed.data);
    } else {
      await workService.createInvoice(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeInvoice(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteInvoice(supabase, userId, id);
  revalidateWork();
}

// ---------- Wins ----------

export async function saveWin(input: WinInput, id?: string) {
  const parsed = winSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateWin(supabase, userId, id, parsed.data);
    } else {
      await workService.createWin(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeWin(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteWin(supabase, userId, id);
  revalidateWork();
}

// ---------- Notes ----------

export async function saveWorkNote(input: WorkNoteInput, id?: string) {
  const parsed = workNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateWorkNote(supabase, userId, id, parsed.data);
    } else {
      await workService.createWorkNote(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeWorkNote(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteWorkNote(supabase, userId, id);
  revalidateWork();
}

// ---------- Contacts ----------

export async function saveContact(input: ContactInput, id?: string) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { supabase, userId } = await requireUser();

  try {
    if (id) {
      await workService.updateContact(supabase, userId, id, parsed.data);
    } else {
      await workService.createContact(supabase, userId, parsed.data);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong" };
  }

  revalidateWork();
  return {};
}

export async function removeContact(id: string) {
  const { supabase, userId } = await requireUser();
  await workService.deleteContact(supabase, userId, id);
  revalidateWork();
}
