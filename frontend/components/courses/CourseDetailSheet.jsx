"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Layers, MessageSquareText } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DifficultyBadge from "@/components/courses/DifficultyBadge";
import { SEASONS } from "@/lib/constants";

const QUESTIONS = (c) => [
  `What are the learning outcomes of ${c.title} (${c.code})?`,
  `How is ${c.title} (${c.code}) graded and who teaches it?`,
  `What should I know before taking ${c.title} (${c.code})?`,
];

export default function CourseDetailSheet({ course, onOpenChange }) {
  return (
    <Sheet open={!!course} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        {course && (
          <>
            <SheetHeader className="border-b pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="font-mono">{course.code}</Badge>
                {course.program && <Badge variant="outline">{course.program}</Badge>}
                <DifficultyBadge level={course.difficulty} />
              </div>
              <SheetTitle className="mt-2 text-xl leading-snug">{course.title}</SheetTitle>
              <SheetDescription>{course.description}</SheetDescription>
            </SheetHeader>

            <div className="space-y-6 px-4 pb-6">
              <dl className="grid grid-cols-3 gap-3">
                {[
                  { icon: Layers, label: "Credits", value: course.credits },
                  { icon: CalendarDays, label: "Offered", value: SEASONS[course.semester] || "—" },
                  { icon: BookOpen, label: "Difficulty", value: course.difficulty ? `${course.difficulty}/5` : "—" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-xl border bg-muted/40 p-3">
                    <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="size-3.5" />{label}</dt>
                    <dd className="mt-1 font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <MessageSquareText className="size-4 text-primary" /> Ask the advisor
                </p>
                <div className="space-y-2">
                  {QUESTIONS(course).map((q) => (
                    <Link
                      key={q}
                      href={`/advisor?q=${encodeURIComponent(q)}`}
                      className="block rounded-xl border p-3 text-sm transition-colors hover:border-primary/40 hover:bg-brand-soft"
                    >
                      {q}
                    </Link>
                  ))}
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href={`/advisor?q=${encodeURIComponent(`Tell me everything about ${course.title} (${course.code})`)}`}>
                  <MessageSquareText /> Open full syllabus summary
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
