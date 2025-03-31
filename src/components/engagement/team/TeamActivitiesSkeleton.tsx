
import { Skeleton } from "@/components/ui/skeleton";

export function TeamActivitiesSkeleton() {
  // Show 3 skeleton items while loading
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-start space-x-4 pb-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-[120px]" />
            <Skeleton className="h-3 w-[180px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
        </div>
      ))}
    </div>
  );
}
