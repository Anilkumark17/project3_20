"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateProfile } from "@/hooks/useAuth";
import { Loader2, GraduationCap } from "lucide-react";

const PROGRAMS = [
  { value: "CSE", label: "Computer Science and Engineering (CSE)" },
  { value: "PDM", label: "Product Design and Manufacturing (PDM)" },
  { value: "CSIS", label: "Computer Science and Information Systems (CSIS)" },
  { value: "CASE", label: "Computer and Systems Engineering (CASE)" },
];

const SEMESTERS = [
  { value: 1, label: "Semester 1" },
  { value: 2, label: "Semester 2" },
  { value: 3, label: "Semester 3" },
  { value: 4, label: "Semester 4" },
  { value: 5, label: "Semester 5" },
  { value: 6, label: "Semester 6" },
  { value: 7, label: "Semester 7" },
  { value: 8, label: "Semester 8" },
];

const GOALS = [
  { value: "Placement", label: "Placement - Prepare for job opportunities" },
  { value: "Research", label: "Research - Focus on academic research" },
  { value: "Skills", label: "Skills - Develop technical expertise" },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    program: "",
    semester: "",
    goal: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.program) newErrors.program = "Please select your program";
    if (!formData.semester) newErrors.semester = "Please select your semester";
    if (!formData.goal) newErrors.goal = "Please select your goal";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await updateProfileMutation.mutateAsync({
        clerkId: user.id,
        profileData: {
          program: formData.program,
          semester: parseInt(formData.semester),
          goal: formData.goal,
        },
      });
      router.push("/dashboard");
    } catch (error) {
      console.error("Profile setup error:", error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-16">
      <Card className="w-full max-w-2xl border-black/10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-black">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-black">
            Complete Your Profile
          </CardTitle>
          <CardDescription className="text-lg font-light text-black/60">
            Help us personalize your course recommendations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Program Selection */}
            <div className="space-y-2">
              <Label htmlFor="program" className="text-base font-medium text-black">
                Program *
              </Label>
              <Select
                value={formData.program}
                onValueChange={(value) => {
                  setFormData({ ...formData, program: value });
                  setErrors({ ...errors, program: "" });
                }}
              >
                <SelectTrigger
                  id="program"
                  className={`h-12 border-black/20 font-medium ${
                    errors.program ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select your program" />
                </SelectTrigger>
                <SelectContent>
                  {PROGRAMS.map((program) => (
                    <SelectItem key={program.value} value={program.value}>
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.program && (
                <p className="text-sm font-medium text-red-500">{errors.program}</p>
              )}
            </div>

            {/* Semester Selection */}
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-base font-medium text-black">
                Current Semester *
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => {
                  setFormData({ ...formData, semester: value });
                  setErrors({ ...errors, semester: "" });
                }}
              >
                <SelectTrigger
                  id="semester"
                  className={`h-12 border-black/20 font-medium ${
                    errors.semester ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select your current semester" />
                </SelectTrigger>
                <SelectContent>
                  {SEMESTERS.map((semester) => (
                    <SelectItem key={semester.value} value={semester.value.toString()}>
                      {semester.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.semester && (
                <p className="text-sm font-medium text-red-500">{errors.semester}</p>
              )}
            </div>

            {/* Goal Selection */}
            <div className="space-y-2">
              <Label htmlFor="goal" className="text-base font-medium text-black">
                Academic Goal *
              </Label>
              <Select
                value={formData.goal}
                onValueChange={(value) => {
                  setFormData({ ...formData, goal: value });
                  setErrors({ ...errors, goal: "" });
                }}
              >
                <SelectTrigger
                  id="goal"
                  className={`h-12 border-black/20 font-medium ${
                    errors.goal ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Select your academic goal" />
                </SelectTrigger>
                <SelectContent>
                  {GOALS.map((goal) => (
                    <SelectItem key={goal.value} value={goal.value}>
                      {goal.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.goal && (
                <p className="text-sm font-medium text-red-500">{errors.goal}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="h-12 w-full bg-black text-base font-medium text-white hover:bg-black/90"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up your profile...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>

            {updateProfileMutation.isError && (
              <p className="text-center text-sm font-medium text-red-500">
                Failed to save profile. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
