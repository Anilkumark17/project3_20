"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen, AlertCircle, Plus, CheckCircle2 } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { useCompletedCourses, useAddCompletedCourse } from "@/hooks/useCompletedCourses";
import CourseSearchBar from "./CourseSearchBar";
import CourseCard from "./CourseCard";
import Fuse from "fuse.js";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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

const FUSE_OPTIONS = {
  keys: [
    { name: "code", weight: 0.4 },
    { name: "title", weight: 0.3 },
    { name: "description", weight: 0.2 },
    { name: "program", weight: 0.1 },
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export default function AddCourseModal({ clerkId, trigger }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [addingCourseId, setAddingCourseId] = useState(null);

  const { data: coursesData, isLoading: coursesLoading } = useCourses();
  const { data: completedCourses = [], isLoading: completedLoading } = useCompletedCourses(clerkId);
  const addCourseMutation = useAddCompletedCourse();

  const allCourses = useMemo(
    () => coursesData?.courses || [],
    [coursesData?.courses]
  );

  const completedCourseIds = useMemo(
    () => new Set(completedCourses.map((c) => c.courseId)),
    [completedCourses]
  );

  const fuse = useMemo(
    () => new Fuse(allCourses, FUSE_OPTIONS),
    [allCourses]
  );

  const filteredCourses = useMemo(() => {
    if (!searchQuery.trim()) {
      return allCourses.slice(0, 50);
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item).slice(0, 50);
  }, [searchQuery, allCourses, fuse]);

  const handleAddCourse = useCallback(async (course) => {
    setSelectedCourse(course);
  }, []);

  const handleConfirmAdd = useCallback(async () => {
    if (!selectedCourse || !selectedGrade) {
      toast.error("Please select a grade");
      return;
    }

    setAddingCourseId(selectedCourse.id);

    try {
      await addCourseMutation.mutateAsync({
        clerkId,
        courseId: selectedCourse.id,
        grade: selectedGrade,
      });

      toast.success(`${selectedCourse.code} added successfully!`, {
        description: `Grade: ${selectedGrade}`,
      });

      setSelectedCourse(null);
      setSelectedGrade("");
      setAddingCourseId(null);
    } catch (error) {
      console.error("Failed to add course:", error);
      
      if (error.message.includes("already")) {
        toast.error("Course already added", {
          description: "This course is already in your profile",
        });
      } else {
        toast.error("Failed to add course", {
          description: error.message || "Please try again",
        });
      }
      
      setAddingCourseId(null);
    }
  }, [selectedCourse, selectedGrade, clerkId, addCourseMutation]);

  const handleCancelGrade = useCallback(() => {
    setSelectedCourse(null);
    setSelectedGrade("");
  }, []);

  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setSearchQuery("");
        setSelectedCourse(null);
        setSelectedGrade("");
        setAddingCourseId(null);
      }, 150);
    }
  }, []);

  const isLoading = coursesLoading || completedLoading;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-black text-white hover:bg-black/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] p-0 gap-0 bg-white">
        <DialogHeader className="px-8 pt-8 pb-6 border-b border-black/10">
          <DialogTitle className="text-3xl font-bold text-black tracking-tight">Add Completed Course</DialogTitle>
          <DialogDescription className="text-black/60 mt-2 text-base">
            Search and add courses you&apos;ve completed to your academic profile
          </DialogDescription>
        </DialogHeader>

        <div className="px-8 py-6 bg-black">
          <CourseSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by course code, title, or description..."
          />
        </div>

        <ScrollArea className="h-[520px] px-8 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-black mb-4" />
              <p className="text-base text-black/60 font-medium">Loading courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="rounded-full bg-black p-8 mb-6">
                <AlertCircle className="h-14 w-14 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">No courses found</h3>
              <p className="text-base text-black/60 text-center max-w-md leading-relaxed">
                {searchQuery
                  ? "Try adjusting your search terms or clear the search to browse all courses"
                  : "No courses available at the moment"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isAdded={completedCourseIds.has(course.id)}
                  isLoading={addingCourseId === course.id}
                  onAdd={handleAddCourse}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {filteredCourses.length > 0 && (
          <div className="px-8 py-4 border-t border-black/10 bg-black">
            <p className="text-sm text-white/80 font-medium">
              Showing <span className="text-white font-bold">{filteredCourses.length}</span> of <span className="text-white font-bold">{allCourses.length}</span> courses
              {searchQuery && <span className="text-white/60"> • Filtered by search</span>}
            </p>
          </div>
        )}
      </DialogContent>

      {/* Grade Selection Dialog */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && handleCancelGrade()}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-black">Select Grade</DialogTitle>
              <DialogDescription className="text-black/60 text-base">
                Choose the grade you received for this course
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
              <div className="rounded-2xl border-2 border-black p-6 bg-white shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="font-mono text-xs font-bold px-3 py-1 bg-black text-white">
                    {selectedCourse.code}
                  </Badge>
                  {selectedCourse.program && (
                    <Badge variant="outline" className="text-xs px-2.5 py-1 bg-white text-black border-black/20 font-semibold">
                      {selectedCourse.program}
                    </Badge>
                  )}
                </div>
                <p className="text-lg font-bold text-black leading-tight">{selectedCourse.title}</p>
                <p className="text-sm text-black/60 mt-2 font-medium">
                  {selectedCourse.credits} {selectedCourse.credits === 1 ? 'Credit' : 'Credits'}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="grade" className="text-sm font-bold text-black uppercase tracking-wide">
                  Grade Received
                </Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger id="grade" className="h-14 text-base border-2 border-black/20 focus:border-black focus:ring-2 focus:ring-black/10 font-semibold">
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((grade) => (
                      <SelectItem key={grade.value} value={grade.value} className="text-base font-semibold">
                        {grade.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={handleCancelGrade}
                className="px-8 border-2 border-black/20 hover:bg-black/5 font-semibold"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAdd}
                disabled={!selectedGrade || addCourseMutation.isPending}
                className="bg-black text-white hover:bg-black/90 px-8 shadow-lg font-semibold"
              >
                {addCourseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm & Add
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
