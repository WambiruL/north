"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { AddRowButton, RowActions } from "@/components/work/shared";
import { ContactDialog } from "@/components/work/contact-dialog";
import { removeContact } from "@/server/actions/work";
import { useConfirm } from "@/components/ui/confirm-dialog";

type Contact = Tables<"work_contacts">;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function NetworkTab({ contacts }: { contacts: Contact[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Contact | undefined>(undefined);

  function openNew() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditing(contact);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const contact = contacts.find((c) => c.id === id);
    const ok = await confirm({
      title: `Delete "${contact?.name ?? "this contact"}"?`,
      description: "This can't be undone.",
    });
    if (!ok) return;
    await removeContact(id);
    toast.success("Removed");
    router.refresh();
  }

  if (contacts.length === 0) {
    return (
      <>
        <EmptyState
          icon={<UserRound className="h-8 w-8" />}
          title="No one logged yet"
          description="Add the people who matter to your work — collaborators, mentors, referrals."
          action={
            <Button variant="accent" onClick={openNew}>
              Add someone
            </Button>
          }
        />
        <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} contact={editing} />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-start gap-4 rounded-[18px] border border-line bg-surface p-6 shadow-north-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-[13px] font-bold text-ink">
              {initials(contact.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 text-[18px] font-bold text-ink">{contact.name}</div>
              {(contact.role || contact.organization) && (
                <div className="mb-3 text-[13.5px] text-muted">
                  {[contact.role, contact.organization].filter(Boolean).join(" · ")}
                </div>
              )}
              {contact.how_met && (
                <div className="mb-2 text-[14px] leading-relaxed text-muted">{contact.how_met}</div>
              )}
              {contact.note && <p className="mb-2.5 text-[14.5px] leading-relaxed text-ink">{contact.note}</p>}
              {contact.last_contact_on && (
                <div className="text-[11px] font-extrabold uppercase tracking-widest text-faint">
                  Last: {format(parseISO(contact.last_contact_on), "d MMM yyyy")}
                </div>
              )}
              <RowActions onEdit={() => openEdit(contact)} onDelete={() => handleDelete(contact.id)} />
            </div>
          </div>
        ))}
      </div>
      <AddRowButton onClick={openNew}>Add someone</AddRowButton>

      <ContactDialog open={dialogOpen} onOpenChange={setDialogOpen} contact={editing} />
    </div>
  );
}
