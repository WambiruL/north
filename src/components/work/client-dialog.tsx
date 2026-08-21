"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { clientSchema, type ClientInput } from "@/lib/validation/work";
import { saveClient } from "@/server/actions/work";
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

type ClientRow = Tables<"clients">;

export interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientRow;
  onSaved?: (client: ClientRow) => void;
}

function toDefaults(client?: ClientRow): ClientInput {
  return {
    name: client?.name ?? "",
    notes: client?.notes ?? undefined,
  };
}

export function ClientDialog({ open, onOpenChange, client, onSaved }: ClientDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    values: toDefaults(client),
  });

  async function onSubmit(values: ClientInput) {
    setSubmitting(true);
    const result = await saveClient(values, client?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(client ? "Client updated" : "Client added");
    router.refresh();
    onOpenChange(false);
    if (!client) reset(toDefaults(undefined));
    onSaved?.(client as ClientRow);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{client ? "Edit client" : "New client"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} placeholder="Acme Co." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} placeholder="Optional notes" />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : client ? "Save changes" : "Add client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
