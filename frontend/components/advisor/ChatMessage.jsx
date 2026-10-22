"use client";

import { useState } from "react";
import { AlertTriangle, Check, Copy, FileText, Sparkles, Square } from "lucide-react";
import { toast } from "sonner";
import Markdown from "@/components/advisor/Markdown";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SEASON = { spring: "Spring", monsoon: "Monsoon" };

function SourceCard({ source, highlighted }) {
  return (
    <div
      id={`source-${source.n}`}
      className={cn(
        "rounded-xl border bg-card p-3 text-left transition-all",
        highlighted ? "border-primary/50 ring-3 ring-primary/15" : "hover:border-foreground/15"
      )}
    >
      <div className="flex items-start gap-2">
        <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary/12 font-mono text-[0.68rem] font-semibold text-primary">
          {source.n}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{source.courseTitle || "Syllabus overview"}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {source.courseCode && <span className="font-mono">{source.courseCode}</span>}
            <span>· {source.section}</span>
            {source.season && <span>· {SEASON[source.season]}</span>}
          </div>
        </div>
      </div>
      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{source.snippet}</p>
    </div>
  );
}

export function AssistantMessage({ message, isLast, isStreaming }) {
  const [highlight, setHighlight] = useState(null);
  const [copied, setCopied] = useState(false);
  const citations = message.citations?.length ? message.citations : [];
  const streamingThis = isLast && isStreaming;

  const onCite = (n) => {
    setHighlight(n);
    document.getElementById(`source-${n}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    setTimeout(() => setHighlight(null), 1600);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast.success("Answer copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex gap-3 sm:gap-4">
      <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/25">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        {message.pending ? (
          <div className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground">
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="size-1.5 animate-bounce rounded-full bg-primary" style={{ animationDelay: `${i * 120}ms` }} />
              ))}
            </span>
            {message.sources?.length ? `Reading ${message.sources.length} syllabus sections…` : "Searching the syllabi…"}
          </div>
        ) : message.error ? (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {message.error}
          </div>
        ) : (
          <div className={cn(streamingThis && "is-streaming")}>
            <Markdown content={message.content} citations={citations.length ? citations : message.sources} onCite={onCite} />
          </div>
        )}

        {message.stopped && (
          <Badge variant="outline" className="gap-1 text-muted-foreground">
            <Square className="size-3" /> Stopped
          </Badge>
        )}

        {!streamingThis && citations.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <FileText className="size-3.5" /> Sources
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {citations.map((s) => (
                <SourceCard key={s.n} source={s} highlighted={highlight === s.n} />
              ))}
            </div>
          </div>
        )}

        {!streamingThis && !message.pending && !message.error && message.content && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button variant="ghost" size="xs" onClick={copy} className="text-muted-foreground">
              {copied ? <Check /> : <Copy />} Copy
            </Button>
            {message.timings?.totalMs && (
              <span className="text-xs text-muted-foreground tabular-nums">{(message.timings.totalMs / 1000).toFixed(1)}s</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function UserMessage({ message }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[0.94rem] leading-relaxed whitespace-pre-wrap text-primary-foreground shadow-sm">
        {message.content}
      </div>
    </div>
  );
}
