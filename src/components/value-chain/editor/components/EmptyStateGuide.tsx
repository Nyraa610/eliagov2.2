
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Plus } from "lucide-react";

interface EmptyStateGuideProps {
  onOpenAutomatedBuilder: () => void;
}

export function EmptyStateGuide({ onOpenAutomatedBuilder }: EmptyStateGuideProps) {
  return (
    <Card className="mb-6 border-dashed border-2 max-w-3xl mx-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Start Building Your Value Chain</CardTitle>
        <CardDescription>
          Create a visualization of your company's value chain to identify activities that create value
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pb-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-start gap-2">
            <div className="bg-blue-100 rounded-full p-1.5 text-blue-500 mt-0.5">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Add activities manually</h4>
              <p className="text-sm text-muted-foreground">Use the toolbar above to add primary activities, support activities, or external factors</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <div className="bg-purple-100 rounded-full p-1.5 text-purple-500 mt-0.5">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium">Or generate with AI</h4>
              <p className="text-sm text-muted-foreground">Our AI can analyze your company information and create a value chain model</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="gap-2 w-full" onClick={onOpenAutomatedBuilder}>
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </CardFooter>
    </Card>
  );
}
