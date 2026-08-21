import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mark } from "@/components/ui/mark";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export const metadata: Metadata = { title: "Design System" };

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-[26px] font-semibold italic tracking-tight text-ink">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-[13.5px] text-muted">{description}</p>}
      </div>
      <div className="rounded-[16px] border border-line bg-surface p-6">{children}</div>
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="flex max-w-4xl flex-col gap-12">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Design System</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          The parts North is built from — live, production components, not a mockup.
        </p>
      </div>

      <Section title="Foundations" description="Color, type, and the 'marks instead of icons' motif.">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "bg", cls: "bg-bg" },
              { label: "surface", cls: "bg-surface" },
              { label: "surface-2", cls: "bg-surface-2" },
              { label: "raise", cls: "bg-raise" },
              { label: "teal", cls: "bg-teal" },
              { label: "amber", cls: "bg-amber" },
              { label: "mahogany", cls: "bg-mahogany" },
            ].map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-1.5">
                <div className={`h-14 w-14 rounded-[12px] border border-line ${c.cls}`} />
                <span className="text-[11px] font-semibold text-muted">{c.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {(["circle", "ring", "square", "diamond"] as const).map((shape) => (
              <div key={shape} className="flex items-center gap-2">
                <Mark shape={shape} tone="teal" size={10} />
                <span className="text-[12px] text-muted">{shape}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Typography">
        <div className="flex flex-col gap-3">
          <p className="font-display text-[34px] font-semibold italic text-ink">
            Leaving the agency, on your own terms
          </p>
          <p className="text-[20px] font-bold text-ink">What matters most today?</p>
          <p className="text-[14px] text-muted">
            Manrope carries the interface; Cormorant Garamond carries the editorial voice.
          </p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="accent" size="sm">
            Small
          </Button>
        </div>
      </Section>

      <Section title="Cards">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>The studio years</CardTitle>
              <CardDescription>2019 — Present</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-[13.5px] text-muted">
                Six years of learning how to make complicated things feel simple.
              </p>
            </CardContent>
            <CardFooter>
              <Badge variant="teal">Design</Badge>
              <Badge variant="amber">Leadership</Badge>
            </CardFooter>
          </Card>
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-[13.5px] font-bold text-ink">Reading list</span>
              <span className="text-[12px] text-muted">4 / 9</span>
            </div>
            <Progress value={44} tone="amber" />
          </Card>
        </div>
      </Section>

      <Section title="Forms">
        <div className="flex max-w-sm flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-input">Title</Label>
            <Input id="ds-input" placeholder="Lisbon lettering, the book" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-textarea">Reflection</Label>
            <Textarea id="ds-textarea" rows={3} placeholder="What mattered most today?" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ds-select">Status</Label>
            <Select defaultValue="active">
              <SelectTrigger id="ds-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2.5 text-[13.5px] text-ink">
            <Checkbox defaultChecked />
            Save for later
          </label>
        </div>
      </Section>

      <Section title="Navigation">
        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <p className="text-[13.5px] text-muted">Career map, in order.</p>
          </TabsContent>
          <TabsContent value="goals">
            <p className="text-[13.5px] text-muted">What the work should add up to.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Data">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Badge>Default</Badge>
            <Badge variant="teal">Teal</Badge>
            <Badge variant="amber">Amber</Badge>
            <Badge variant="mahogany">Mahogany</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </div>
      </Section>

      <Section title="Feedback and empty states">
        <EmptyState
          title="No creative projects yet"
          description="Ideas become things here. Start with one you've been meaning to make."
          action={<Button variant="accent">New project</Button>}
        />
      </Section>
    </div>
  );
}
