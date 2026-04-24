"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useSearchCourses } from "@/hooks/useCourses";
import { Loader2, Search, BookOpen, Filter, X } from "lucide-react";

const PROGRAMS = [
  { value: "all", label: "All Programs" },
  { value: "CSE", label: "CSE" },
  { value: "PDM", label: "PDM" },
  { value: "CSIS", label: "CSIS" },
  { value: "CASE", label: "CASE" },
];

const SEMESTERS = [
  { value: "all", label: "All Semesters" },
  { value: "1", label: "Monsoon" },
  { value: "2", label: "Spring" },
];

const CREDITS = [
  { value: "all", label: "All Credits" },
  { value: "1", label: "1 Credit" },
  { value: "2", label: "2 Credits" },
  { value: "3", label: "3 Credits" },
  { value: "4", label: "4 Credits" },
  { value: "5", label: "5 Credits" },
  { value: "6", label: "6 Credits" },
];

export default function CoursesPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [filters, setFilters] = useState({
    keyword: "",
    program: "all",
    semester: "all",
    credits: "all",
  });

  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update filters when debounced keyword changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, keyword: debouncedKeyword }));
  }, [debouncedKeyword]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [filters.keyword, filters.program, filters.semester, filters.credits]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const { data, isLoading, isFetching, error } = useSearchCourses(filters, page);

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilters({
      keyword: "",
      program: "all",
      semester: "all",
      credits: "all",
    });
  };

  const hasActiveFilters = filters.keyword || (filters.program && filters.program !== "all") || (filters.semester && filters.semester !== "all") || (filters.credits && filters.credits !== "all");

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Course Catalog
          </h1>
          <p className="mt-2 text-lg font-light text-black/60">
            Browse and search available courses
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 border-black/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-black p-2.5">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="font-semibold text-black">Search & Filter</CardTitle>
                <CardDescription className="font-light text-black/60">
                  Find courses by keyword, program, or semester
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
              <Input
                type="text"
                placeholder="Search by course code or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 border-black/20 pl-10 font-medium"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                value={filters.program}
                onValueChange={(value) => setFilters({ ...filters, program: value })}
              >
                <SelectTrigger className="h-12 border-black/20 font-medium">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((program) => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.semester}
                onValueChange={(value) => setFilters({ ...filters, semester: value })}
              >
                <SelectTrigger className="h-12 border-black/20 font-medium">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((semester) => (
                    <SelectItem key={semester.value} value={semester.value}>
                      {semester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.credits}
                onValueChange={(value) => setFilters({ ...filters, credits: value })}
              >
                <SelectTrigger className="h-12 border-black/20 font-medium">
                  <SelectValue placeholder="Select credits" />
                </SelectTrigger>
                <SelectContent>
                  {CREDITS.map((credit) => (
                    <SelectItem key={credit.value} value={credit.value}>
                      {credit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button
                onClick={handleClearFilters}
                variant="outline"
                className="w-full border-black/20 font-medium hover:bg-black/5 sm:w-auto"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-black/60">
            {total} {total === 1 ? "course" : "courses"} found
          </p>
          {isFetching && (
            <Loader2 className="h-4 w-4 animate-spin text-black/40" />
          )}
        </div>

        {/* Course Grid */}
        {error ? (
          <Card className="border-black/10">
            <CardContent className="py-12 text-center">
              <p className="font-medium text-black/60">
                Failed to load courses. Please try again.
              </p>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="border-black/10">
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-black/20" />
              <p className="text-lg font-semibold text-black">No courses found</p>
              <p className="mt-1 font-light text-black/60">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="border-black/10 transition-all hover:border-black/20 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="border-black/20 bg-black/5 font-mono font-medium text-black">
                      {course.code}
                    </Badge>
                    <Badge variant="outline" className="border-black/20 font-medium text-black">
                      {course.credits} {course.credits === 1 ? "Credit" : "Credits"}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-semibold text-black">
                    {course.title}
                  </CardTitle>
                  {course.description && (
                    <CardDescription className="mt-2 line-clamp-2 font-light text-black/60">
                      {course.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {course.program && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Program</span>
                        <span className="text-sm font-semibold text-black">{course.program}</span>
                      </div>
                    )}
                    {course.semester && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Semester</span>
                        <span className="text-sm font-semibold text-black">Semester {course.semester}</span>
                      </div>
                    )}
                    {course.difficulty && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Difficulty</span>
                        <span className="text-sm font-semibold text-black">{course.difficulty}/5</span>
                      </div>
                    )}
                    {course.workload && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Workload</span>
                        <span className="text-sm font-semibold text-black">{course.workload}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                    className={page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push("ellipsis-" + p);
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item) =>
                    typeof item === "string" ? (
                      <PaginationItem key={item}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={item}>
                        <PaginationLink
                          href="#"
                          isActive={item === page}
                          onClick={(e) => { e.preventDefault(); setPage(item); }}
                          className="cursor-pointer"
                        >
                          {item}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                    className={page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}
