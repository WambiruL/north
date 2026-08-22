"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactInput } from "@/lib/validation/work";
import { saveContact } from "@/server/actions/work";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Contact = Tables<"work_contacts">;

export interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact;
}

function toDefaults(contact?: Contact): ContactInput {
  if (contact) {
    return {
      name: contact.name,
      role: contact.role ?? undefined,
      organization: contact.organization ?? undefined,
      howMet: contact.how_met ?? undefined,
      note: contact.note ?? undefined,
      lastContactOn: contact.last_contact_on ?? undefined,
    };
  }
  return { name: "", role: "", organization: "", howMet: "", note: "", lastContactOn: undefined };
}

export function ContactDialog({ open, onOpenChange, contact }: ContactDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema) as unknown as Resolver<ContactInput>,
    values: toDefaults(contact),
  });

  async function onSubmit(values: ContactInput) {
    setSubmitting(true);
    const result = await saveContact(values, contact?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(contact ? "Updated" : "Added");
    router.refresh();
    onOpenChange(false);
    if (!contact) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "Add someone"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Sofia Reyes" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role")} placeholder="Head of Design" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="organization">Organization</Label>
              <Input id="organization" {...register("organization")} placeholder="Ovist" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="howMet">How you know them</Label>
              <Input id="howMet" {...register("howMet")} placeholder="Introduced by…" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastContactOn">Last contact</Label>
              <Input id="lastContactOn" type="date" {...register("lastContactOn")} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Notes</Label>
            <Textarea id="note" rows={3} {...register("note")} placeholder="Optional" />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : contact ? "Save changes" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
