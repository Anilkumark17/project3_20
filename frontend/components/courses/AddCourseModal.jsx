"use client";

import { useCallback, useMemo, useState } from "react";
import Fuse from "fuse.js";
import { ArrowLeft, CheckCircle2, Loader2, Plus, SearchX } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import CourseSearchBar from "./CourseSearchBar";
import CourseCard from "./CourseCard";
import { useCourses } from "@/hooks/useCourses";
import { useAddCompletedCourse, useCompletedCourses } from "@/hooks/useCompletedCourses";
import { GRADES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FUSE_OPTIONS = {
  keys: [
    { name: "code", weight: 0.4 },
    { name: "title", weight: 0.4 },
    { name: "description", weight: 0.2 },
  ],
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export default function AddCourseModal({ clerkId, trigger }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [grade, setGrade] = useState("");

  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: completed = [], isLoading: completedLoading } = useCompletedCourses(clerkId);
  const addCourse = useAddCompletedCourse();

  const allCourses = useMemo(() => coursesData?.courses || [], [coursesData]);
  const completedIds = useMemo(() => new Set(completed.map((c) => c.courseId)), [completed]);
  const fuse = useMemo(() => new Fuse(allCourses, FUSE_OPTIONS), [allCourses]);
  const results = useMemo(
    () => (query.trim() ? fuse.search(query).map((r) => r.item) : allCourses).slice(0, 40),
    [query, fuse, allCourses]
  );

  const reset = () => {
    setQuery("");
    setSelected(null);
    setGrade("");
  };

  const confirm = useCallback(async () => {
    try {
      await addCourse.mutateAsync({ clerkId, courseId: selected.id, grade });
      toast.success(`${selected.code} added`, { description: `Grade ${grade} · ${selected.credits} credits` });
      setSelected(null);
      setGrade("");
    } catch (err) {
      toast.error(err.message.includes("already") ? "Course already added" : "Failed to add course", { description: err.message });
    }
  }, [addCourse, clerkId, selected, grade]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 150);
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus /> Add course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 p-0 sm:max-w-2xl">
        {selected ? (
          <>
            <DialogHeader className="border-b p-6">
              <DialogTitle>Select your grade</DialogTitle>
              <DialogDescription>
                {selected.title} · <span className="font-mono">{selected.code}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={cn(
                      "h-12 rounded-xl border font-mono font-semibold transition-all hover:border-primary/40",
                      grade === g && "border-primary bg-primary text-primary-foreground"
                    )}
                  >
                    {g === "P" ? "Pass" : g}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-between gap-3">
                <Button variant="ghost" size="lg" onClick={() => setSelected(null)}>
                  <ArrowLeft /> Back
                </Button>
                <Button size="lg" onClick={confirm} disabled={!grade || addCourse.isPending}>
                  {addCourse.isPending ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                  Add course
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="space-y-4 border-b p-6">
              <div>
                <DialogTitle>Add a completed course</DialogTitle>
                <DialogDescription>Fuzzy search works: try &quot;distrib sys&quot; or &quot;CS3.4&quot;.</DialogDescription>
              </div>
              <CourseSearchBar value={query} onChange={setQuery} placeholder="Search by code, title or topic…" />
            </DialogHeader>
            <div className="flex-1 space-y-2 overflow-y-auto p-4">
              {coursesLoading || completedLoading ? (
                Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)
              ) : results.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground">
                  <SearchX className="mx-auto size-8 opacity-50" />
                  <p className="mt-3 text-sm">No courses match &quot;{query}&quot;</p>
                </div>
              ) : (
                results.map((course) => (
                  <CourseCard key={course.id} course={course} isAdded={completedIds.has(course.id)} onAdd={setSelected} />
                ))
              )}
            </div>
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>
                Showing {results.length} of {allCourses.length}
              </span>
              <Badge variant="secondary">{completed.length} completed</Badge>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
