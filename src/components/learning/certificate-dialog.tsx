"use client";

import { useState } from "react";
import { dateISOInTimezone, detectTimezone } from "@/lib/timezone";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { certificateSchema, type CertificateInput } from "@/lib/validation/learning";
import { saveCertificate } from "@/server/actions/learning";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Certificate = Tables<"certificates">;
type Course = Tables<"courses">;

export interface CertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificate?: Certificate;
  courses: Course[];
}

const NONE = "__none__";

function toDefaults(certificate?: Certificate): CertificateInput {
  if (certificate) {
    return {
      title: certificate.title,
      issuingOrg: certificate.issuing_org ?? undefined,
      issuedOn: certificate.issued_on,
      note: certificate.note ?? undefined,
      courseId: certificate.course_id ?? undefined,
    };
  }
  return {
    title: "",
    issuingOrg: undefined,
    issuedOn: dateISOInTimezone(detectTimezone()),
    note: undefined,
    courseId: undefined,
  };
}

export function CertificateDialog({ open, onOpenChange, certificate, courses }: CertificateDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<CertificateInput>({
    resolver: zodResolver(certificateSchema),
    values: toDefaults(certificate),
  });

  async function onSubmit(values: CertificateInput) {
    setSubmitting(true);
    const result = await saveCertificate(values, certificate?.id);
    setSubmitting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(certificate ? "Certificate updated" : "Certificate added");
    router.refresh();
    onOpenChange(false);
    if (!certificate) reset(toDefaults(undefined));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{certificate ? "Edit certificate" : "Add a certificate"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Certified Scrum Product Owner" {...register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issuingOrg">Issued by</Label>
            <Input id="issuingOrg" placeholder="Scrum Alliance" {...register("issuingOrg")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="issuedOn">Date</Label>
            <Input id="issuedOn" type="date" {...register("issuedOn")} />
          </div>
          {courses.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label>From course</Label>
              <Controller
                control={control}
                name="courseId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE ? undefined : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>None</SelectItem>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="note">Note</Label>
            <Textarea id="note" rows={3} {...register("note")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="accent" disabled={submitting}>
              {submitting ? "Saving…" : certificate ? "Save changes" : "Add certificate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
