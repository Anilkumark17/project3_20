"use client";

import { useStreamingRecommendations } from "@/hooks/useStreamingRecommendations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function StreamingRecommendations({ clerkId }) {
  const {
    phase,
    isLoading,
    error,
    message,
    progress,
    currentRecommendations,
    ruleBasedRecommendations,
    aiRecommendations,
    finalRecommendations,
    retry,
  } = useStreamingRecommendations(clerkId, {
    enabled: !!clerkId,
    onComplete: (recommendations) => {
      toast.success(`${recommendations.length} personalized recommendations ready!`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to load recommendations");
    },
  });

  const getPhaseIcon = () => {
    switch (phase) {
      case 'rule-based':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'ai-reranking':
        return <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
    }
  };

  const getPhaseLabel = () => {
    switch (phase) {
      case 'connecting':
        return 'Connecting...';
      case 'rule-based':
        return 'Loading recommendations...';
      case 'ai-reranking':
        return 'Enhancing with AI...';
      case 'complete':
        return 'Ready!';
      case 'error':
        return 'Error';
      default:
        return 'Initializing...';
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Failed to Load Recommendations</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
          <Button onClick={retry} variant="outline" className="border-red-300 hover:bg-red-100">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      {isLoading && (
        <Card className="border-black/10">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPhaseIcon()}
                  <div>
                    <h3 className="font-semibold text-black">{getPhaseLabel()}</h3>
                    <p className="text-sm text-black/60">{message}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-black">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Grid */}
      {currentRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black">
              {phase === 'complete' ? 'Personalized Recommendations' : 'Loading Recommendations'}
            </h2>
            <Badge 
              variant="outline" 
              className={`font-semibold ${
                phase === 'complete' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {currentRecommendations.length} courses
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {currentRecommendations.map((course, index) => (
              <Card 
                key={course.id || index} 
                className={`transition-all duration-300 border-2 ${
                  phase === 'ai-reranking' && index === aiRecommendations.length - 1
                    ? 'border-purple-300 shadow-lg scale-105'
                    : 'border-black/10 hover:border-black/30'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="font-mono text-xs font-bold px-2.5 py-0.5 bg-black text-white">
                          {course.code}
                        </Badge>
                        {course.priority && (
                          <Badge variant="outline" className="text-xs">
                            #{course.priority}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-base leading-tight">{course.title}</CardTitle>
                    </div>
                    {phase === 'ai-reranking' && index >= ruleBasedRecommendations.length && (
                      <Sparkles className="h-4 w-4 text-purple-600 animate-pulse flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {course.reason && (
                    <p className="text-sm text-black/70 mb-3 line-clamp-2">
                      {course.reason}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-black/60">
                    <span className="font-medium">{course.credits} Credits</span>
                    {course.difficulty && (
                      <>
                        <span>•</span>
                        <span>Difficulty: {course.difficulty}/5</span>
                      </>
                    )}
                    {course.score && (
                      <>
                        <span>•</span>
                        <span>Match: {Math.round(course.score * 100)}%</span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Phase Indicator */}
          {phase === 'ai-reranking' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full">
                <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
                <span className="text-sm font-medium text-purple-900">
                  AI is enhancing your recommendations...
                </span>
              </div>
            </div>
          )}

          {phase === 'complete' && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  All recommendations loaded!
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && currentRecommendations.length === 0 && !error && (
        <Card className="border-dashed border-2 border-black/20">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-fit rounded-full bg-black/5 p-6 mb-4">
              <Sparkles className="h-10 w-10 text-black/40" />
            </div>
            <h3 className="text-xl font-bold text-black mb-2">No Recommendations Yet</h3>
            <p className="text-black/60">
              Complete your profile to get personalized course recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
