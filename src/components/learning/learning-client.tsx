"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/empty-state";
import { Mark } from "@/components/ui/mark";
import { LearningPathDialog } from "@/components/learning/learning-path-dialog";
import { CourseDialog } from "@/components/learning/course-dialog";
import { ShelfItemDialog } from "@/components/learning/shelf-item-dialog";
import { MomentDialog } from "@/components/learning/moment-dialog";
import { NoteDialog } from "@/components/learning/note-dialog";
import { ProjectDialog } from "@/components/learning/project-dialog";
import { SessionDialog } from "@/components/learning/session-dialog";
import { JournalDialog } from "@/components/learning/journal-dialog";
import { CertificateDialog } from "@/components/learning/certificate-dialog";
import { CuriosityDialog } from "@/components/learning/curiosity-dialog";
import { SkillStoryDialog } from "@/components/skills/skill-story-dialog";
import {
  removeLearningPath,
  removeCourse,
  removeShelfItem,
  removeMoment,
  removeNote,
  removeProject,
  removeSession,
  removeJournalEntry,
  removeCertificate,
  removeCuriosity,
  saveFocus,
} from "@/server/actions/learning";
import { removeSkill } from "@/server/actions/skills";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { computeLearningOverview } from "@/services/learning";
import type { PathWithCourses } from "@/services/learning";

type Skill = Tables<"skills">;
type Course = Tables<"courses">;
type ShelfItem = Tables<"learning_resources">;
type Moment = Tables<"learning_moments">;
type Note = Tables<"learning_notes">;
type Project = Tables<"learning_projects">;
type Session = Tables<"learning_sessions">;
type JournalEntry = Tables<"learning_journal_entries">;
type Certificate = Tables<"certificates">;
type Curiosity = Tables<"learning_curiosities">;

const COURSE_STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

const SHELF_STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  in_progress: "In progress",
  completed: "Completed",
};

const CURIOSITY_STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  exploring: "Exploring",
  parked: "Parked",
};

function pathProgress(path: PathWithCourses) {
  if (path.courses.length === 0) return 0;
  const completed = path.courses.filter((c) => c.status === "completed").length;
  return Math.round((completed / path.courses.length) * 100);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[25px] font-bold tracking-tight text-ink">{title}</h2>
  );
}

export function LearningClient({
  paths,
  courses,
  shelfItems,
  moments,
  notes,
  projects,
  sessions,
  journalEntries,
  certificates,
  curiosities,
  skills: skillsProp,
  focus: focusProp,
}: {
  paths: PathWithCourses[];
  courses: Course[];
  shelfItems: ShelfItem[];
  moments: Moment[];
  notes: Note[];
  projects: Project[];
  sessions: Session[];
  journalEntries: JournalEntry[];
  certificates: Certificate[];
  curiosities: Curiosity[];
  skills: Skill[];
  focus: string;
}) {
  const router = useRouter();
  const confirm = useConfirm();

  const [extraSkills, setExtraSkills] = useState<Skill[]>([]);
  const skills = useMemo(() => {
    const known = new Set(skillsProp.map((s) => s.id));
    return [...skillsProp, ...extraSkills.filter((s) => !known.has(s.id))];
  }, [skillsProp, extraSkills]);

  const [focus, setFocus] = useState(focusProp);
  const [focusSaving, setFocusSaving] = useState(false);

  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<PathWithCourses | undefined>();
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [skillDialogOpen, setSkillDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | undefined>();
  const [certificateDialogOpen, setCertificateDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | undefined>();

  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>();
  const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | undefined>();
  const [momentDialogOpen, setMomentDialogOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | undefined>();

  const [shelfDialogOpen, setShelfDialogOpen] = useState(false);
  const [editingShelfItem, setEditingShelfItem] = useState<ShelfItem | undefined>();
  const [curiosityDialogOpen, setCuriosityDialogOpen] = useState(false);
  const [editingCuriosity, setEditingCuriosity] = useState<Curiosity | undefined>();
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<JournalEntry | undefined>();

  function handleSkillCreated(skill: Skill) {
    setExtraSkills((prev) => (prev.some((s) => s.id === skill.id) ? prev : [...prev, skill]));
  }

  async function handleFocusBlur() {
    if (focus === focusProp) return;
    setFocusSaving(true);
    const result = await saveFocus(focus);
    setFocusSaving(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete(
    action: (id: string) => Promise<unknown>,
    id: string,
    label: string,
    subject?: string,
  ) {
    const ok = await confirm({
      title: subject ? `Delete "${subject}"?` : `Delete this ${label.toLowerCase()}?`,
      description: "This can't be undone.",
    });
    if (!ok) return;
    await action(id);
    toast.success(`${label} removed`);
    router.refresh();
  }

  const overview = computeLearningOverview(courses, sessions, shelfItems, skills);
  const skillById = useMemo(() => new Map(skills.map((s) => [s.id, s])), [skills]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <div>
        <h1 className="text-[36px] font-bold leading-[1.14] tracking-tight text-ink">
          Welcome to your library.
        </h1>
      </div>

      <Card className="p-6">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-faint">
          This season you are
        </div>
        <Textarea
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          onBlur={handleFocusBlur}
          rows={2}
          placeholder="What are you learning right now, and why?"
          className="rounded-[14px] bg-surface-2"
        />
        {focusSaving && <p className="mt-1 text-[12px] text-faint">Saving…</p>}
      </Card>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {overview.map((stat) => (
          <Card key={stat.label} className="flex flex-col gap-1.5 p-5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-faint">{stat.label}</span>
            <span className="font-display text-[26px] font-semibold text-ink">{stat.value}</span>
            <span className="text-[12px] text-muted">{stat.sub}</span>
          </Card>
        ))}
      </div>

      {/* Skill map */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <SectionHeader title="Skill map" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setEditingSkill(undefined); setSkillDialogOpen(true); }}>
              Add a skill
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setEditingPath(undefined); setPathDialogOpen(true); }}>
              Start a learning project
            </Button>
            <Button size="sm" variant="accent" onClick={() => { setEditingCourse(undefined); setCourseDialogOpen(true); }}>
              Add a course
            </Button>
          </div>
        </div>

        {skills.length === 0 ? (
          <EmptyState title="No skills tracked yet" description="Add a skill to start mapping what you're building." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <Card key={skill.id} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14.5px] font-bold text-ink">{skill.name}</div>
                    {skill.category && <div className="text-[12px] text-faint">{skill.category}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingSkill(skill); setSkillDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeSkill, skill.id, "Skill", skill.name)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Mark key={n} tone={n <= skill.proficiency ? "teal" : "muted"} size={7} />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {paths.length === 0 ? (
          <EmptyState title="No learning paths yet" description="Group courses under a path toward a specific skill." />
        ) : (
          <div className="flex flex-col gap-3">
            {paths.map((path) => (
              <Card key={path.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-bold text-ink">{path.title}</span>
                      {path.skill_id && skillById.get(path.skill_id) && (
                        <Badge variant="teal">{skillById.get(path.skill_id)?.name}</Badge>
                      )}
                    </div>
                    {path.description && <p className="mt-1 text-[13.5px] text-muted">{path.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(removeLearningPath, path.id, "Path", path.title)} className="text-faint hover:text-mahogany">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Progress value={pathProgress(path)} tone="teal" />
                {path.courses.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-line-2 pt-3">
                    {path.courses.map((course) => (
                      <div key={course.id} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-[13.5px] font-semibold text-ink">{course.title}</div>
                          <div className="text-[11.5px] text-faint">{COURSE_STATUS_LABEL[course.status]}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11.5px] text-muted">{course.progress}%</span>
                          <button onClick={() => { setEditingCourse(course); setCourseDialogOpen(true); }} className="text-faint hover:text-teal">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(removeCourse, course.id, "Course", course.title)} className="text-faint hover:text-mahogany">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {courses.filter((c) => !c.learning_path_id).length > 0 && (
          <div className="flex flex-col gap-2">
            {courses
              .filter((c) => !c.learning_path_id)
              .map((course) => (
                <Card key={course.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="truncate text-[13.5px] font-semibold text-ink">{course.title}</div>
                    <div className="text-[11.5px] text-faint">
                      {course.provider} · {COURSE_STATUS_LABEL[course.status]}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={course.progress} tone="teal" className="w-24" />
                    <button onClick={() => { setEditingCourse(course); setCourseDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeCourse, course.id, "Course", course.title)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-ink">Certificates</span>
          <Button size="sm" variant="secondary" onClick={() => { setEditingCertificate(undefined); setCertificateDialogOpen(true); }}>
            Add a certificate
          </Button>
        </div>
        {certificates.length === 0 ? (
          <p className="text-[13px] text-faint">None earned yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-[13px]">
                <Mark tone="amber" size={7} />
                <span className="font-semibold text-ink">{cert.title}</span>
                <span className="text-faint">{format(parseISO(cert.issued_on), "MMM yyyy")}</span>
                <button onClick={() => handleDelete(removeCertificate, cert.id, "Certificate", cert.title)} className="text-faint hover:text-mahogany">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Practice */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <SectionHeader title="Practice" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setEditingMoment(undefined); setMomentDialogOpen(true); }}>
              Add a moment
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setEditingSession(undefined); setSessionDialogOpen(true); }}>
              Log a session
            </Button>
            <Button size="sm" variant="accent" onClick={() => { setEditingProject(undefined); setProjectDialogOpen(true); }}>
              Start a learning project
            </Button>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState title="No practice projects yet" description="A hands-on project is where a skill actually sticks." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col gap-2.5 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14.5px] font-bold text-ink">{project.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingProject(project); setProjectDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeProject, project.id, "Project", project.title)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <Progress value={project.progress} tone="amber" />
                {project.outcome && <p className="text-[13px] text-muted">{project.outcome}</p>}
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-ink">Recent sessions</span>
            {sessions.length === 0 ? (
              <p className="text-[13px] text-faint">No sessions logged.</p>
            ) : (
              sessions.slice(0, 6).map((session) => (
                <div key={session.id} className="flex items-center justify-between gap-3 border-b border-line-2 py-2 text-[13px]">
                  <div className="min-w-0">
                    <span className="font-semibold text-ink">{format(parseISO(session.occurred_on), "d MMM")}</span>{" "}
                    <span className="text-muted">
                      {session.minutes}m{session.skill_id && skillById.get(session.skill_id) ? ` · ${skillById.get(session.skill_id)?.name}` : ""}
                    </span>
                  </div>
                  <button onClick={() => handleDelete(removeSession, session.id, "Session", format(parseISO(session.occurred_on), "d MMM"))} className="text-faint hover:text-mahogany">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-ink">Moments</span>
            {moments.length === 0 ? (
              <p className="text-[13px] text-faint">Nothing logged yet.</p>
            ) : (
              moments.slice(0, 6).map((moment) => (
                <div key={moment.id} className="flex items-center justify-between gap-3 border-b border-line-2 py-2 text-[13px]">
                  <div className="min-w-0">
                    <span className="font-semibold text-ink">{format(parseISO(moment.occurred_on), "d MMM")}</span>{" "}
                    <span className="text-muted">{moment.what}</span>
                  </div>
                  <button onClick={() => handleDelete(removeMoment, moment.id, "Moment", moment.what)} className="text-faint hover:text-mahogany">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Curiosities */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <SectionHeader title="Curiosities" />
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => { setEditingNote(undefined); setNoteDialogOpen(true); }}>
              Write a note
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { setEditingCuriosity(undefined); setCuriosityDialogOpen(true); }}>
              Add a curiosity
            </Button>
            <Button size="sm" variant="accent" onClick={() => { setEditingShelfItem(undefined); setShelfDialogOpen(true); }}>
              Add to the shelf
            </Button>
          </div>
        </div>

        {shelfItems.length === 0 ? (
          <EmptyState title="Your shelf is empty" description="Books, videos, podcasts and articles worth coming back to." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shelfItems.map((item) => (
              <Card key={item.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[14px] font-bold text-ink">{item.title}</div>
                    {item.author && <div className="text-[12px] text-faint">{item.author}</div>}
                  </div>
                  <div className="flex gap-1">
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-faint hover:text-teal">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                    <button onClick={() => { setEditingShelfItem(item); setShelfDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeShelfItem, item.id, "Item", item.title)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.kind}</Badge>
                  <span className="text-[11.5px] text-muted">{SHELF_STATUS_LABEL[item.status]}</span>
                </div>
                {item.progress_total != null && item.progress_current != null && (
                  <Progress value={Math.round((item.progress_current / (item.progress_total || 1)) * 100)} tone="amber" />
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-bold text-ink">Curiosities</span>
            {curiosities.length === 0 ? (
              <p className="text-[13px] text-faint">Nothing on your list yet.</p>
            ) : (
              curiosities.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3 border-b border-line-2 py-2 text-[13px]">
                  <div className="min-w-0">
                    <span className="font-semibold text-ink">{c.topic}</span>{" "}
                    <span className="text-faint">· {CURIOSITY_STATUS_LABEL[c.status]}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingCuriosity(c); setCuriosityDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeCuriosity, c.id, "Curiosity", c.topic)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-ink">Journal</span>
              <Button size="sm" variant="ghost" onClick={() => { setEditingJournal(undefined); setJournalDialogOpen(true); }}>
                Write an entry
              </Button>
            </div>
            {journalEntries.length === 0 ? (
              <p className="text-[13px] text-faint">No entries yet.</p>
            ) : (
              journalEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="border-b border-line-2 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-ink">{entry.prompt}</span>
                    <button onClick={() => handleDelete(removeJournalEntry, entry.id, "Entry", entry.prompt)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="mt-0.5 text-[12.5px] italic text-muted">{entry.body}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {notes.length === 0 ? (
          <EmptyState title="No notes yet" description="Capture what a skill actually taught you." />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Card key={note.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[14px] font-bold text-ink">{note.title}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingNote(note); setNoteDialogOpen(true); }} className="text-faint hover:text-teal">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(removeNote, note.id, "Note", note.title)} className="text-faint hover:text-mahogany">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="line-clamp-3 text-[13px] text-muted">{note.body}</p>
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag}>{tag}</Badge>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <LearningPathDialog open={pathDialogOpen} onOpenChange={setPathDialogOpen} path={editingPath} skills={skills} onSkillCreated={handleSkillCreated} />
      <CourseDialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen} course={editingCourse} paths={paths} />
      <SkillStoryDialog open={skillDialogOpen} onOpenChange={setSkillDialogOpen} skill={editingSkill} onSaved={handleSkillCreated} />
      <CertificateDialog open={certificateDialogOpen} onOpenChange={setCertificateDialogOpen} certificate={editingCertificate} courses={courses} />
      <ProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} project={editingProject} />
      <SessionDialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen} session={editingSession} skills={skills} />
      <MomentDialog open={momentDialogOpen} onOpenChange={setMomentDialogOpen} moment={editingMoment} />
      <ShelfItemDialog open={shelfDialogOpen} onOpenChange={setShelfDialogOpen} item={editingShelfItem} />
      <CuriosityDialog open={curiosityDialogOpen} onOpenChange={setCuriosityDialogOpen} curiosity={editingCuriosity} />
      <NoteDialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen} note={editingNote} skills={skills} />
      <JournalDialog open={journalDialogOpen} onOpenChange={setJournalDialogOpen} entry={editingJournal} />
    </div>
  );
}
