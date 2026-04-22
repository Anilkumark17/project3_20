"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUpdateProfile, useUser as useUserData } from "@/hooks/useAuth";
import { Loader2, GraduationCap, BookOpen, Target, CheckCircle2, AlertCircle } from "lucide-react";

const PROGRAMS = [
  { value: "CSE", label: "Computer Science and Engineering (CSE)" },
  { value: "PDM", label: "Product Design and Manufacturing (PDM)" },
  { value: "CSIS", label: "Computer Science and Information Systems (CSIS)" },
  { value: "CASE", label: "Computer and Systems Engineering (CASE)" },
];

const SEMESTERS = Array.from({ length: 8 }, (_, i) => ({
  value: i + 1,
  label: `Semester ${i + 1}`,
}));

const GOALS = [
  { value: "Placement", label: "Placement - Prepare for job opportunities" },
  { value: "Research", label: "Research - Focus on academic research" },
  { value: "Skills", label: "Skills - Develop technical expertise" },
];

export default function ProfilePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { data: userData, isLoading, refetch } = useUserData(user?.id);
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    program: "",
    semester: "",
    goal: "",
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateProfileMutation.mutateAsync({
        clerkId: user.id,
        profileData: {
          program: formData.program,
          semester: parseInt(formData.semester),
          goal: formData.goal,
        },
      });
      setIsEditing(false);
      refetch();
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const handleCancel = () => {
    const profileData = userData?.data?.profile;
    if (profileData) {
      setFormData({
        program: profileData.program || "",
        semester: profileData.semester?.toString() || "",
        goal: profileData.goal || "",
      });
    }
    setIsEditing(false);
  };

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

  const profile = userData?.data?.profile;
  const dbUser = userData?.data?.user;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold tracking-tight text-black">
                My Profile
              </h1>
              <p className="mt-3 text-lg font-light text-black/60">
                Manage your academic journey and track your progress
              </p>
            </div>
            {profile && (
              <Badge className="h-10 gap-2 border-black/20 bg-black/5 px-4 text-sm font-semibold text-black">
                <CheckCircle2 className="h-4 w-4" />
                Profile Active
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Main Profile Card */}
          <Card className="shadow-xl border-black/5 bg-white lg:col-span-8">
            <CardHeader className="border-b border-black/5 bg-gradient-to-r from-black to-gray-800 pb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">Academic Information</CardTitle>
                    <CardDescription className="mt-1 font-light text-white/80">
                      Your program, semester, and academic goals
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button
                    onClick={() => {
                      const profileData = userData?.data?.profile;
                      if (profileData) {
                        setFormData({
                          program: profileData.program || "",
                          semester: profileData.semester?.toString() || "",
                          goal: profileData.goal || "",
                        });
                      }
                      setIsEditing(true);
                    }}
                    className="bg-white font-semibold text-black hover:bg-white/90"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="program" className="text-sm font-semibold uppercase tracking-wide text-black/70">
                      Academic Program
                    </Label>
                    <Select
                      value={formData.program}
                      onValueChange={(value) => setFormData({ ...formData, program: value })}
                    >
                      <SelectTrigger id="program" className="h-14 border-2 border-black/10 font-medium shadow-sm transition-all hover:border-black/30 focus:border-black">
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
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="semester" className="text-sm font-semibold uppercase tracking-wide text-black/70">
                      Current Semester
                    </Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger id="semester" className="h-14 border-2 border-black/10 font-medium shadow-sm transition-all hover:border-black/30 focus:border-black">
                        <SelectValue placeholder="Select your semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEMESTERS.map((semester) => (
                          <SelectItem key={semester.value} value={semester.value.toString()}>
                            {semester.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="goal" className="text-sm font-semibold uppercase tracking-wide text-black/70">
                      Academic Goal
                    </Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => setFormData({ ...formData, goal: value })}
                    >
                      <SelectTrigger id="goal" className="h-14 border-2 border-black/10 font-medium shadow-sm transition-all hover:border-black/30 focus:border-black">
                        <SelectValue placeholder="Select your goal" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOALS.map((goal) => (
                          <SelectItem key={goal.value} value={goal.value}>
                            {goal.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 h-12 bg-black font-semibold text-white shadow-lg hover:bg-black/90 hover:shadow-xl transition-all"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="outline"
                      className="flex-1 h-12 border-2 border-black/20 font-semibold hover:bg-black/5 transition-all"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="rounded-lg border border-black/10 bg-gray-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Program</p>
                    <p className="mt-2 text-2xl font-bold text-black">
                      {profile?.program ? (
                        PROGRAMS.find((p) => p.value === profile.program)?.label
                      ) : (
                        <span className="text-black/40">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-gray-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Current Semester</p>
                    <p className="mt-2 text-2xl font-bold text-black">
                      {profile?.semester ? (
                        `Semester ${profile.semester}`
                      ) : (
                        <span className="text-black/40">Not set</span>
                      )}
                    </p>
                  </div>
                  <div className="rounded-lg border border-black/10 bg-gray-50 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Academic Goal</p>
                    <p className="mt-2 text-2xl font-bold text-black">
                      {profile?.goal ? (
                        GOALS.find((g) => g.value === profile.goal)?.label
                      ) : (
                        <span className="text-black/40">Not set</span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Sidebar */}
          <div className="space-y-6 lg:col-span-4">
            <Card className="shadow-xl border-black/10 bg-white">
              <CardHeader className="border-b border-black/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-black p-3">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-black">Academic Progress</CardTitle>
                    <CardDescription className="text-sm font-light text-black/60">
                      Your journey so far
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border-2 border-black/10 bg-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Credits Earned</p>
                    <Badge className="bg-black text-white border-black">Total</Badge>
                  </div>
                  <p className="mt-3 text-5xl font-black text-black">
                    {profile?.creditsCompleted || 0}
                  </p>
                  <p className="mt-1 text-sm font-medium text-black/50">credits completed</p>
                </div>
                <div className="rounded-xl border-2 border-black/10 bg-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-black/50">Courses Done</p>
                    <Badge className="bg-black/90 text-white border-black">Count</Badge>
                  </div>
                  <p className="mt-3 text-5xl font-black text-black">0</p>
                  <p className="mt-1 text-sm font-medium text-black/50">courses finished</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info Card */}
            <Card className="shadow-lg border-black/10 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-black/10 p-3">
                    <Target className="h-5 w-5 text-black" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black">Next Steps</h3>
                    <p className="mt-1 text-sm text-black/60">
                      Add your completed courses to get personalized recommendations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Completed Courses Section */}
        <Card className="mt-8 shadow-xl border-black/10 bg-white">
          <CardHeader className="border-b border-black/10 bg-black pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-white">Completed Courses</CardTitle>
                  <CardDescription className="mt-1 font-light text-white/80">
                    Track your academic achievements
                  </CardDescription>
                </div>
              </div>
              <Button className="bg-white font-semibold text-black shadow-lg hover:bg-gray-100 transition-all">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Course
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="rounded-xl border-2 border-dashed border-black/20 bg-gray-50 p-12 text-center">
              <div className="mx-auto w-fit rounded-full bg-black/10 p-6">
                <AlertCircle className="h-12 w-12 text-black" />
              </div>
              <h3 className="mt-6 text-xl font-bold text-black">No Courses Added Yet</h3>
              <p className="mt-2 text-base text-black/60">
                Start building your academic profile by adding courses you&apos;ve completed.
                This helps us provide better recommendations tailored to your progress.
              </p>
              <Button className="mt-6 bg-black font-semibold text-white hover:bg-black/90">
                <BookOpen className="mr-2 h-4 w-4" />
                Add Your First Course
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
