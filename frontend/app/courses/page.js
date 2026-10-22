"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import DifficultyBadge from "@/components/courses/DifficultyBadge";
import CourseDetailSheet from "@/components/courses/CourseDetailSheet";
import { useSearchCourses } from "@/hooks/useCourses";
import { SEASONS } from "@/lib/constants";

const FILTERS = {
  program: [
    { value: "all", label: "All programs" },
    { value: "CSE", label: "CSE" },
    { value: "CSIS", label: "CSIS" },
    { value: "PDM", label: "PDM" },
    { value: "Elective", label: "Open electives" },
  ],
  semester: [
    { value: "all", label: "Any season" },
    { value: "1", label: "Monsoon" },
    { value: "2", label: "Spring" },
  ],
  credits: [
    { value: "all", label: "Any credits" },
    { value: "2", label: "2 credits" },
    { value: "4", label: "4 credits" },
  ],
};

function getPageNumbers(page, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => ({ type: "page", n: i + 1 }));
  const pages = [{ type: "page", n: 1 }];
  if (page > 3) pages.push({ type: "ellipsis" });
  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push({ type: "page", n: i });
  if (page < totalPages - 2) pages.push({ type: "ellipsis" });
  pages.push({ type: "page", n: totalPages });
  return pages;
}

function CourseTile({ course, onOpen }) {
  return (
    <button
      onClick={() => onOpen(course)}
      className="group flex h-full flex-col rounded-2xl border bg-card p-5 text-left shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="font-mono">{course.code}</Badge>
        <span className="text-xs text-muted-foreground">{course.credits} credits</span>
      </div>
      <h3 className="mt-3 font-semibold leading-snug group-hover:text-primary">{course.title}</h3>
      {course.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {course.program && <Badge variant="outline">{course.program}</Badge>}
        {course.semester && <Badge variant="outline">{SEASONS[course.semester]}</Badge>}
        <DifficultyBadge level={course.difficulty} />
      </div>
    </button>
  );
}

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filters, setFilters] = useState({ program: "all", semester: "all", credits: "all" });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setKeyword(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isFetching, error } = useSearchCourses({ ...filters, keyword }, page);

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const hasFilters = search || Object.values(filters).some((v) => v !== "all");
  const clear = () => {
    setSearch("");
    setFilters({ program: "all", semester: "all", credits: "all" });
  };

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Catalog"
        title="Course catalog"
        description="Every Monsoon and Spring offering. Open a course to see its details or ask the advisor about it."
      />

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or title…"
            className="h-10 border-0 bg-muted/50 pl-9 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 lg:flex">
          {Object.entries(FILTERS).map(([key, options]) => (
            <Select key={key} value={filters[key]} onValueChange={(v) => setFilter(key, v)}>
              <SelectTrigger className="h-10 w-full lg:w-40" aria-label={key}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
        {hasFilters && (
          <Button variant="ghost" size="lg" onClick={clear}><X /> Clear</Button>
        )}
      </div>

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        {total} {total === 1 ? "course" : "courses"}
        {isFetching && !isLoading && <Loader2 className="size-3.5 animate-spin" />}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border bg-card py-16 text-center text-muted-foreground">Failed to load courses. {error.message}</div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-16 text-center">
          <BookOpen className="mx-auto size-10 text-muted-foreground/50" />
          <p className="mt-4 font-semibold">No courses match</p>
          <p className="mt-1 text-sm text-muted-foreground">Try a different keyword or clear the filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseTile key={c.id} course={c} onOpen={setSelected} />)}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page === 1}
                className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
            {getPageNumbers(page, totalPages).map((item, i) =>
              item.type === "ellipsis" ? (
                <PaginationItem key={`e${i}`}><PaginationEllipsis /></PaginationItem>
              ) : (
                <PaginationItem key={item.n}>
                  <PaginationLink onClick={() => setPage(item.n)} isActive={page === item.n} className="cursor-pointer">{item.n}</PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page === totalPages}
                className={page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <CourseDetailSheet course={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </PageContainer>
  );
}
