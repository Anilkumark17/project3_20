"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Target, Loader2 } from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-16">
      <div className="max-w-5xl text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm font-medium text-black">
          <Sparkles className="h-4 w-4" />
          AI-Powered Course Planning
        </div>
        
        <h1 className="mb-6 text-6xl font-bold tracking-tight text-black md:text-7xl lg:text-8xl">
          Intelligent Course Advisor
        </h1>
        
        <p className="mb-12 text-xl font-light text-black/60 md:text-2xl">
          Get personalized course recommendations based on your academic goals and progress
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="bg-black px-8 text-lg font-medium text-white hover:bg-black/90">
              Get Started
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="border-2 border-black/20 px-8 text-lg font-medium hover:bg-black/5">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3">
          <Card className="border-black/10 bg-white transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-black">Smart Recommendations</CardTitle>
              <CardDescription className="text-base font-light text-black/60">
                AI-powered course suggestions tailored to your goals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-black/10 bg-white transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-black">Track Progress</CardTitle>
              <CardDescription className="text-base font-light text-black/60">
                Monitor your academic journey and credits
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-black/10 bg-white transition-all hover:border-black/20 hover:shadow-lg">
            <CardHeader className="space-y-4">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-black">
                <Target className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-black">Optimize Workload</CardTitle>
              <CardDescription className="text-base font-light text-black/60">
                Balance difficulty and manage your semester load
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
