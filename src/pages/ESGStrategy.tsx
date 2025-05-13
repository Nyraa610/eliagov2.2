
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, Rocket, Users, BarChart4, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ESGStrategy() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">ESG Strategy</h1>
          <p className="text-gray-600">
            Develop and manage your organization's ESG strategy and roadmap
          </p>
        </div>

        <Alert className="bg-blue-50 border-blue-200">
          <Rocket className="h-4 w-4" />
          <AlertTitle>Get Started</AlertTitle>
          <AlertDescription>
            Your ESG strategy helps align sustainability goals with business objectives. Start by defining your strategic priorities.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Strategic Goals</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileCheck className="h-5 w-5 mr-2 text-green-500" />
                    Strategic Priorities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Define your organization's ESG strategic priorities and align them with your business objectives.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-500" />
                    Stakeholder Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Engage with stakeholders to understand their expectations and integrate them into your strategy.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-2 text-purple-500" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Establish measurable KPIs to track progress toward your ESG goals and objectives.</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                    Implementation Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Create a realistic timeline for implementing your ESG initiatives and achieving your goals.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle>Strategic Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">This section will allow you to define and manage your ESG strategic goals.</p>
                <p className="text-muted-foreground">Feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stakeholders">
            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">This section will help you identify and prioritize stakeholders for your ESG strategy.</p>
                <p className="text-muted-foreground">Feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roadmap">
            <Card>
              <CardHeader>
                <CardTitle>ESG Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">This section will help you build a comprehensive roadmap for your ESG strategy implementation.</p>
                <p className="text-muted-foreground">Feature coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
