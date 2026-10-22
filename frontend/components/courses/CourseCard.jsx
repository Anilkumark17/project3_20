"use client";

import { memo } from "react";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DifficultyBadge from "@/components/courses/DifficultyBadge";
import { SEASONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CourseCard = memo(function CourseCard({ course, isAdded, isLoading, onAdd }) {
  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-xl border bg-card p-4 transition-colors",
        isAdded ? "bg-muted/50" : "hover:border-primary/30"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary" className="font-mono">{course.code}</Badge>
          {course.program && <Badge variant="outline">{course.program}</Badge>}
          <DifficultyBadge level={course.difficulty} />
        </div>
        <p className="mt-2 font-medium leading-snug">{course.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {course.credits} credits{course.semester ? ` · ${SEASONS[course.semester]}` : ""}
        </p>
      </div>
      <Button
        size="lg"
        variant={isAdded ? "secondary" : "default"}
        onClick={() => !isAdded && onAdd(course)}
        disabled={isAdded || isLoading}
        className="shrink-0"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : isAdded ? <CheckCircle2 /> : <Plus />}
        {isAdded ? "Added" : "Add"}
      </Button>
    </div>
  );
});

export default CourseCard;
