
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface CompanyLoadingStateProps {
  userCompany: string | null;
  analyzingProgress: number;
}

export function CompanyLoadingState({ userCompany, analyzingProgress }: CompanyLoadingStateProps) {
  return (
    <>
      {userCompany ? (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Analyzing: {userCompany}</h3>
          
          <div className="space-y-3">
            <Progress value={analyzingProgress} className="h-2" />
            
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Gathering information...</span>
              <span>{analyzingProgress}%</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {analyzingProgress < 20 ? "Initializing company analysis..." : 
                 analyzingProgress < 40 ? "Researching industry details..." :
                 analyzingProgress < 60 ? "Gathering company history..." :
                 analyzingProgress < 80 ? "Processing market position..." :
                 "Finalizing company profile..."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}
    </>
  );
}
