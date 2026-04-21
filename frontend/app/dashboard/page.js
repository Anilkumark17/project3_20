"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSyncUser, useUser as useUserData } from "@/hooks/useAuth";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, BookOpen, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const syncUserMutation = useSyncUser();
  const { data: userData, isLoading, error, refetch } = useUserData(user?.id);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const syncUser = async () => {
      if (!user || syncUserMutation.isPending) return;

      const syncData = {
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
      };

      try {
        await syncUserMutation.mutateAsync(syncData);
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    if (user && isSignedIn) {
      syncUser();
    }
  }, [user, isSignedIn]);

  // Check if profile is complete, redirect to onboarding if not
  useEffect(() => {
    if (userData?.data?.profile) {
      const profile = userData.data.profile;
      const isProfileComplete = profile.program && profile.semester && profile.goal;
      
      if (!isProfileComplete) {
        router.push("/onboarding");
      }
    }
  }, [userData, router]);

  if (!isLoaded || isLoading) {
    return <DashboardSkeleton />;
  }

  if (!isSignedIn) {
    return null;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Error Loading Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => refetch()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = userData?.data?.profile;
  const dbUser = userData?.data?.user;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight text-black">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="mt-3 text-xl font-light text-black/60">
            Here&apos;s your academic overview and personalized recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="border-black/10 transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl bg-black p-2.5">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Profile Information</span>
              </CardTitle>
              <CardDescription className="font-light text-black/60">Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-black/50">Name</p>
                <p className="text-base font-semibold text-black">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">Email</p>
                <p className="text-base font-semibold text-black truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">User ID</p>
                <p className="text-xs font-mono text-black/60">{dbUser?.id}</p>
              </div>
              {dbUser && (
                <Badge variant="outline" className="gap-1.5 border-black/20 bg-black/5 font-medium text-black">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced with backend
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card className="border-black/10 transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl bg-black p-2.5">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Academic Progress</span>
              </CardTitle>
              <CardDescription className="font-light text-black/60">Track your journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-black/50">Program</p>
                <p className="text-base font-semibold text-black">
                  {profile?.program || <span className="text-black/40">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">Current Semester</p>
                <p className="text-base font-semibold text-black">
                  {profile?.semester || <span className="text-black/40">Not set</span>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">Credits Completed</p>
                <p className="text-3xl font-bold text-black">
                  {profile?.creditsCompleted || 0}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-black/50">Goal</p>
                <p className="text-base font-semibold text-black">
                  {profile?.goal || <span className="text-black/40">Not set</span>}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-black/10 transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl bg-black p-2.5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-black">Quick Actions</span>
              </CardTitle>
              <CardDescription className="font-light text-black/60">Get started quickly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2 bg-black font-medium text-white hover:bg-black/90" size="lg">
                📝 Setup Profile
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-black/20 font-medium hover:bg-black/5" size="lg">
                📚 Browse Courses
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 border-black/20 font-medium hover:bg-black/5" size="lg">
                ✨ Get Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>

        <Alert className="mt-8 border-black/10 bg-black/5">
          <Sparkles className="h-4 w-4 text-black" />
          <AlertDescription className="text-black">
            <p className="font-semibold mb-3 text-lg">🎯 Next Steps</p>
            <ul className="space-y-2 font-light">
              <li>• Complete your profile to get personalized recommendations</li>
              <li>• Add courses you&apos;ve already completed</li>
              <li>• Explore the course catalog</li>
              <li>• Get AI-powered semester planning suggestions</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
