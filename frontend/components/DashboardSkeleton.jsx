import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <Skeleton className="h-12 w-80 mb-4 bg-black/10" />
          <Skeleton className="h-6 w-96 bg-black/10" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-black/10">
              <CardHeader>
                <Skeleton className="h-7 w-48 bg-black/10" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2 bg-black/10" />
                  <Skeleton className="h-5 w-36 bg-black/10" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2 bg-black/10" />
                  <Skeleton className="h-5 w-36 bg-black/10" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2 bg-black/10" />
                  <Skeleton className="h-5 w-36 bg-black/10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-black/10">
          <CardContent className="pt-6">
            <Skeleton className="h-6 w-40 mb-4 bg-black/10" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full bg-black/10" />
              <Skeleton className="h-4 w-full bg-black/10" />
              <Skeleton className="h-4 w-3/4 bg-black/10" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
