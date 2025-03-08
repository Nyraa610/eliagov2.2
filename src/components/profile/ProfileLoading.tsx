
import { Loader2 } from "lucide-react";

export function ProfileLoading() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
