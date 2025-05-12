
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { ESGLaunchpad } from "./ESGLaunchpad";

export function ESGLaunchpadCard() {
  const [showLaunchpad, setShowLaunchpad] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check if the user has already used the launchpad
  const hasUsedLaunchpad = localStorage.getItem("esg-launchpad-completed") === "true";

  if (dismissed || hasUsedLaunchpad) {
    return null;
  }

  return (
    <Card className="shadow-md border-primary/20">
      {!showLaunchpad ? (
        <>
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl flex items-center">
              <span className="bg-primary text-primary-foreground p-1 px-2 rounded-md mr-2">
                NEW
              </span>
              ESG Launchpad
            </CardTitle>
            <CardDescription>
              Get started with ESG in under 3 minutes and receive a personalized QuickStart report for your industry.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    1
                  </div>
                  <div>
                    Select your industry sector to see key ESG risks and opportunities.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    2
                  </div>
                  <div>
                    View anonymized peer snapshots and sector-specific insights.
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                    3
                  </div>
                  <div>
                    Generate your free personalized QuickStart report in seconds.
                  </div>
                </li>
              </ul>
              
              <Button 
                className="w-full" 
                onClick={() => setShowLaunchpad(true)}
              >
                Start ESG Launchpad <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </>
      ) : (
        <ESGLaunchpad />
      )}
    </Card>
  );
}
