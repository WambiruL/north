"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/validation/auth";
import { changePassword, exportMyData, deleteMyAccount } from "@/server/actions/settings";
import { signOut } from "@/server/actions/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AccountCard({ email }: { email: string }) {
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordInput>({ resolver: zodResolver(updatePasswordSchema) });

  async function onChangePassword(values: UpdatePasswordInput) {
    const result = await changePassword(values);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Password updated");
    reset();
    setPasswordOpen(false);
  }

  async function handleExport() {
    setExporting(true);
    const data = await exportMyData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `north-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteMyAccount();
    if (result?.error) {
      setDeleting(false);
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-[13.5px] text-muted">
          Signed in as <span className="font-semibold text-ink">{email}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => setPasswordOpen(true)}>
            Change password
          </Button>
          <Button variant="secondary" onClick={handleExport} disabled={exporting}>
            {exporting ? "Preparing…" : "Export everything"}
          </Button>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Sign out
            </Button>
          </form>
        </div>
        <p className="text-[13.5px] leading-relaxed text-faint">
          Your entries are yours. Export gives you every check-in, note, and collection as a plain file
          you can keep.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 pt-4">
          <div className="text-[12.5px] text-faint">Permanent, and can&apos;t be undone.</div>
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="text-[14px] font-bold text-mahogany transition-colors hover:text-amber"
          >
            Delete account
          </button>
        </div>
      </CardContent>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onChangePassword)} className="flex flex-col gap-4" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" {...register("password")} />
              {errors.password && <p className="text-[12px] text-mahogany">{errors.password.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Update password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete your account</DialogTitle>
            <DialogDescription>
              This permanently deletes your account and everything in it. This can&apos;t be undone.
              Type DELETE to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="DELETE" />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={confirmText !== "DELETE" || deleting}
              onClick={handleDelete}
            >
              {deleting ? "Deleting…" : "Delete my account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
