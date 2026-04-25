"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Loader2, Star } from "lucide-react";

const CourseCard = memo(({ 
  course, 
  isAdded, 
  isLoading, 
  onAdd,
  showDifficulty = true,
  compact = false 
}) => {
  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2) return "bg-white text-black border-black/30";
    if (difficulty === 3) return "bg-black/10 text-black border-black/40";
    return "bg-black text-white border-black";
  };

  const getDifficultyLabel = (difficulty) => {
    if (difficulty <= 2) return "Easy";
    if (difficulty === 3) return "Medium";
    return "Hard";
  };

  return (
    <Card 
      className={`group transition-all duration-300 ${
        isAdded 
          ? 'bg-black/5 border-2 border-black shadow-sm' 
          : 'bg-white border-2 border-black/10 hover:border-black hover:shadow-xl'
      }`}
    >
      <CardContent className="p-6">
        <div className="flex gap-5">
          {/* Left side - Course info */}
          <div className="flex-1 min-w-0">
            {/* Course Code and Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge 
                className="font-mono text-sm font-bold px-3 py-1.5 bg-black text-white border-none"
              >
                {course.code}
              </Badge>
              
              {course.program && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-2.5 py-1 bg-white text-black border-black/30 font-bold"
                >
                  {course.program}
                </Badge>
              )}

              {showDifficulty && course.difficulty && (
                <Badge 
                  className={`text-xs px-2.5 py-1 border-2 font-bold ${getDifficultyColor(course.difficulty)}`}
                >
                  {getDifficultyLabel(course.difficulty)}
                </Badge>
              )}
            </div>

            {/* Course Title */}
            <h4 className="font-bold text-lg leading-tight text-black line-clamp-2 mb-2.5">
              {course.title}
            </h4>

            {/* Course Description */}
            {!compact && course.description && (
              <p className="text-sm text-black/70 line-clamp-2 mb-4 leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Course Meta */}
            <div className="flex items-center gap-5 text-sm text-black/60">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-bold text-black">{course.credits}</span>
                <span className="font-medium">{course.credits === 1 ? 'Credit' : 'Credits'}</span>
              </span>
              {course.semester && (
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-black"></span>
                  <span className="font-medium">Semester {course.semester}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right side - Action Button */}
          <div className="flex-shrink-0 flex items-start">
            <Button
              size="lg"
              className={`min-w-[110px] font-bold text-sm transition-all duration-200 ${
                isAdded 
                  ? 'bg-black/10 text-black border-2 border-black/20 cursor-not-allowed hover:bg-black/10' 
                  : 'bg-black text-white hover:bg-black/90 shadow-lg hover:shadow-xl border-2 border-black'
              }`}
              onClick={() => !isAdded && onAdd(course)}
              disabled={isAdded || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : isAdded ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Added
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CourseCard.displayName = "CourseCard";

export default CourseCard;
