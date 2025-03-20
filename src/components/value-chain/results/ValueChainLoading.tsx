
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ValueChainLoading = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[500px] w-full" />
      </CardContent>
    </Card>
  );
};
