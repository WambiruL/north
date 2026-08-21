"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, ExternalLink } from "lucide-react";
import type { Tables } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LearningPathDialog } from "@/components/learning/learning-path-dialog";
import { CourseDialog } from "@/components/learning/course-dialog";
import { ResourceDialog } from "@/components/learning/resource-dialog";
import { removeLearningPath, removeCourse, removeResource } from "@/server/actions/learning";
import type { PathWithCourses } from "@/services/learning";

type Skill = Tables<"skills">;
type Course = Tables<"courses">;
type Resource = Tables<"learning_resources">;

const COURSE_STATUS_LABEL: Record<string, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

function pathProgress(path: PathWithCourses) {
  if (path.courses.length === 0) return 0;
  const completed = path.courses.filter((c) => c.status === "completed").length;
  return Math.round((completed / path.courses.length) * 100);
}

export function LearningClient({
  paths,
  courses,
  resources,
  skills: skillsProp,
}: {
  paths: PathWithCourses[];
  courses: Course[];
  resources: Resource[];
  skills: Skill[];
}) {
  // Skills created via the picker mid-dialog are merged in immediately for
  // instant UI feedback, ahead of the server revalidation that will
  // eventually fold them into `skillsProp` for good.
  const [extraSkills, setExtraSkills] = useState<Skill[]>([]);
  const skills = useMemo(() => {
    const known = new Set(skillsProp.map((s) => s.id));
    return [...skillsProp, ...extraSkills.filter((s) => !known.has(s.id))];
  }, [skillsProp, extraSkills]);

  const [pathDialogOpen, setPathDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<PathWithCourses | undefined>(undefined);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | undefined>(undefined);

  function handleSkillCreated(skill: Skill) {
    setExtraSkills((prev) => (prev.some((s) => s.id === skill.id) ? prev : [...prev, skill]));
  }

  function openNewPath() {
    setEditingPath(undefined);
    setPathDialogOpen(true);
  }
  function openEditPath(path: PathWithCourses) {
    setEditingPath(path);
    setPathDialogOpen(true);
  }
  async function handleDeletePath(id: string) {
    await removeLearningPath(id);
    toast.success("Learning path removed");
  }

  function openNewCourse() {
    setEditingCourse(undefined);
    setCourseDialogOpen(true);
  }
  function openEditCourse(course: Course) {
    setEditingCourse(course);
    setCourseDialogOpen(true);
  }
  async function handleDeleteCourse(id: string) {
    await removeCourse(id);
    toast.success("Course removed");
  }

  function openNewResource() {
    setEditingResource(undefined);
    setResourceDialogOpen(true);
  }
  function openEditResource(resource: Resource) {
    setEditingResource(resource);
    setResourceDialogOpen(true);
  }
  async function handleDeleteResource(id: string) {
    await removeResource(id);
    toast.success("Resource removed");
  }

  function renderCourseList(list: Course[]) {
    if (list.length === 0) {
      return <EmptyState title="Nothing here" description="No courses match this filter." />;
    }
    return (
      <div className="flex flex-col gap-2">
        {list.map((course) => (
          <Card key={course.id} className="flex items-center justify-between gap-4 p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13.5px] font-bold text-ink">{course.title}</span>
                <Badge variant={course.status === "completed" ? "teal" : "default"}>
                  {COURSE_STATUS_LABEL[course.status] ?? course.status}
                </Badge>
              </div>
              {course.provider && <div className="mt-0.5 text-[12px] text-faint">{course.provider}</div>}
              <div className="mt-2 flex max-w-xs items-center gap-2">
                <Progress value={course.progress} />
                <span className="w-9 shrink-0 text-[11px] text-faint">{course.progress}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              {course.url && (
                <Button variant="ghost" size="icon" asChild aria-label="Open course">
                  <a href={course.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEditCourse(course)}
                aria-label="Edit course"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteCourse(course.id)}
                aria-label="Delete course"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-[38px] font-bold tracking-tight text-ink">Welcome to your library</h1>
        <p className="mt-1 text-[13.5px] text-muted">
          Paths you&apos;re building, courses in progress, and things worth coming back to.
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold text-ink">Skill map</h2>
          <Button variant="accent" size="sm" onClick={openNewPath}>
            New path
          </Button>
        </div>
        {paths.length === 0 ? (
          <EmptyState
            title="No learning paths yet"
            description="Start a path toward a skill you want to build."
            action={
              <Button variant="accent" onClick={openNewPath}>
                Start a path
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {paths.map((path) => {
              const skill = skills.find((s) => s.id === path.skill_id);
              const progress = pathProgress(path);
              return (
                <Card key={path.id} className="flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[15px] font-bold text-ink">{path.title}</div>
                      {skill && (
                        <Badge variant="teal" className="mt-1.5">
                          {skill.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditPath(path)}
                        aria-label="Edit path"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePath(path.id)}
                        aria-label="Delete path"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {path.description && <p className="text-[13px] text-muted">{path.description}</p>}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-faint">
                      <span>
                        {path.courses.length} course{path.courses.length === 1 ? "" : "s"}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold text-ink">Practice</h2>
          <Button variant="accent" size="sm" onClick={openNewCourse}>
            Add course
          </Button>
        </div>
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" description="Track the courses you're working through." />
        ) : (
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderCourseList(courses)}</TabsContent>
            <TabsContent value="in_progress">
              {renderCourseList(courses.filter((c) => c.status === "in_progress"))}
            </TabsContent>
            <TabsContent value="completed">
              {renderCourseList(courses.filter((c) => c.status === "completed"))}
            </TabsContent>
          </Tabs>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[19px] font-bold text-ink">Curiosities</h2>
          <Button variant="accent" size="sm" onClick={openNewResource}>
            Save resource
          </Button>
        </div>
        {resources.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            description="Keep track of articles, videos, and books worth returning to."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {resources.map((resource) => (
              <Card key={resource.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13.5px] font-bold text-ink">{resource.title}</span>
                    <Badge variant="outline">{resource.kind}</Badge>
                    {resource.is_saved_for_later && <Badge variant="amber">Saved</Badge>}
                  </div>
                  {resource.note && <p className="mt-1 text-[13px] text-muted">{resource.note}</p>}
                  {resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-[12px] text-teal hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> {resource.url}
                    </a>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditResource(resource)}
                    aria-label="Edit resource"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteResource(resource.id)}
                    aria-label="Delete resource"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <LearningPathDialog
        open={pathDialogOpen}
        onOpenChange={setPathDialogOpen}
        path={editingPath}
        skills={skills}
        onSkillCreated={handleSkillCreated}
      />
      <CourseDialog
        open={courseDialogOpen}
        onOpenChange={setCourseDialogOpen}
        course={editingCourse}
        paths={paths}
      />
      <ResourceDialog
        open={resourceDialogOpen}
        onOpenChange={setResourceDialogOpen}
        resource={editingResource}
      />
    </div>
  );
}
