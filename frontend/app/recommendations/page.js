"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNowStrict } from "date-fns";
import { AlertCircle, MessageSquareText, RefreshCw, Search, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import DifficultyBadge from "@/components/courses/DifficultyBadge";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useStreamingRecommendations } from "@/hooks/useStreamingRecommendations";
import { SEASONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function RecommendationCard({ rec, rank, provisional }) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border bg-card p-5 shadow-xs transition-all",
        provisional ? "opacity-70" : "hover:border-primary/30 hover:shadow-md",
        rank === 1 && !provisional && "border-primary/30 bg-gradient-to-br from-brand-soft to-card"
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-sm font-semibold", rank === 1 && !provisional ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
          #{rank}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold leading-snug">{rec.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            <span className="font-mono">{rec.code}</span> · {rec.credits} credits{rec.semester ? ` · ${SEASONS[rec.semester]}` : ""}
          </p>
        </div>
        {typeof rec.score === "number" && !provisional && (
          <Badge variant="outline" className="shrink-0 tabular-nums">{Math.round(rec.score * 100)}% match</Badge>
        )}
      </div>

      {provisional ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      ) : (
        rec.reason && (
          <div className="mt-4 rounded-xl bg-muted/60 p-3.5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <Sparkles className="size-3.5 text-primary" /> Why this course
            </p>
            <p className="text-sm leading-relaxed">{rec.reason}</p>
          </div>
        )
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <div className="flex flex-wrap gap-2">
          {rec.program && <Badge variant="outline">{rec.program}</Badge>}
          <DifficultyBadge level={rec.difficulty} />
        </div>
        {!provisional && (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/advisor?q=${encodeURIComponent(`Tell me about ${rec.title} (${rec.code}) and whether it suits my goal`)}`}>
              <MessageSquareText /> Ask
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

export default function RecommendationsPage() {
  const { user } = useUser();
  const clerkId = user?.id;
  const { data, isLoading } = useRecommendations(clerkId);
  const stream = useStreamingRecommendations(clerkId);

  const saved = data?.recommendations || [];
  const showStream = stream.phase !== "idle";
  const list = stream.phase === "complete" ? stream.recommendations : showStream ? stream.candidates : saved;
  const provisional = showStream && stream.phase !== "complete";
  const generatedAt = stream.phase === "complete" ? new Date() : data?.generatedAt ? new Date(data.generatedAt) : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Personalised"
        title="Recommendations"
        description="Courses retrieved from the syllabi for your goal, then ranked and explained by AI. Completed courses are excluded."
        actions={
          <Button onClick={stream.start} disabled={stream.isRunning || !clerkId} size="lg">
            {stream.isRunning ? <RefreshCw className="animate-spin" /> : saved.length ? <RefreshCw /> : <Wand2 />}
            {stream.isRunning ? "Generating…" : saved.length ? "Regenerate" : "Generate"}
          </Button>
        }
      />

      {stream.isRunning && (
        <div className="mb-6 rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-3 text-sm">
            {stream.phase === "retrieval" ? <Search className="size-4 text-primary" /> : <Sparkles className="size-4 animate-pulse text-primary" />}
            <span className="font-medium">{stream.message}</span>
          </div>
          <Progress value={stream.progress} className="h-1.5" />
        </div>
      )}

      {stream.phase === "error" && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4" /> {stream.error}
          <Button variant="outline" size="sm" className="ml-auto" onClick={stream.start}>Retry</Button>
        </div>
      )}

      {generatedAt && !stream.isRunning && (
        <p className="mb-4 text-sm text-muted-foreground">Generated {formatDistanceToNowStrict(generatedAt, { addSuffix: true })}</p>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      ) : list.length === 0 && !stream.isRunning ? (
        <div className="relative overflow-hidden rounded-3xl border border-dashed px-6 py-20 text-center">
          <div className="bg-grid absolute inset-0 opacity-50" />
          <div className="relative">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Wand2 className="size-6" /></span>
            <h2 className="mt-5 text-xl font-semibold">Get your personalised shortlist</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              We search every syllabus for courses matching your goal and history, then explain each pick.
            </p>
            <Button onClick={stream.start} size="lg" className="mt-6" disabled={!clerkId}><Sparkles /> Generate recommendations</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((rec, i) => (
            <RecommendationCard key={`${rec.code}-${i}`} rec={rec} rank={rec.priority || i + 1} provisional={provisional} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
