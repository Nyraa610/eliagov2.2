
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, Wand2, Plus } from "lucide-react";

interface EmptyStateGuideProps {
  onOpenAIDialog: () => void;
  onOpenUploadDialog: () => void;
  onOpenAutomatedBuilder: () => void;
}

export function EmptyStateGuide({ 
  onOpenAIDialog, 
  onOpenUploadDialog,
  onOpenAutomatedBuilder
}: EmptyStateGuideProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-semibold mb-6 text-center">Create Your Value Chain</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manual Creation</CardTitle>
              <CardDescription>Build your value chain from scratch</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add nodes and connections to create a custom value chain that perfectly matches your business.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full gap-1" onClick={onOpenAIDialog}>
                <Plus className="h-4 w-4" />
                Start Building
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">AI Generation</CardTitle>
              <CardDescription>Let AI create a value chain for you</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our AI can generate a complete value chain based on your company details and industry.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" className="w-full gap-1" onClick={onOpenAutomatedBuilder}>
                <Wand2 className="h-4 w-4" />
                Generate with AI
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upload Documents</CardTitle>
              <CardDescription>Use existing documents</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upload existing value chain diagrams, pitch decks, or business documents to inform your model.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full gap-1" onClick={onOpenUploadDialog}>
                <FileUp className="h-4 w-4" />
                Upload Documents
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
