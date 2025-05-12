
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

export function ESGLaunchpadCard() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-primary" />
          ESG QuickStart Launchpad
        </CardTitle>
        <CardDescription>
          Get your ESG journey started in just 3 minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2 text-sm">
          <p>Take a quick assessment, receive a personalized ESG roadmap for your company and industry, and view an online analysis with downloadable reports.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
            <li>Industry-specific ESG insights</li>
            <li>Peer benchmarking</li>
            <li>Online and downloadable reports</li>
            <li>Practical next steps</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="default" size="sm" className="w-full" asChild>
          <Link to="/esg-launchpad">
            Start QuickStart Assessment <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
