"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen, GraduationCap, Loader2, Pencil, Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageContainer, PageHeader, StatCard } from "@/components/PageHeader";
import AddCourseModal from "@/components/courses/AddCourseModal";
import { useProfile, useUpdateProfile } from "@/hooks/useAuth";
import { useCompletedCourses, useRemoveCompletedCourse } from "@/hooks/useCompletedCourses";
import { CREDITS_REQUIRED, GOALS, PROGRAMS, SEMESTERS, programLabel } from "@/lib/constants";

function ProfileForm({ profile, clerkId, onDone }) {
  const update = useUpdateProfile();
  const [form, setForm] = useState({
    program: profile?.program || "",
    semester: profile?.semester ? String(profile.semester) : "",
    goal: profile?.goal || "",
  });

  const save = async (e) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ clerkId, profileData: { ...form, semester: Number(form.semester) } });
      toast.success("Profile updated");
      onDone();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const field = (key, label, options) => (
    <div className="space-y-2">
      <Label htmlFor={key}>{label}</Label>
      <Select value={form[key]} onValueChange={(v) => setForm({ ...form, [key]: v })}>
        <SelectTrigger id={key} className="h-10 w-full"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => <SelectItem key={o.value} value={String(o.value)}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <form onSubmit={save} className="space-y-5">
      {field("program", "Program", PROGRAMS)}
      {field("semester", "Semester", SEMESTERS)}
      {field("goal", "Goal", GOALS)}
      <div className="flex gap-2 pt-2">
        <Button type="submit" size="lg" disabled={update.isPending || !form.program || !form.semester || !form.goal}>
          {update.isPending && <Loader2 className="animate-spin" />} Save changes
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={onDone}>Cancel</Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { user } = useUser();
  const clerkId = user?.id;
  const { data: profileData, isLoading } = useProfile(clerkId);
  const { data: completed = [], isLoading: coursesLoading } = useCompletedCourses(clerkId);
  const removeCourse = useRemoveCompletedCourse();
  const [editing, setEditing] = useState(false);
  const [toRemove, setToRemove] = useState(null);

  const profile = profileData?.profile;
  const credits = profile?.creditsCompleted || 0;

  const confirmRemove = async () => {
    const course = toRemove;
    setToRemove(null);
    try {
      await removeCourse.mutateAsync({ clerkId, courseId: course.id });
      toast.success(`${course.courseCode} removed`);
    } catch (err) {
      toast.error(err.message || "Failed to remove course");
    }
  };

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Account"
        title="Your profile"
        description="Keep your program, goal and completed courses current; recommendations and advisor answers use them."
        actions={<AddCourseModal clerkId={clerkId} trigger={<Button size="lg"><Plus /> Add course</Button>} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card p-6 lg:col-span-1">
          <div className="flex items-center gap-4">
            {user?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.imageUrl} alt="" className="size-14 rounded-2xl object-cover" />
            ) : (
              <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><GraduationCap /></span>
            )}
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.fullName || "Student"}</p>
              <p className="truncate text-sm text-muted-foreground">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>
          </div>

          <div className="mt-6 border-t pt-6">
            {isLoading ? (
              <div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10" />)}</div>
            ) : editing ? (
              <ProfileForm profile={profile} clerkId={clerkId} onDone={() => setEditing(false)} />
            ) : (
              <>
                <dl className="space-y-4">
                  {[
                    ["Program", profile?.program ? programLabel(profile.program) : null],
                    ["Semester", profile?.semester ? `Semester ${profile.semester}` : null],
                    ["Goal", profile?.goal],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</dt>
                      <dd className="mt-0.5 font-medium">{value || <span className="text-muted-foreground">Not set</span>}</dd>
                    </div>
                  ))}
                </dl>
                <Button variant="outline" size="lg" className="mt-6 w-full" onClick={() => setEditing(true)}>
                  <Pencil /> Edit profile
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={GraduationCap} label="Credits" value={credits} hint={`${Math.max(0, CREDITS_REQUIRED - credits)} to go`} accent>
              <Progress value={(credits / CREDITS_REQUIRED) * 100} className="mt-4 h-1.5" />
            </StatCard>
            <StatCard icon={BookOpen} label="Courses" value={completed.length} hint="completed" />
            <StatCard icon={Target} label="Goal" value={profile?.goal || "–"} hint="drives recommendations" />
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="font-semibold">Completed courses</h2>
              <Badge variant="secondary">{completed.length}</Badge>
            </div>
            {coursesLoading ? (
              <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
            ) : completed.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <BookOpen className="mx-auto size-10 text-muted-foreground/50" />
                <p className="mt-4 font-semibold">No courses yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Add the courses you&apos;ve completed to get sharper recommendations.</p>
                <AddCourseModal clerkId={clerkId} trigger={<Button className="mt-5"><Plus /> Add your first course</Button>} />
              </div>
            ) : (
              <ul className="divide-y">
                {completed.map((c) => (
                  <li key={c.id} className="group flex items-center gap-4 px-6 py-3.5">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted font-mono text-sm font-semibold">{c.grade || "–"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{c.courseTitle}</p>
                      <p className="text-xs text-muted-foreground"><span className="font-mono">{c.courseCode}</span> · {c.courseCredits} credits</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground opacity-60 group-hover:opacity-100 hover:text-destructive"
                      onClick={() => setToRemove(c)}
                      aria-label={`Remove ${c.courseCode}`}
                    >
                      <Trash2 />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <AlertDialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toRemove?.courseCode}?</AlertDialogTitle>
            <AlertDialogDescription>
              {toRemove?.courseTitle} will be removed from your completed courses and its credits subtracted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
}
