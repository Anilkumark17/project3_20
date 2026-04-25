"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSearchCourses } from "@/hooks/useCourses";
import { useAddCompletedCourse } from "@/hooks/useCompletedCourses";
import { Loader2, BookOpen, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

const GRADES = [
  { value: "A", label: "A" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B", label: "B" },
  { value: "B-", label: "B-" },
  { value: "C+", label: "C+" },
  { value: "C", label: "C" },
  { value: "C-", label: "C-" },
  { value: "D", label: "D" },
  { value: "F", label: "F" },
  { value: "P", label: "Pass" },
];

export function AddCourseDialog({ clerkId, trigger, completedCourseIds = [] }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [grade, setGrade] = useState("");

  const { data, isLoading } = useSearchCourses({ keyword: searchTerm }, 1);
  const addCourseMutation = useAddCompletedCourse();

  const availableCourses = (data?.courses || []).filter(
    (course) => !completedCourseIds.includes(course.id)
  );

  const handleSubmit = async () => {
    if (!selectedCourse || !grade) return;

    try {
      await addCourseMutation.mutateAsync({
        clerkId,
        courseId: selectedCourse.id,
        grade,
      });
      setOpen(false);
      setSelectedCourse(null);
      setGrade("");
      setSearchTerm("");
    } catch (error) {
      console.error("Failed to add course:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-black font-semibold text-white hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Completed Course</DialogTitle>
          <DialogDescription>
            Search for a course you've completed and add it to your profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Course</Label>
            <Input
              id="search"
              placeholder="Search by course code or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course">Select Course</Label>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : availableCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                {searchTerm ? "No courses found" : "Start typing to search for courses"}
              </p>
            ) : (
              <Select
                value={selectedCourse?.id?.toString()}
                onValueChange={(value) => {
                  const course = availableCourses.find((c) => c.id.toString() === value);
                  setSelectedCourse(course);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{course.code}</span>
                        <span className="text-sm text-muted-foreground">{course.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Grade Selection */}
          {selectedCourse && (
            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {GRADES.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedCourse || !grade || addCourseMutation.isPending}
          >
            {addCourseMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Add Course
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
