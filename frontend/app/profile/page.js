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
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-black">
            Student Profile
          </h1>
          <p className="mt-2 text-lg font-light text-black/60">
            Manage your academic information and track your progress
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Profile Information Card */}
          <Card className="border-black/10 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-black p-2.5">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="font-semibold text-black">Academic Profile</CardTitle>
                    <CardDescription className="font-light text-black/60">
                      Your program and academic goals
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
                    variant="outline"
                    className="border-black/20 font-medium hover:bg-black/5"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="program" className="text-base font-medium text-black">
                      Program
                    </Label>
                    <Select
                      value={formData.program}
                      onValueChange={(value) => setFormData({ ...formData, program: value })}
                    >
                      <SelectTrigger id="program" className="h-12 border-black/20 font-medium">
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

                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-base font-medium text-black">
                      Current Semester
                    </Label>
                    <Select
                      value={formData.semester}
                      onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    >
                      <SelectTrigger id="semester" className="h-12 border-black/20 font-medium">
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

                  <div className="space-y-2">
                    <Label htmlFor="goal" className="text-base font-medium text-black">
                      Academic Goal
                    </Label>
                    <Select
                      value={formData.goal}
                      onValueChange={(value) => setFormData({ ...formData, goal: value })}
                    >
                      <SelectTrigger id="goal" className="h-12 border-black/20 font-medium">
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

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="flex-1 bg-black font-medium text-white hover:bg-black/90"
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
                      className="flex-1 border-black/20 font-medium hover:bg-black/5"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-black/50">Program</p>
                    <p className="text-lg font-semibold text-black">
                      {profile?.program ? (
                        PROGRAMS.find((p) => p.value === profile.program)?.label
                      ) : (
                        <span className="text-black/40">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black/50">Current Semester</p>
                    <p className="text-lg font-semibold text-black">
                      {profile?.semester ? (
                        `Semester ${profile.semester}`
                      ) : (
                        <span className="text-black/40">Not set</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black/50">Academic Goal</p>
                    <p className="text-lg font-semibold text-black">
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

          {/* Stats Card */}
          <Card className="border-black/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-black p-2.5">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-semibold text-black">Progress</CardTitle>
                  <CardDescription className="font-light text-black/60">
                    Your statistics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-black/50">Credits Completed</p>
                <p className="text-3xl font-bold text-black">
                  {profile?.creditsCompleted || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">Courses Completed</p>
                <p className="text-3xl font-bold text-black">0</p>
              </div>
              {dbUser && (
                <Badge variant="outline" className="gap-1.5 border-black/20 bg-black/5 font-medium text-black">
                  <CheckCircle2 className="h-3 w-3" />
                  Profile Active
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Courses Section */}
        <Card className="mt-6 border-black/10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-black p-2.5">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="font-semibold text-black">Completed Courses</CardTitle>
                  <CardDescription className="font-light text-black/60">
                    Track courses you&apos;ve finished
                  </CardDescription>
                </div>
              </div>
              <Button className="bg-black font-medium text-white hover:bg-black/90">
                Add Course
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Alert className="border-black/10 bg-black/5">
              <AlertCircle className="h-4 w-4 text-black" />
              <AlertDescription className="font-light text-black">
                No completed courses added yet. Start by adding courses you&apos;ve already completed to get personalized recommendations.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
