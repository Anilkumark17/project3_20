"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNowStrict } from "date-fns";
import {
  ArrowRight, ArrowUp, BookOpen, CheckCircle2, GraduationCap, MessageSquareText, Sparkles, Target, TrendingUp, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer, StatCard } from "@/components/PageHeader";
import DifficultyBadge from "@/components/courses/DifficultyBadge";
import { useDashboard } from "@/hooks/useDashboard";
import { programLabel, SEASONS } from "@/lib/constants";

function DashboardSkeleton() {
  return (
    <PageContainer>
      <Skeleton className="h-10 w-80" />
      <Skeleton className="mt-3 h-5 w-96" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </PageContainer>
  );
}

function QuickAsk() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) router.push(`/advisor?q=${encodeURIComponent(q.trim())}`);
      }}
      className="flex items-center gap-2 rounded-xl border bg-background p-1.5 pl-4 focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/10"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="e.g. Which spring electives suit research in NLP?"
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        aria-label="Ask the AI advisor"
      />
      <Button type="submit" size="icon-lg" disabled={!q.trim()} aria-label="Ask">
        <ArrowUp />
      </Button>
    </form>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { data, isLoading, error, refetch } = useDashboard(user?.id);

  const profile = data?.profile;
  const needsOnboarding = data && !(profile?.program && profile?.semester && profile?.goal);

  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  if (!isLoaded || isLoading || needsOnboarding) return <DashboardSkeleton />;

  if (error) {
    return (
      <PageContainer className="flex flex-1 items-center justify-center">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center">
          <AlertCircle className="mx-auto size-10 text-destructive" />
          <h2 className="mt-4 text-lg font-semibold">We couldn&apos;t load your dashboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-6">Try again</Button>
        </div>
      </PageContainer>
    );
  }

  const { stats, recentCourses, recommendations, conversations } = data;

  return (
    <PageContainer>
      <div className="mb-8 flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          {programLabel(profile.program)} · Semester {profile.semester}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Welcome back, {user?.firstName || "there"}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Credits earned" value={stats.creditsCompleted} hint={`of ${stats.creditsRequired} required`} accent>
          <Progress value={stats.progress * 100} className="mt-4 h-1.5" />
        </StatCard>
        <StatCard icon={CheckCircle2} label="Courses completed" value={stats.coursesCompleted} hint={`${stats.catalogSize} in the catalog`} />
        <StatCard
          icon={TrendingUp}
          label="Average difficulty"
          value={stats.averageDifficulty ? `${stats.averageDifficulty.toFixed(1)}/5` : "–"}
          hint={stats.averageDifficulty ? "across completed courses" : "add courses to see this"}
        />
        <StatCard icon={Target} label="Goal" value={profile.goal} hint="Recommendations are tuned to this" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border bg-gradient-to-br from-brand-soft via-card to-card p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/30">
                <MessageSquareText className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Ask the AI advisor</h2>
                <p className="text-sm text-muted-foreground">Cited answers from the official syllabi</p>
              </div>
            </div>
            <div className="mt-5"><QuickAsk /></div>
            {conversations.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {conversations.slice(0, 3).map((c) => (
                  <Link key={c.id} href={`/advisor?c=${c.id}`} className="max-w-full truncate rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground">
                    {c.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-card">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <h2 className="font-semibold">Top picks for you</h2>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href="/recommendations">View all <ArrowRight /></Link>
              </Button>
            </div>
            {recommendations.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">No recommendations yet. Generate a personalised shortlist in seconds.</p>
                <Button asChild className="mt-4"><Link href="/recommendations"><Sparkles /> Generate recommendations</Link></Button>
              </div>
            ) : (
              <ul className="divide-y">
                {recommendations.map((r) => (
                  <li key={r.id} className="flex gap-4 px-6 py-4">
                    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">{r.priority}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{r.title}</p>
                        <span className="font-mono text-xs text-muted-foreground">{r.code}</span>
                        <DifficultyBadge level={r.difficulty} />
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.reason}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              <h2 className="font-semibold">Recently completed</h2>
            </div>
            <Button asChild variant="ghost" size="sm"><Link href="/profile">Manage</Link></Button>
          </div>
          {recentCourses.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">Log the courses you have finished to unlock better recommendations.</p>
              <Button asChild variant="outline" className="mt-4"><Link href="/profile">Add completed courses</Link></Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recentCourses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.courseTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{c.courseCode}</span> · {c.courseCredits} cr
                      {c.completedAt && ` · ${formatDistanceToNowStrict(new Date(c.completedAt), { addSuffix: true })}`}
                    </p>
                  </div>
                  {c.grade && <Badge variant="secondary" className="font-mono">{c.grade}</Badge>}
                </li>
              ))}
            </ul>
          )}
          <div className="border-t px-6 py-4 text-xs text-muted-foreground">
            Seasons: {SEASONS[1]} (odd) and {SEASONS[2]} (even) semesters
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
