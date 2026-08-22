"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Tables } from "@/types/database.types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { usd } from "@/components/work/shared";
import { TodayTab } from "@/components/work/tabs/today-tab";
import { ProjectsTab } from "@/components/work/tabs/projects-tab";
import { FreelanceTab } from "@/components/work/tabs/freelance-tab";
import { EmploymentTab } from "@/components/work/tabs/employment-tab";
import { OpportunitiesTab } from "@/components/work/tabs/opportunities-tab";
import { NotesTab } from "@/components/work/tabs/notes-tab";
import { NetworkTab } from "@/components/work/tabs/network-tab";
import { WinsTab } from "@/components/work/tabs/wins-tab";
import { AnalyticsTab, type WorkAnalytics } from "@/components/work/tabs/analytics-tab";
import { FocusTaskDialog } from "@/components/work/focus-task-dialog";
import { ProjectDialog } from "@/components/work/project-dialog";
import { ClientDialog } from "@/components/work/client-dialog";
import { OpportunityDialog } from "@/components/work/opportunity-dialog";
import { InvoiceDialog } from "@/components/work/invoice-dialog";
import { WinDialog } from "@/components/work/win-dialog";
import { WorkNoteDialog } from "@/components/work/work-note-dialog";
import { ContactDialog } from "@/components/work/contact-dialog";

type Project = Tables<"work_projects"> & {
  client: { id: string; name: string } | null;
  taskCounts: { done: number; total: number };
};
type ClientRow = Tables<"clients">;
type FocusTask = Tables<"work_tasks"> & { work_project: { id: string; name: string } | null };
type Invoice = Tables<"invoices"> & {
  client: { id: string; name: string } | null;
  work_project: { id: string; name: string } | null;
};
type Opportunity = Tables<"work_opportunities">;
type Win = Tables<"work_wins">;
type WorkNote = Tables<"work_notes"> & { work_project: { id: string; name: string } | null };
type Contact = Tables<"work_contacts">;
type Activity = Tables<"activities">;
type IncomeSource = Tables<"income_sources">;

const TABS = [
  { value: "today", label: "Today" },
  { value: "projects", label: "Projects" },
  { value: "freelance", label: "Freelance" },
  { value: "employment", label: "Employment" },
  { value: "opportunities", label: "Opportunities" },
  { value: "notes", label: "Notes" },
  { value: "network", label: "Network" },
  { value: "wins", label: "Wins" },
  { value: "analytics", label: "Analytics" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

type CaptureItem = { label: string; onClick: () => void };

export function WorkClient({
  projects,
  clients,
  focusTasks,
  invoices,
  opportunities,
  wins,
  notes,
  contacts,
  recentActivity,
  currentEmployment,
  analytics,
  autoOpen,
}: {
  projects: Project[];
  clients: ClientRow[];
  focusTasks: FocusTask[];
  invoices: Invoice[];
  opportunities: Opportunity[];
  wins: Win[];
  notes: WorkNote[];
  contacts: Contact[];
  recentActivity: Activity[];
  currentEmployment: IncomeSource | null;
  analytics: WorkAnalytics;
  autoOpen: "project" | "task" | null;
}) {
  const [tab, setTab] = useState<TabValue>("today");
  const [captureOpen, setCaptureOpen] = useState(false);

  const [projectDialogOpen, setProjectDialogOpen] = useState(
    () => autoOpen === "project" || (autoOpen === "task" && projects.length === 0),
  );
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [focusDialogOpen, setFocusDialogOpen] = useState(false);
  const [focusDefaultPriority, setFocusDefaultPriority] = useState(true);
  const [opportunityDialogOpen, setOpportunityDialogOpen] = useState(false);
  const [opportunityLockedKind, setOpportunityLockedKind] = useState<"job" | undefined>(undefined);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [winDialogOpen, setWinDialogOpen] = useState(false);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    if (autoOpen === "task" && projects.length > 0) {
      toast.info("Open a project to add a task, or add a priority from Today.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoOpen]);

  const projectOptions = projects.map((p) => ({ id: p.id, name: p.name }));
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + Number(i.amount), 0);
  const openOpportunities = opportunities.filter(
    (o) => o.kind !== "job" && !["won", "lost", "rejected"].includes(o.status),
  ).length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const summary = `${activeProjects} project${activeProjects === 1 ? "" : "s"} live, ${openOpportunities} opportunit${openOpportunities === 1 ? "y" : "ies"} open, and ${usd.format(outstanding)} still owed to you.`;

  const statTiles = [
    { label: "Active projects", value: String(activeProjects) },
    { label: "Outstanding", value: usd.format(outstanding) },
    { label: "Opportunities open", value: String(openOpportunities) },
  ];

  const captureItems: CaptureItem[] = [
    { label: "Add a priority", onClick: () => { setFocusDefaultPriority(true); setFocusDialogOpen(true); } },
    { label: "Add a deadline", onClick: () => { setFocusDefaultPriority(false); setFocusDialogOpen(true); } },
    { label: "Start a project", onClick: () => setProjectDialogOpen(true) },
    { label: "Add a client", onClick: () => setClientDialogOpen(true) },
    { label: "Add an invoice", onClick: () => setInvoiceDialogOpen(true) },
    { label: "Add an opportunity", onClick: () => { setOpportunityLockedKind(undefined); setOpportunityDialogOpen(true); } },
    { label: "Add an application", onClick: () => { setOpportunityLockedKind("job"); setOpportunityDialogOpen(true); } },
    { label: "Write a note", onClick: () => setNoteDialogOpen(true) },
    { label: "Add someone", onClick: () => setContactDialogOpen(true) },
    { label: "Log a win", onClick: () => setWinDialogOpen(true) },
  ];

  return (
    <div>
      <div className="rounded-[22px] border border-line bg-surface p-9 shadow-north-sm">
        <div className="flex flex-wrap items-end justify-between gap-9">
          <div className="min-w-0">
            <div className="mb-3.5 text-[11px] font-extrabold uppercase tracking-widest text-faint">
              Work
            </div>
            <h1 className="mb-2.5 text-[36px] font-bold leading-tight tracking-tight text-ink">
              Here is your professional world.
            </h1>
            <p className="max-w-[34em] text-[16.5px] text-muted">{summary}</p>
          </div>
          <div className="flex flex-wrap gap-3.5">
            {statTiles.map((s) => (
              <div key={s.label} className="min-w-[170px] rounded-[18px] bg-surface-2 px-5 py-4">
                <div className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-faint">
                  {s.label}
                </div>
                <div className="text-[15px] font-extrabold leading-snug text-ink">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)} className="mt-6">
        <TabsList className="flex flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="today">
          <TodayTab tasks={focusTasks} invoices={invoices} projects={projectOptions} />
        </TabsContent>
        <TabsContent value="projects">
          <ProjectsTab projects={projects} clients={clients.map((c) => ({ id: c.id, name: c.name }))} />
        </TabsContent>
        <TabsContent value="freelance">
          <FreelanceTab
            clients={clients}
            invoices={invoices}
            projects={projectOptions}
            recentActivity={recentActivity}
          />
        </TabsContent>
        <TabsContent value="employment">
          <EmploymentTab
            applications={opportunities.filter((o) => o.kind === "job")}
            currentEmployment={currentEmployment}
          />
        </TabsContent>
        <TabsContent value="opportunities">
          <OpportunitiesTab opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesTab notes={notes} projects={projectOptions} />
        </TabsContent>
        <TabsContent value="network">
          <NetworkTab contacts={contacts} />
        </TabsContent>
        <TabsContent value="wins">
          <WinsTab wins={wins} />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab analytics={analytics} />
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
        {captureOpen && (
          <div className="flex flex-col gap-1 rounded-[20px] border border-line bg-surface p-3 shadow-north-hero">
            {captureItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setCaptureOpen(false);
                  item.onClick();
                }}
                className="rounded-[13px] px-4 py-2.5 text-left text-[14.5px] font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setCaptureOpen((v) => !v)}
          title="Quick capture"
          aria-label="Quick capture"
          className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-amber text-[27px] font-bold leading-none text-[#001524] shadow-[0_5px_16px_rgba(255,125,0,0.3)] transition-transform hover:-translate-y-0.5 hover:rotate-90"
        >
          +
        </button>
      </div>

      <ProjectDialog
        open={projectDialogOpen}
        onOpenChange={setProjectDialogOpen}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      />
      <ClientDialog open={clientDialogOpen} onOpenChange={setClientDialogOpen} />
      <FocusTaskDialog
        open={focusDialogOpen}
        onOpenChange={setFocusDialogOpen}
        projects={projectOptions}
        defaultIsPriority={focusDefaultPriority}
      />
      <OpportunityDialog
        open={opportunityDialogOpen}
        onOpenChange={setOpportunityDialogOpen}
        lockedKind={opportunityLockedKind}
      />
      <InvoiceDialog
        open={invoiceDialogOpen}
        onOpenChange={setInvoiceDialogOpen}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        projects={projectOptions}
      />
      <WinDialog open={winDialogOpen} onOpenChange={setWinDialogOpen} />
      <WorkNoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} projects={projectOptions} />
      <ContactDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </div>
  );
}
