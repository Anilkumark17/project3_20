"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw, BookOpen } from "lucide-react";
import { useRecommendations, useRefreshRecommendations } from "@/hooks/useRecommendations";

export default function RecommendationsPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  const clerkId = user?.id;
  const { data, isLoading, error } = useRecommendations(clerkId);
  const { mutate: refresh, isPending: isRefreshing } = useRefreshRecommendations();

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  const recommendations = data?.recommendations || [];
  const generatedAt = data?.generatedAt ? new Date(data.generatedAt).toLocaleString() : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">Recommendations</h1>
            <p className="mt-2 text-lg font-light text-black/60">
              AI-powered course suggestions based on your profile and goals
            </p>
            {generatedAt && (
              <p className="mt-1 text-sm text-black/40">Last generated: {generatedAt}</p>
            )}
          </div>
          <Button
            onClick={() => refresh(clerkId)}
            disabled={isRefreshing}
            variant="outline"
            className="border-black/20 font-medium hover:bg-black/5"
          >
            {isRefreshing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isRefreshing ? "Generating..." : "Refresh"}
          </Button>
        </div>

        {/* Content */}
        {error ? (
          <Card className="border-black/10">
            <CardContent className="py-12 text-center">
              <p className="font-medium text-black/60">Failed to load recommendations. Please try again.</p>
            </CardContent>
          </Card>
        ) : recommendations.length === 0 ? (
          <Card className="border-black/10">
            <CardContent className="py-12 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-black/20" />
              <p className="text-lg font-semibold text-black">No recommendations yet</p>
              <p className="mt-1 font-light text-black/60">
                Complete your profile with your program and goals, then click Refresh.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec, idx) => (
              <Card
                key={rec.id}
                className="border-black/10 transition-all hover:border-black/20 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline" className="border-black/20 bg-black/5 font-mono font-medium text-black">
                      {rec.code}
                    </Badge>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="border-black/20 font-medium text-black">
                        #{idx + 1}
                      </Badge>
                      <Badge variant="outline" className="border-black/20 font-medium text-black">
                        {rec.credits} {rec.credits === 1 ? "Credit" : "Credits"}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-semibold text-black">{rec.title}</CardTitle>
                  {rec.description && (
                    <CardDescription className="mt-1 line-clamp-2 font-light text-black/60">
                      {rec.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {rec.reason && (
                    <div className="rounded-lg bg-black/5 p-3">
                      <div className="mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-black/50" />
                        <span className="text-xs font-semibold uppercase tracking-wide text-black/50">
                          Why this course
                        </span>
                      </div>
                      <p className="text-sm font-light text-black/80">{rec.reason}</p>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    {rec.program && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Program</span>
                        <span className="text-sm font-semibold text-black">{rec.program}</span>
                      </div>
                    )}
                    {rec.semester && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Semester</span>
                        <span className="text-sm font-semibold text-black">
                          {rec.semester === 1 ? "Monsoon" : "Spring"}
                        </span>
                      </div>
                    )}
                    {rec.difficulty && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-black/50">Difficulty</span>
                        <span className="text-sm font-semibold text-black">{rec.difficulty}/5</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
